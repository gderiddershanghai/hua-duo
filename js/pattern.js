import { el, mkSvg } from './svg.js';
import { t, fmtDayLabel } from './i18n.js';

export function render(data) {
  const pane    = document.getElementById('pane-pattern');
  const PATTERN = data.pattern;

  // Compute summary stats from complete days
  const complete = PATTERN.filter(d => !d.partial);
  const n = complete.length;
  const feedCounts = complete.map(d => d.feeds.length);
  const feedMin = Math.min(...feedCounts);
  const feedMax = Math.max(...feedCounts);
  const avgSleep = (complete.reduce((s, d) => {
    return s + d.sleeps.reduce((tot, [a, b]) => tot + (b - a), 0);
  }, 0) / n).toFixed(1);
  // Average wake window
  const wakeWindows = [];
  complete.forEach(d => {
    for (let i = 1; i < d.sleeps.length; i++) {
      wakeWindows.push(d.sleeps[i][0] - d.sleeps[i - 1][1]);
    }
  });
  const avgWake = wakeWindows.length
    ? (wakeWindows.reduce((a, b) => a + b, 0) / wakeWindows.length * 60).toFixed(0)
    : '?';

  pane.innerHTML = `
    <div class="section">
      <div class="slabel">${t('activityPattern')} · ${t('nDays')(PATTERN.length)}</div>
      <div class="chart-card">
        <div id="pattern-chart"></div>
        <div class="legend">
          <div class="legend-item"><div class="l-sq" style="background:var(--slp-bg)"></div> ${t('sleepLbl')}</div>
          <div class="legend-item"><div class="l-sq" style="background:var(--feed-bg)"></div> ${t('feedLbl')}</div>
          <div class="legend-item"><div class="l-sq" style="background:var(--skin-bg)"></div> ${t('skinLbl')}</div>
          <div class="legend-item" style="font-size:11px">🍼 ${t('formulaLbl')} · 🐢 ${t('tummyLbl')} · 🛁 ${t('bathLbl')}</div>
        </div>
        <div class="pat-stats">
          <div class="pat-stat">
            <div class="pat-stat-val">${feedMin}–${feedMax}</div>
            <div class="pat-stat-lbl">${t('feedsPerDay')}</div>
          </div>
          <div class="pat-stat">
            <div class="pat-stat-val">~${avgSleep}h</div>
            <div class="pat-stat-lbl">${t('avgSleep')}</div>
          </div>
          <div class="pat-stat">
            <div class="pat-stat-val">~${avgWake}m</div>
            <div class="pat-stat-lbl">${t('wakeWindow')}</div>
          </div>
        </div>
      </div>
    </div>
  `;

  renderChart(PATTERN);
}

function renderChart(PATTERN) {
  const X0 = 48, CW = 238;
  const PH = CW / 24;            // pixels per hour
  const RH = 34, BH = 18, BT = 8, TP = 4;
  const totalH = TP + PATTERN.length * RH + 24;

  const s = mkSvg(`0 0 300 ${totalH}`);

  // Defs: one clip path per row for rounded bar edges
  const defs = el('defs', {});
  PATTERN.forEach((_, i) => {
    const cp = el('clipPath', { id: `row-${i}` });
    cp.appendChild(el('rect', {
      x: X0, y: TP + i * RH + BT,
      width: CW, height: BH, rx: 4,
    }));
    defs.appendChild(cp);
  });
  s.appendChild(defs);

  PATTERN.forEach((day, i) => {
    const rowY = TP + i * RH;
    const barY = rowY + BT;

    // Day label
    const lbl = el('text', {
      x: X0 - 4, y: barY + BH / 2 + 4,
      'text-anchor': 'end', 'font-size': 9,
    }, 'ax-text');
    lbl.textContent = fmtDayLabel(day.day);
    s.appendChild(lbl);

    // Background bar
    s.appendChild(el('rect', {
      x: X0, y: barY, width: CW, height: BH, rx: 4,
    }, 'tl-bg'));

    // Partial day dashed outline
    if (day.partial) {
      s.appendChild(el('rect', {
        x: X0, y: barY, width: CW, height: BH, rx: 4,
        fill: 'none', stroke: 'var(--bdr)', 'stroke-width': 0.8,
        'stroke-dasharray': '3,2',
      }));
    }

    // Group for clipped segments
    const g = el('g', { 'clip-path': `url(#row-${i})` });

    // Sleep segments (blue)
    day.sleeps.forEach(([a, b]) => {
      g.appendChild(el('rect', {
        x: X0 + a * PH, y: barY,
        width: Math.max((b - a) * PH, 1), height: BH,
      }, 's-block'));
    });

    // Feed segments (warm)
    day.feeds.forEach(f => {
      const x = X0 + f.h * PH;
      const w = Math.max(f.dur * PH, 2);
      g.appendChild(el('rect', {
        x, y: barY, width: w, height: BH,
      }, 'f-block'));

      // Formula emoji inside the feed segment
      if (f.formula) {
        const emoji = el('text', {
          x: x + w / 2, y: barY + BH / 2,
          'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 7,
        });
        emoji.textContent = '🍼'; // 🍼
        g.appendChild(emoji);
      }
    });

    // Skin-to-skin segments (pink)
    if (day.skin) {
      day.skin.forEach(sk => {
        g.appendChild(el('rect', {
          x: X0 + sk.h * PH, y: barY,
          width: Math.max(sk.dur * PH, 2), height: BH,
        }, 'sk-block'));
      });
    }

    s.appendChild(g);

    // Markers: emoji-only events (tummy time 🐢, bath 🛁) – rendered INSIDE bar
    if (day.markers) {
      day.markers.forEach(m => {
        const mt = el('text', {
          x: X0 + m.h * PH, y: barY + BH / 2,
          'text-anchor': 'middle', 'dominant-baseline': 'central',
          'font-size': 7,
        });
        mt.textContent = m.emoji;
        s.appendChild(mt);
      });
    }
  });

  // X axis
  const axY = TP + PATTERN.length * RH + 4;
  s.appendChild(el('line', {
    x1: X0, y1: axY, x2: X0 + CW, y2: axY, 'stroke-width': 1,
  }, 'ax-line'));

  [0, 6, 12, 18, 24].forEach(h => {
    const x = X0 + h * PH;
    s.appendChild(el('line', {
      x1: x, y1: axY, x2: x, y2: axY + 3, 'stroke-width': 1,
    }, 'ax-line'));
    const tt = el('text', {
      x, y: axY + 14, 'text-anchor': 'middle', 'font-size': 9,
    }, 'ax-text');
    tt.textContent = h === 0 ? '0' : h === 12 ? 'noon' : h;
    s.appendChild(tt);
  });

  document.getElementById('pattern-chart').appendChild(s);
}
