import { PARENT_WEIGHT } from './data.js';
import { el, mkSvg } from './svg.js';
import { linearRegression } from './predict.js';
import { t, fmtDayLabel } from './i18n.js';

export function render() {
  const pane = document.getElementById('pane-parents');
  pane.innerHTML = `
    <div class="section">
      <div class="slabel">${t('weightJourney')}</div>
      <div class="parent-section" id="parent-dad"></div>
      <div class="parent-section" id="parent-mom"></div>
    </div>
  `;

  renderParent('parent-dad', PARENT_WEIGHT.dad, 'assets/ginger.png');
  renderParent('parent-mom', PARENT_WEIGHT.mom, 'assets/summer.png');
}

function niceStep(range, maxTicks) {
  const raw = range / maxTicks;
  const nice = [0.1, 0.2, 0.5, 1, 2, 5, 7, 10, 14, 30, 60, 90];
  for (const n of nice) { if (n >= raw) return n; }
  return Math.ceil(raw);
}

function renderParent(containerId, data, avatarSrc) {
  const container = document.getElementById(containerId);
  const entries = data.entries;
  const latest = entries[entries.length - 1];
  const lost = data.start - latest.weight;
  const totalToLose = data.start - data.goal;
  const pct = totalToLose > 0 ? Math.min(Math.round((lost / totalToLose) * 100), 100) : 0;

  const pts = entries.map(e => ({ x: e.day, y: e.weight }));
  const reg = linearRegression(pts);
  let predLabel = '';
  if (reg && reg.slope < 0) {
    const daysToGoal = Math.round((data.goal - latest.weight) / reg.slope);
    if (daysToGoal > 0 && daysToGoal < 365) {
      predLabel = t('daysToGoal')(daysToGoal);
    }
  }
  if (!predLabel && lost <= 0) {
    predLabel = t('notStarted');
  }

  container.innerHTML = `
    <div class="parent-header">
      <img src="${avatarSrc}" alt="${data.name}" class="parent-avatar">
      <div>
        <h3>${data.name}</h3>
        <div class="sub">${predLabel}</div>
      </div>
      <div class="sub">${t('goal')}: ${data.goal} kg</div>
    </div>
    <div class="progress-row">
      <div class="progress-stat">
        <div class="progress-stat-val">${latest.weight}<span style="font-size:10px"> kg</span></div>
        <div class="progress-stat-lbl">${t('current')}</div>
      </div>
      <div class="progress-stat">
        <div class="progress-stat-val ${lost > 0 ? 'pos' : ''}">${lost > 0 ? '-' : ''}${lost.toFixed(1)}<span style="font-size:10px"> kg</span></div>
        <div class="progress-stat-lbl">${t('lost')}</div>
      </div>
      <div class="progress-stat">
        <div class="progress-stat-val">${pct}%</div>
        <div class="progress-stat-lbl">${t('progress')}</div>
      </div>
    </div>
    <div class="progress-bar-wrap">
      <div class="progress-bar-fill" style="width:${pct}%"></div>
    </div>
    <div class="chart-card" id="${containerId}-chart">
      <div style="display:flex;justify-content:flex-end;margin-bottom:8px">
        <div class="legend" style="margin:0">
          <div class="legend-item" style="gap:4px"><span style="display:inline-block;width:16px;border-top:2px dashed var(--acc);opacity:0.55"></span><span style="font-size:10px">${t('predictionLbl')}</span></div>
        </div>
      </div>
    </div>
  `;

  renderWeightChart(`${containerId}-chart`, data, reg);
}

