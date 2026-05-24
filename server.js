import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import multer from 'multer';
import { readEvents, readBabyWeight, readDadWeight, readMomWeight, readSkin,
         appendEvent, appendBabyWeight, appendDadWeight, appendMomWeight } from './server/db.js';
import { getAllData } from './server/aggregate.js';
import { parseImage, parseText } from './server/parse.js';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static frontend files (HTML, CSS, JS, assets)
app.use(express.static(join(__dirname, '.')));
app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', baby: '花朵' });
});

// All data for the frontend — reads DB, computes aggregates, returns JSON
app.get('/api/data', async (req, res) => {
  try {
    const [events, babyWeight, dadWeight, momWeight, skin] = await Promise.all([
      readEvents(),
      readBabyWeight(),
      readDadWeight(),
      readMomWeight(),
      readSkin(),
    ]);
    const data = getAllData(events, babyWeight, dadWeight, momWeight, skin);
    res.json(data);
  } catch (err) {
    console.error('/api/data error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ===== Write endpoints =====

// POST /api/events  — { date, time, breastfed, formula_ml, poop, pee, note? }
app.post('/api/events', async (req, res) => {
  try {
    const { date, time, breastfed, formula_ml, poop, pee, note } = req.body;
    if (!date || !time) return res.status(400).json({ error: 'date and time are required' });

    await appendEvent({
      date,
      time,
      breastfed:  Boolean(breastfed),
      formula_ml: Number(formula_ml) || 0,
      poop:       Boolean(poop),
      pee:        Boolean(pee),
      note:       note || '',
    });
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/events error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/weight/baby  — { date, weight_kg, length_cm? }
app.post('/api/weight/baby', async (req, res) => {
  try {
    const { date, weight_kg, length_cm } = req.body;
    if (!date || !weight_kg) return res.status(400).json({ error: 'date and weight_kg are required' });

    await appendBabyWeight({ date, weight_kg: Number(weight_kg), length_cm: length_cm ? Number(length_cm) : null });
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/weight/baby error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/weight/parent  — { date, person, weight_kg }
app.post('/api/weight/parent', async (req, res) => {
  try {
    const { date, person, weight_kg } = req.body;
    if (!date || !person || !weight_kg) return res.status(400).json({ error: 'date, person, and weight_kg are required' });
    if (!['dad', 'mom'].includes(person)) return res.status(400).json({ error: 'person must be "dad" or "mom"' });

    const appendFn = person === 'dad' ? appendDadWeight : appendMomWeight;
    await appendFn({ date, weight_kg: Number(weight_kg) });
    res.json({ ok: true });
  } catch (err) {
    console.error('POST /api/weight/parent error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/parse/image — multipart: field "image" (file) + optional "date"
// Returns parsed days for preview — does NOT save automatically
app.post('/api/parse/image', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image file uploaded' });
    const days = await parseImage(req.file.buffer, req.file.mimetype);
    res.json({ days });
  } catch (err) {
    console.error('POST /api/parse/image error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST /api/parse/text — { text, date? }
// Returns parsed days for preview — does NOT save automatically
app.post('/api/parse/text', async (req, res) => {
  try {
    const { text, date } = req.body;
    if (!text) return res.status(400).json({ error: 'text is required' });
    const today = date || new Date().toISOString().slice(0, 10);
    const days  = await parseText(text, today);
    res.json({ days });
  } catch (err) {
    console.error('POST /api/parse/text error:', err);
    res.status(500).json({ error: err.message });
  }
});

// Export for Vercel (serverless handler)
export default app;

// Start server locally (not on Vercel)
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Baby tracker running at http://localhost:${PORT}`);
  });
}
