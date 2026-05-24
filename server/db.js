import { sql } from '@vercel/postgres';

// ===== Schema bootstrap =====
// Creates tables if they don't exist — runs on first request.

let schemaReady = false;

async function ensureSchema() {
  if (schemaReady) return;
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id          SERIAL PRIMARY KEY,
      date        DATE        NOT NULL,
      time        TIME        NOT NULL,
      breastfed   BOOLEAN     NOT NULL DEFAULT false,
      formula_ml  INTEGER     NOT NULL DEFAULT 0,
      poop        BOOLEAN     NOT NULL DEFAULT false,
      pee         BOOLEAN     NOT NULL DEFAULT false,
      note        TEXT        NOT NULL DEFAULT ''
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS baby_weight (
      id         SERIAL PRIMARY KEY,
      date       DATE          NOT NULL,
      weight_kg  NUMERIC(5,2) NOT NULL,
      length_cm  NUMERIC(5,1)
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS dad_weight (
      id         SERIAL PRIMARY KEY,
      date       DATE          NOT NULL,
      weight_kg  NUMERIC(5,2) NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS mom_weight (
      id         SERIAL PRIMARY KEY,
      date       DATE          NOT NULL,
      weight_kg  NUMERIC(5,2) NOT NULL
    )`;
  await sql`
    CREATE TABLE IF NOT EXISTS skin (
      id         SERIAL PRIMARY KEY,
      date       DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time   TIME NOT NULL,
      bath       BOOLEAN NOT NULL DEFAULT false
    )`;
  schemaReady = true;
}

// ===== Events =====

export async function readEvents() {
  await ensureSchema();
  const { rows } = await sql`
    SELECT date::text, time::text, breastfed, formula_ml, poop, pee, note
    FROM events ORDER BY date, time`;
  return rows.map(r => ({
    date:       r.date.slice(0, 10),
    time:       r.time.slice(0, 5),
    breastfed:  r.breastfed,
    formula_ml: r.formula_ml,
    poop:       r.poop,
    pee:        r.pee,
    note:       r.note || '',
  }));
}

export async function appendEvent(event) {
  await ensureSchema();
  await sql`
    INSERT INTO events (date, time, breastfed, formula_ml, poop, pee, note)
    VALUES (${event.date}, ${event.time}, ${event.breastfed},
            ${event.formula_ml}, ${event.poop}, ${event.pee}, ${event.note})`;
}

// ===== Baby weight =====

export async function readBabyWeight() {
  await ensureSchema();
  const { rows } = await sql`
    SELECT date::text, weight_kg, length_cm
    FROM baby_weight ORDER BY date`;
  return rows.map(r => ({
    date:      r.date.slice(0, 10),
    weight_kg: Number(r.weight_kg),
    length_cm: r.length_cm ? Number(r.length_cm) : null,
  }));
}

export async function appendBabyWeight(entry) {
  await ensureSchema();
  await sql`
    INSERT INTO baby_weight (date, weight_kg, length_cm)
    VALUES (${entry.date}, ${entry.weight_kg}, ${entry.length_cm ?? null})`;
}

// ===== Dad weight =====

export async function readDadWeight() {
  await ensureSchema();
  const { rows } = await sql`
    SELECT date::text, weight_kg FROM dad_weight ORDER BY date`;
  return rows.map(r => ({
    date:      r.date.slice(0, 10),
    weight_kg: Number(r.weight_kg),
  }));
}

export async function appendDadWeight(entry) {
  await ensureSchema();
  await sql`
    INSERT INTO dad_weight (date, weight_kg)
    VALUES (${entry.date}, ${entry.weight_kg})`;
}

// ===== Mom weight =====

export async function readMomWeight() {
  await ensureSchema();
  const { rows } = await sql`
    SELECT date::text, weight_kg FROM mom_weight ORDER BY date`;
  return rows.map(r => ({
    date:      r.date.slice(0, 10),
    weight_kg: Number(r.weight_kg),
  }));
}

export async function appendMomWeight(entry) {
  await ensureSchema();
  await sql`
    INSERT INTO mom_weight (date, weight_kg)
    VALUES (${entry.date}, ${entry.weight_kg})`;
}

// ===== Skin =====

export async function readSkin() {
  await ensureSchema();
  const { rows } = await sql`
    SELECT date::text, start_time::text, end_time::text, bath
    FROM skin ORDER BY date, start_time`;
  return rows.map(r => ({
    date:       r.date.slice(0, 10),
    start_time: r.start_time.slice(0, 5),
    end_time:   r.end_time.slice(0, 5),
    bath:       r.bath,
  }));
}

export async function appendSkin(entry) {
  await ensureSchema();
  await sql`
    INSERT INTO skin (date, start_time, end_time, bath)
    VALUES (${entry.date}, ${entry.start_time}, ${entry.end_time}, ${entry.bath})`;
}
