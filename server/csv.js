import { readFileSync, writeFileSync, appendFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
export const DATA_DIR = join(__dirname, '..', 'data');

if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });

// ===== Core CSV helpers =====

function parseCsv(filename) {
  const filepath = join(DATA_DIR, filename);
  if (!existsSync(filepath)) return [];
  const lines = readFileSync(filepath, 'utf8').trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1)
    .filter(l => l.trim())
    .map(line => {
      const values = line.split(',');
      const obj = {};
      headers.forEach((h, i) => { obj[h] = (values[i] ?? '').trim(); });
      return obj;
    });
}

function appendCsvRow(filename, headers, row) {
  const filepath = join(DATA_DIR, filename);
  if (!existsSync(filepath)) {
    writeFileSync(filepath, headers.join(',') + '\n', 'utf8');
  }
  appendFileSync(filepath, row.join(',') + '\n', 'utf8');
}

// ===== Events =====

export function readEvents() {
  return parseCsv('events.csv').map(r => ({
    date:       r.date,
    time:       r.time,
    breastfed:  r.breastfed === '1',
    formula_ml: Number(r.formula_ml) || 0,
    poop:       r.poop === '1',
    pee:        r.pee  === '1',
    note:       r.note || '',
  }));
}

export function appendEvent(event) {
  appendCsvRow(
    'events.csv',
    ['date', 'time', 'breastfed', 'formula_ml', 'poop', 'pee', 'note'],
    [
      event.date,
      event.time,
      event.breastfed  ? 1 : 0,
      event.formula_ml || 0,
      event.poop ? 1 : 0,
      event.pee  ? 1 : 0,
      event.note || '',
    ],
  );
}

// ===== Baby weight =====

export function readBabyWeight() {
  return parseCsv('baby_weight.csv').map(r => ({
    date:      r.date,
    weight_kg: Number(r.weight_kg),
    length_cm: r.length_cm ? Number(r.length_cm) : null,
  }));
}

export function appendBabyWeight(entry) {
  appendCsvRow(
    'baby_weight.csv',
    ['date', 'weight_kg', 'length_cm'],
    [entry.date, entry.weight_kg, entry.length_cm ?? ''],
  );
}

// ===== Dad weight =====

export function readDadWeight() {
  return parseCsv('dad_weight.csv').map(r => ({
    date:      r.date,
    weight_kg: Number(r.weight_kg),
  }));
}

export function appendDadWeight(entry) {
  appendCsvRow(
    'dad_weight.csv',
    ['date', 'weight_kg'],
    [entry.date, entry.weight_kg],
  );
}

// ===== Mom weight =====

export function readMomWeight() {
  return parseCsv('mom_weight.csv').map(r => ({
    date:      r.date,
    weight_kg: Number(r.weight_kg),
  }));
}

export function appendMomWeight(entry) {
  appendCsvRow(
    'mom_weight.csv',
    ['date', 'weight_kg'],
    [entry.date, entry.weight_kg],
  );
}

// ===== Skin / bath =====

export function readSkin() {
  return parseCsv('skin.csv').map(r => ({
    date:       r.date,
    start_time: r.start_time,
    end_time:   r.end_time,
    bath:       r.bath === '1',
  }));
}

export function appendSkin(entry) {
  appendCsvRow(
    'skin.csv',
    ['date', 'start_time', 'end_time', 'bath'],
    [entry.date, entry.start_time, entry.end_time, entry.bath ? 1 : 0],
  );
}
