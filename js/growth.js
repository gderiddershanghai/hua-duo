import { BABY, WEIGHT } from './data.js';
import { el, mkSvg } from './svg.js';
import { linearRegression } from './predict.js';
import { t, fmtDayLabel } from './i18n.js';

export function render() {
  const pane = document.getElementById('pane-growth');
  const latest = WEIGHT[WEIGHT.length - 1];
  const changeG = Math.round((latest.weight - BABY.birthWeight) * 1000);
  const sign = changeG >= 0 ? '+' : '';

  const logHtml = WEIGHT.slice().reverse().map((w, i) => {
    let note = '';
    if (w.day === 0) {
      note = t('birth');
    } else {
      const prev = WEIGHT[WEIGHT.length - 1 - i - 1];
      if (prev) {
        const diff = Math.round((w.weight - prev.weight) * 1000);
        if (diff >= 0) note = `▲ +${diff}g`;
        else note = `▼ ${diff}g`;
      }
    }
    const lengthBit = w.length ? ` · ${w.length} cm` : '';
    return `
      <div class="log-item">
        <div class="log-time">${fmtDayLabel(w.day)}</div>
        <div class="tags">
          <span class="tag tf">${w.weight} kg${lengthBit}</span>
          <span style="font-size:12px;color:var(--mut);padding-top:3px">${note}</span>
        </div>
      </div>`;
  }).join('');

  pane.innerHTML = `
    <div class="section">
      <div class="wstats">
        <div class="wstat">
          <div class="wstat-val">${latest.weight}<span style="font-size:11px;font-weight:500"> kg</span></div>
          <div class="wstat-lbl">${t('latest')}</div>
        </div>
        <div class="wstat">
          <div class="wstat-val ${changeG >= 0 ? 'pos' : ''}">${sign}${changeG}<span style="font-size:11px;font-weight:500"> g</span></div>
          <div class="wstat-lbl">${t('sinceBirth')}</div>
        </div>
        <div class="wstat">
          <div class="wstat-val">&gt;P90</div>
          <div class="wstat-lbl">${t('whoPercentile')}</div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="slabel">${t('weightLbl')}</div>
      <div class="chart-card" id="weight-chart">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <p style="margin:0">${t('whoRef')}</p>
          <div class="legend" style="margin:0">
            <div class="legend-item" style="gap:4px"><span style="display:inline-block;width:16px;border-top:2px dashed var(--acc);opacity:0.55"></span><span style="font-size:10px">${t('predictionLbl')}</span></div>
          </div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="slabel">${t('lengthLbl')}</div>
      <div class="height-note">
        <div class="height-note-icon">📏</div>
        <div>
          <div class="height-note-val">${BABY.birthLength} cm <span style="font-size:13px;font-weight:500;color:var(--mut)">${t('atBirth')}</span></div>
          <div class="height-note-sub">${t('approxP')}</div>
        </div>
      </div>
    </div>
    <div class="section">
      <div class="slabel">${t('weightLog')}</div>
      <div class="log">${logHtml}</div>
    </div>
  `;

  renderWeightChart();
}

function niceStep(range, maxTicks) {
  const raw = range / maxTicks;
  const nice = [0.1, 0.2, 0.25, 0.5, 1, 2, 5, 7, 10, 14, 30, 60, 90];
  for (const n of nice) { if (n >= raw) return n; }
  return Math.ceil(raw);
}

