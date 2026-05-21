// ===== Constants =====

const BABY = {
  name: '花朵',
  dob: '2026-05-12',
  birthWeight: 4.25,
  birthLength: 51,
};

const PARENT_CONFIG = {
  dad: { name: 'Ginger', start: 90.0, goal: 85.0 },
  mom: { name: '华夏',   start: 77.0, goal: 57.0 },
};

// Days that are "partial from the start" (excluded from WEEKLY/PATTERN averages).
// May 15 was the first partial day — yuesao started recording at 13:00.
const PATTERN_START_DATE = '2026-05-16';

const FEED_DUR  = 0.5;   // 30 min per feed
const SETTLE    = 0.25;  // 15 min awake after feed / after skin
const MIN_SLEEP = 0.15;  // ~9 min — skip blocks shorter than this

// ===== Utility =====

function timeToH(str) {
  const [h, m] = str.split(':').map(Number);
  return h + m / 60;
}

function r2(n) { return Math.round(n * 100) / 100; }
function r1(n) { return Math.round(n * 10)  / 10;  }

function dateToDay(dateStr) {
  const dob  = new Date(BABY.dob);
  const date = new Date(dateStr);
  return Math.round((date - dob) / 86400000);
}

// A day is considered "partial at the end" if no event falls at or after 22:00.
function isPartialDay(dayEvents) {
  return dayEvents.every(e => timeToH(e.time) < 22);
}

// ===== Sleep block computation =====
//
// Strategy: build a list of "awake windows" from feeds and skin sessions,
// merge overlapping windows, then invert to get sleep blocks.
//
// Each feed creates:  [feedH - SETTLE, feedH + FEED_DUR + SETTLE]
// Each skin session:  [startH, endH + SETTLE]
// Partial days:       [lastEventH + FEED_DUR + SETTLE, 24]  (assume awake to midnight)

function computeSleepBlocks(feedTimes, skinWindows, partial) {
  const awake = [];

  for (const f of feedTimes) {
    awake.push([Math.max(0, f - SETTLE), Math.min(24, f + FEED_DUR + SETTLE)]);
  }
  for (const sk of skinWindows) {
    awake.push([sk.startH, Math.min(24, sk.endH + SETTLE)]);
  }
  if (partial && feedTimes.length) {
    const lastH = feedTimes[feedTimes.length - 1] + FEED_DUR + SETTLE;
    awake.push([lastH, 24]);
  }

  // Sort and merge overlapping awake windows
  awake.sort((a, b) => a[0] - b[0]);
  const merged = [];
  for (const [s, e] of awake) {
    if (!merged.length || s > merged[merged.length - 1][1]) {
      merged.push([s, e]);
    } else {
      merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], e);
    }
  }

  // Invert awake windows to get sleep blocks
  const sleeps = [];
  let cursor = 0;
  for (const [awakeS, awakeE] of merged) {
    if (awakeS - cursor >= MIN_SLEEP) {
      sleeps.push([r2(cursor), r2(awakeS)]);
    }
    cursor = awakeE;
  }
  if (!partial && 24 - cursor >= MIN_SLEEP) {
    sleeps.push([r2(cursor), 24]);
  }

  return sleeps;
}

// ===== PATTERN =====

