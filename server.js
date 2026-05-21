import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readEvents, readBabyWeight, readParentWeight, readSkin } from './server/csv.js';
import { getAllData } from './server/aggregate.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

// Serve all static frontend files (HTML, CSS, JS, assets)
app.use(express.static(join(__dirname, '.')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', baby: '花朵' });
});

// All data for the frontend — reads CSVs, computes aggregates, returns JSON
app.get('/api/data', (req, res) => {
  try {
    const data = getAllData(
      readEvents(),
      readBabyWeight(),
      readParentWeight(),
      readSkin(),
    );
    res.json(data);
  } catch (err) {
    console.error('/api/data error:', err);
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Baby tracker running at http://localhost:${PORT}`);
});
