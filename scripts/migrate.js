// One-time migration: reads all CSV files and inserts into Postgres.
// Run with: node --env-file=.env scripts/migrate.js

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { sql } from '@vercel/postgres';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR  = join(__dirname, '..', 'data');

// ===== CSV parser =====

function parseCsv(filename) {
  const filepath = join(DATA_DIR, filename);
  if (!existsSync(filepath)) { console.log(`  skipping ${filename} (not found)`); return []; }
  const lines = readFileSync(filepath, 'utf8').trim().split('\n');
  if (lines.length < 2) return [];
  const headers = lines[0].split(',').map(h => h.trim());
  return lines.slice(1).filter(l => l.trim()).map(line => {
    const values = line.split(',');
    const obj = {};
    headers.forEach((h, i) => { obj[h] = (values[i] ?? '').trim(); });
    return obj;
  });
}

// ===== Schema =====

async function createSchema() {
  console.log('Creating tables...');
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id          SERIAL PRIMARY KEY,
      date        DATE        NOT NULL,
      time        TIME        NOT NULL,
      breastfed   BOOLEAN     NOT NULL DEFAULT false,
      formula_ml  INTEGER     NOT NULL DEFAULT 0,
      poop        BOOLEAN     NOT NULL DEFAULT false,
      pee         BOOLEAN     NOT NULL DEFAULT false,
      note        TEXT        NOT NULL DEFAULT '',
      UNIQUE (date, time)
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS baby_weight (
      id         SERIAL PRIMARY KEY,
      date       DATE          NOT NULL UNIQUE,
      weight_kg  NUMERIC(5,2) NOT NULL,
      length_cm  NUMERIC(5,1)
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS dad_weight (
      id         SERIAL PRIMARY KEY,
      date       DATE          NOT NULL UNIQUE,
      weight_kg  NUMERIC(5,2) NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS mom_weight (
      id         SERIAL PRIMARY KEY,
      date       DATE          NOT NULL UNIQUE,
      weight_kg  NUMERIC(5,2) NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS skin (
      id         SERIAL PRIMARY KEY,
      date       DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time   TIME NOT NULL,
      bath       BOOLEAN NOT NULL DEFAULT false,
      UNIQUE (date, start_time)
    )`;
  console.log('Tables ready.');
}

// ===== Migrate =====

async function migrateEvents() {
  const rows = parseCsv('events.csv');
  console.log(`Migrating ${rows.length} events...`);
  for (const r of rows) {
    await sql`
      INSERT INTO events (date, time, breastfed, formula_ml, poop, pee, note)
      VALUES (${r.date}, ${r.time}, ${r.breastfed === '1'},
              ${Number(r.formula_ml) || 0}, ${r.poop === '1'},
              ${r.pee === '1'}, ${r.note || ''})
      ON CONFLICT (date, time) DO NOTHING`;
  }
  console.log(`  ✓ ${rows.length} events`);
}

async function migrateBabyWeight() {
  const rows = parseCsv('baby_weight.csv');
  console.log(`Migrating ${rows.length} baby weight entries...`);
  for (const r of rows) {
    await sql`
      INSERT INTO baby_weight (date, weight_kg, length_cm)
      VALUES (${r.date}, ${Number(r.weight_kg)}, ${r.length_cm ? Number(r.length_cm) : null})
      ON CONFLICT (date) DO NOTHING`;
  }
  console.log(`  ✓ ${rows.length} baby weight entries`);
}

async function migrateDadWeight() {
  const rows = parseCsv('dad_weight.csv');
  console.log(`Migrating ${rows.length} dad weight entries...`);
  for (const r of rows) {
    await sql`
      INSERT INTO dad_weight (date, weight_kg)
      VALUES (${r.date}, ${Number(r.weight_kg)})
      ON CONFLICT (date) DO NOTHING`;
  }
  console.log(`  ✓ ${rows.length} dad weight entries`);
}

async function migrateMomWeight() {
  const rows = parseCsv('mom_weight.csv');
  console.log(`Migrating ${rows.length} mom weight entries...`);
  for (const r of rows) {
    await sql`
      INSERT INTO mom_weight (date, weight_kg)
      VALUES (${r.date}, ${Number(r.weight_kg)})
      ON CONFLICT (date) DO NOTHING`;
  }
  console.log(`  ✓ ${rows.length} mom weight entries`);
}

async function migrateSkin() {
  const rows = parseCsv('skin.csv');
  console.log(`Migrating ${rows.length} skin entries...`);
  for (const r of rows) {
    await sql`
      INSERT INTO skin (date, start_time, end_time, bath)
      VALUES (${r.date}, ${r.start_time}, ${r.end_time}, ${r.bath === '1'})
      ON CONFLICT (date, start_time) DO NOTHING`;
  }
  console.log(`  ✓ ${rows.length} skin entries`);
}

// ===== Run =====

async function main() {
  console.log('Starting migration...\n');
  try {
    await createSchema();
    await migrateEvents();
    await migrateBabyWeight();
    await migrateDadWeight();
    await migrateMomWeight();
    await migrateSkin();
    console.log('\nMigration complete.');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
  process.exit(0);
}

main();