function computePattern(events, skin) {
  const dates = [...new Set(events.map(e => e.date))]
    .filter(d => d >= PATTERN_START_DATE)
    .sort();

  return dates.map(date => {
    const dayEvents = events.filter(e => e.date === date);
    const partial   = isPartialDay(dayEvents);

    const feedTimes = dayEvents
      .filter(e => e.breastfed || e.formula_ml > 0)
      .map(e => timeToH(e.time))
      .sort((a, b) => a - b);

    const skinEntries = skin
      .filter(s => s.date === date)
      .map(s => ({ startH: timeToH(s.start_time), endH: timeToH(s.end_time), bath: s.bath }));

    const skinWindows = skinEntries.map(s => ({ startH: s.startH, endH: s.endH }));
    const sleeps      = computeSleepBlocks(feedTimes, skinWindows, partial);

    const feeds = dayEvents
      .filter(e => e.breastfed || e.formula_ml > 0)
      .map(e => ({
        h:       r2(timeToH(e.time)),
        dur:     FEED_DUR,
        formula: e.formula_ml > 0 ? e.formula_ml : null,
      }));

    const skinOut = skinEntries.map(s => ({
      h:   r2(s.startH),
      dur: r2(s.endH - s.startH),
    }));

    const markers = skinEntries
      .filter(s => s.bath)
      .map(s => ({ h: r2(s.startH), emoji: '🛁' }));

    const entry = {
      label: `May ${new Date(date).getDate()}`,
      day:   dateToDay(date),
      sleeps,
      feeds,
      skin:  skinOut.length ? skinOut : undefined,
      markers: markers.length ? markers : undefined,
    };
    if (partial) entry.partial = true;
    if (!entry.skin)    delete entry.skin;
    if (!entry.markers) delete entry.markers;

    return entry;
  });
}

// ===== WEEKLY =====

function computeWeekly(events, pattern) {
  return pattern.map(p => {
    const date      = new Date(BABY.dob);
    date.setDate(date.getDate() + p.day);
    const dateStr   = date.toISOString().slice(0, 10);
    const dayEvents = events.filter(e => e.date === dateStr);

    const feeds     = dayEvents.filter(e => e.breastfed || e.formula_ml > 0).length;
    const formulaMl = dayEvents.reduce((s, e) => s + e.formula_ml, 0);
    const poops     = dayEvents.filter(e => e.poop).length;
    const pees      = dayEvents.filter(e => e.pee).length;
    const sleepH    = r1(p.sleeps.reduce((s, [a, b]) => s + (b - a), 0));
    const dayNum    = new Date(dateStr).getDate();

    const row = { day: dayNum, label: String(dayNum), feeds, formulaMl, poops, pees, sleepH };
    if (p.partial) row.partial = true;
    return row;
  });
}

// ===== LOG =====

function computeLog(events) {
  const dates = [...new Set(events.map(e => e.date))].sort().reverse();

  return dates.map(date => {
    const dayEvents = events.filter(e => e.date === date);
    const partial   = isPartialDay(dayEvents);

    const evts = dayEvents.map(e => {
      const tags = [];
      if (e.breastfed || e.formula_ml > 0) {
        let text = '🤱 fed';
        if (e.formula_ml > 0) text += ` + ${e.formula_ml}ml`;
        if (e.note) text = `🤱 ${e.note} + ${e.formula_ml}ml`;
        tags.push({ cls: 'tf', text });
      }
      if (e.poop) tags.push({ cls: 'td', text: '💩' });
      if (e.pee)  tags.push({ cls: 'td', text: '💧' });
      return { time: e.time, tags };
    });

    const entry = {
      date,
      label: `May ${new Date(date).getDate()}`,
      day:   dateToDay(date),
      events: evts,
    };
    if (partial) entry.partial = true;
    return entry;
  });
}

// ===== WEIGHT =====

function computeWeight(babyWeight) {
  return babyWeight.map(w => {
    const day   = dateToDay(w.date);
    const entry = { day, label: `May ${new Date(w.date).getDate()}`, weight: w.weight_kg };
    if (w.length_cm) entry.length = w.length_cm;
    return entry;
  });
}

// ===== PARENT WEIGHT =====

function computeParents(parentWeight) {
  const result = {};
  for (const [key, cfg] of Object.entries(PARENT_CONFIG)) {
    const entries = parentWeight
      .filter(r => r.person === key)
      .sort((a, b) => a.date.localeCompare(b.date))
      .map(r => ({ day: dateToDay(r.date), label: `May ${new Date(r.date).getDate()}`, weight: r.weight_kg }));

    result[key] = { ...cfg, entries };
  }
  return result;
}

// ===== Main export =====

export function getAllData(events, babyWeight, parentWeight, skin) {
  const pattern = computePattern(events, skin);
  return {
    baby:         BABY,
    weekly:       computeWeekly(events, pattern),
    pattern,
    weight:       computeWeight(babyWeight),
    log:          computeLog(events),
    parentWeight: computeParents(parentWeight),
  };
}
