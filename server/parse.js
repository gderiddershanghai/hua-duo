import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import OpenAI from 'openai';

const __dirname = dirname(fileURLToPath(import.meta.url));

const OCR_PROMPT = readFileSync(join(__dirname, '..', 'prompts', 'ocr-parse.txt'), 'utf8');
const NL_PROMPT  = readFileSync(join(__dirname, '..', 'prompts', 'nl-parse.txt'),  'utf8');

function getClient() {
  if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY not set');
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

// ===== Normalise OCR response → our event schema =====
// OCR prompt returns: [{ date, events: [{ time, breastfeed, formula_ml, poop, pee, notes }] }]

function normaliseOcrDay(day) {
  return {
    date:   day.date,
    events: (day.events || []).map(e => ({
      date:       day.date,
      time:       e.time,
      breastfed:  e.breastfeed === true,
      formula_ml: Number(e.formula_ml) || 0,
      poop:       e.poop  === true,
      pee:        e.pee   === true,
      note:       e.notes || '',
      uncertain:  e.uncertain || false,
    })),
  };
}

// ===== Normalise NL response → our event schema =====
// NL prompt returns: { date, events: [{ time, type, formula_ml, ... }] }
// We fold multi-type events (feed + poop + pee) that share the same time into one row.

function normaliseNlDay(parsed) {
  const byTime = {};

  for (const e of (parsed.events || [])) {
    const key = e.time || 'null';
    if (!byTime[key]) {
      byTime[key] = {
        date:       parsed.date,
        time:       e.time,
        breastfed:  false,
        formula_ml: 0,
        poop:       false,
        pee:        false,
        note:       '',
      };
    }
    const row = byTime[key];
    if (e.type === 'feed')  { row.breastfed = true; row.formula_ml = Number(e.formula_ml) || 0; }
    if (e.type === 'poop')  { row.poop = true; }
    if (e.type === 'pee')   { row.pee  = true; }
    if (e.type === 'note')  { row.note = e.notes || e.text || ''; }
    if (e.notes)            { row.note = [row.note, e.notes].filter(Boolean).join('; '); }
  }

  return {
    date:   parsed.date,
    events: Object.values(byTime).sort((a, b) => {
      const toMin = t => t ? Number(t.split(':')[0]) * 60 + Number(t.split(':')[1]) : 0;
      return toMin(a.time) - toMin(b.time);
    }),
  };
}

// ===== Public API =====

export async function parseImage(buffer, mimeType) {
  const client = getClient();
  const base64 = buffer.toString('base64');

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: OCR_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
          { type: 'text',      text: 'Parse this yuesao daily log. Return only JSON.' },
        ],
      },
    ],
  });

  const raw = JSON.parse(completion.choices[0].message.content);
  // Model may return array directly or wrap it
  const days = Array.isArray(raw) ? raw : (raw.days || raw.data || [raw]);
  return days.map(normaliseOcrDay);
}

export async function parseText(text, todayDate) {
  const client = getClient();

  const completion = await client.chat.completions.create({
    model: 'gpt-4o',
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: NL_PROMPT },
      {
        role: 'user',
        content: `Today's date is ${todayDate}.\n\n${text}`,
      },
    ],
  });

  const raw = JSON.parse(completion.choices[0].message.content);
  return [normaliseNlDay(raw)];
}