function renderWeightChart() {
  const container = document.getElementById('weight-chart');
  const W = 310, H = 180;
  const X0 = 40, X1 = 268;
  const Y_TOP = 16, Y_BOT = 145;

  const maxDay = WEIGHT[WEIGHT.length - 1].day;
  const PRED_DAYS = 4;
  const xMax = maxDay + PRED_DAYS;

  const allW = WEIGHT.map(w => w.weight);
  const KG_MIN_RAW = Math.min(...allW) - 0.15;
  const KG_MAX_RAW = Math.max(...allW) + 0.25;
  const yStep = niceStep(KG_MAX_RAW - KG_MIN_RAW, 6);
  const KG_MIN = Math.floor(KG_MIN_RAW / yStep) * yStep;
  const KG_MAX = Math.ceil(KG_MAX_RAW / yStep) * yStep;

  const yOf = kg => Y_BOT - (kg - KG_MIN) / (KG_MAX - KG_MIN) * (Y_BOT - Y_TOP);
  const xOf = day => X0 + (day / xMax) * (X1 - X0);

  const s = mkSvg(`0 0 ${W} ${H}`);

  // Clip
  const defs = el('defs', {});
  const cp = el('clipPath', { id: 'wc' });
  cp.appendChild(el('rect', { x: X0, y: Y_TOP - 5, width: X1 - X0 + 30, height: Y_BOT - Y_TOP + 10 }));
  defs.appendChild(cp);
  s.appendChild(defs);

  // Y grid + labels
  for (let kg = KG_MIN; kg <= KG_MAX + 0.001; kg += yStep) {
    const y = yOf(kg);
    s.appendChild(el('line', { x1: X0, y1: y, x2: X1, y2: y, 'stroke-width': 0.5 }, 'cgd'));
    const label = el('text', { x: X0 - 4, y: y + 3, 'text-anchor': 'end', 'font-size': 9 }, 'ct');
    label.textContent = kg.toFixed(1);
    s.appendChild(label);
  }

  // X axis line
  s.appendChild(el('line', { x1: X0, y1: Y_BOT, x2: X1, y2: Y_BOT, 'stroke-width': 1 }, 'cg'));

  // X ticks + labels (max 6, dynamic, i18n dates)
  const xStep = niceStep(xMax, 6);
  for (let d = 0; d <= xMax; d += xStep) {
    const x = xOf(d);
    s.appendChild(el('line', { x1: x, y1: Y_BOT, x2: x, y2: Y_BOT + 4, 'stroke-width': 1 }, 'cg'));
    const label = el('text', { x, y: H - 5, 'text-anchor': 'middle', 'font-size': 8 }, 'ct');
    label.textContent = fmtDayLabel(d);
    s.appendChild(label);
  }

  // WHO percentile lines
  const WHO = [
    { label: 'P75', d0: 3.70, d14: 3.90 },
    { label: 'P90', d0: 4.00, d14: 4.20 },
    { label: 'P97', d0: 4.30, d14: 4.55 },
  ];
  WHO.forEach(p => {
    const dEnd = p.d0 + (p.d14 - p.d0) * (xMax / 14);
    s.appendChild(el('polyline', {
      points: `${xOf(0)},${yOf(p.d0)} ${xOf(xMax)},${yOf(dEnd)}`,
      'stroke-width': p.label === 'P90' ? 1.5 : 1,
      'clip-path': 'url(#wc)',
    }, 'cp'));
    const label = el('text', { x: X1 + 6, y: yOf(dEnd) + 3, 'font-size': 8 }, 'ct');
    label.textContent = p.label;
    s.appendChild(label);
  });

  // Prediction line
  const regPts = WEIGHT.map(w => ({ x: w.day, y: w.weight }));
  const reg = linearRegression(regPts);
  if (reg) {
    const lastW = WEIGHT[WEIGHT.length - 1];
    const predEnd = maxDay + PRED_DAYS;
    const predEndY = lastW.weight + reg.slope * PRED_DAYS;
    s.appendChild(el('polyline', {
      points: `${xOf(lastW.day)},${yOf(lastW.weight)} ${xOf(predEnd)},${yOf(predEndY)}`,
      'stroke-width': 2, 'clip-path': 'url(#wc)',
    }, 'pred'));
    const pt = el('text', { x: xOf(predEnd) + 2, y: yOf(predEndY) + 3, 'font-size': 8 }, 'ct');
    pt.textContent = `~${predEndY.toFixed(2)}`;
    s.appendChild(pt);
  }

  // Baby line
  const pts = WEIGHT.map(w => `${xOf(w.day)},${yOf(w.weight)}`).join(' ');
  s.appendChild(el('polyline', { points: pts, 'stroke-width': 2.5, 'clip-path': 'url(#wc)' }, 'cl'));

  // Dots
  WEIGHT.forEach((w, i) => {
    const last = i === WEIGHT.length - 1;
    s.appendChild(el('circle', {
      cx: xOf(w.day), cy: yOf(w.weight), r: last ? 5 : 3.5,
      ...(last ? { 'stroke-width': 2 } : {}),
    }, last ? 'cdl' : 'cd'));
  });

  // Latest label
  const lw = WEIGHT[WEIGHT.length - 1];
  const lt = el('text', {
    x: xOf(lw.day), y: yOf(lw.weight) - 8, 'text-anchor': 'middle', 'font-size': 10,
  }, 'clbl');
  lt.textContent = lw.weight + ' kg';
  s.appendChild(lt);

  container.appendChild(s);
}