function renderWeightChart(chartId, data, reg) {
  const container = document.getElementById(chartId);
  const entries = data.entries;

  const W = 310, H = 160;
  const X0 = 40, X1 = 275;
  const Y_TOP = 16, Y_BOT = 130;

  const maxDay = entries[entries.length - 1].day;
  const PRED_DAYS = 5;
  const xMax = maxDay + PRED_DAYS;

  const allW = entries.map(e => e.weight);
  const kgMinRaw = Math.min(...allW, data.goal) - 0.5;
  const kgMaxRaw = Math.max(...allW, data.start) + 0.5;
  const yStep = niceStep(kgMaxRaw - kgMinRaw, 6);
  const kgMin = Math.floor(kgMinRaw / yStep) * yStep;
  const kgMax = Math.ceil(kgMaxRaw / yStep) * yStep;

  const yOf = kg => Y_BOT - (kg - kgMin) / (kgMax - kgMin) * (Y_BOT - Y_TOP);
  const xOf = day => X0 + (day / xMax) * (X1 - X0);

  const s = mkSvg(`0 0 ${W} ${H}`);

  const defs = el('defs', {});
  const cp = el('clipPath', { id: `${chartId}-cp` });
  cp.appendChild(el('rect', { x: X0, y: Y_TOP - 5, width: X1 - X0 + 10, height: Y_BOT - Y_TOP + 15 }));
  defs.appendChild(cp);
  s.appendChild(defs);

  // Y grid + labels
  for (let kg = kgMin; kg <= kgMax + 0.001; kg += yStep) {
    const y = yOf(kg);
    s.appendChild(el('line', { x1: X0, y1: y, x2: X1, y2: y, 'stroke-width': 0.5 }, 'cgd'));
    const label = el('text', { x: X0 - 4, y: y + 3, 'text-anchor': 'end', 'font-size': 9 }, 'ct');
    label.textContent = kg % 1 === 0 ? kg : kg.toFixed(1);
    s.appendChild(label);
  }

  // X axis
  s.appendChild(el('line', { x1: X0, y1: Y_BOT, x2: X1, y2: Y_BOT, 'stroke-width': 1 }, 'cg'));

  // X ticks + labels (i18n)
  const xStep = niceStep(xMax, 6);
  for (let d = 0; d <= xMax; d += xStep) {
    const x = xOf(d);
    s.appendChild(el('line', { x1: x, y1: Y_BOT, x2: x, y2: Y_BOT + 4, 'stroke-width': 1 }, 'cg'));
    const label = el('text', { x, y: H - 4, 'text-anchor': 'middle', 'font-size': 8 }, 'ct');
    label.textContent = fmtDayLabel(d);
    s.appendChild(label);
  }

  // Goal line
  s.appendChild(el('line', {
    x1: X0, y1: yOf(data.goal), x2: X1, y2: yOf(data.goal), 'stroke-width': 1.2,
  }, 'goal-ln'));
  const glbl = el('text', { x: X1 + 4, y: yOf(data.goal) + 3, 'font-size': 8 }, 'ct');
  glbl.textContent = `${data.goal}`;
  s.appendChild(glbl);

  // Prediction line
  if (reg && reg.slope < 0) {
    const lastE = entries[entries.length - 1];
    const predEnd = maxDay + PRED_DAYS;
    const predEndY = lastE.weight + reg.slope * PRED_DAYS;
    s.appendChild(el('polyline', {
      points: `${xOf(lastE.day)},${yOf(lastE.weight)} ${xOf(predEnd)},${yOf(predEndY)}`,
      'stroke-width': 2, 'clip-path': `url(#${chartId}-cp)`,
    }, 'pred'));
  }

  // Actual weight line
  const ptStr = entries.map(e => `${xOf(e.day)},${yOf(e.weight)}`).join(' ');
  s.appendChild(el('polyline', { points: ptStr, 'stroke-width': 2.5, 'clip-path': `url(#${chartId}-cp)` }, 'cl'));

  // Dots
  entries.forEach((e, i) => {
    const last = i === entries.length - 1;
    s.appendChild(el('circle', {
      cx: xOf(e.day), cy: yOf(e.weight), r: last ? 4.5 : 3,
      ...(last ? { 'stroke-width': 2 } : {}),
    }, last ? 'cdl' : 'cd'));
  });

  // Latest label
  const lw = entries[entries.length - 1];
  const lt = el('text', {
    x: xOf(lw.day), y: yOf(lw.weight) - 8, 'text-anchor': 'middle', 'font-size': 10,
  }, 'clbl');
  lt.textContent = lw.weight + ' kg';
  s.appendChild(lt);

  container.appendChild(s);
}
