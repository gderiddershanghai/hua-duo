import { barChart } from './svg.js';
import { t, fmtDayLabel } from './i18n.js';

export function render(data) {
  const pane = document.getElementById('pane-stats');
  const ALL_WEEKLY = data.weekly;

  // ── 7-Day view ────────────────────────────────────────────────
  const WEEKLY7 = ALL_WEEKLY.slice(-7);
  const complete7 = WEEKLY7.filter(d => !d.partial);
  const n7 = complete7.length || 1;
  const avg7 = key => (complete7.reduce((s, d) => s + d[key], 0) / n7).toFixed(1);
  const formula7 = complete7.reduce((s, d) => s + d.formulaMl, 0);
  const range7 = complete7.length
    ? `May ${complete7[0].label}–${complete7[complete7.length - 1].label}`
    : '';
  const chartRange7 = WEEKLY7.length
    ? `May ${WEEKLY7[0].label}–${WEEKLY7[WEEKLY7.length - 1].label}`
    : '';

  // ── Weekly view — group by week since birth ────────────────────
  const weekMap = {};
  for (const d of ALL_WEEKLY) {
    const w = Math.floor(d.daySinceBirth / 7) + 1;
    if (!weekMap[w]) weekMap[w] = [];
    weekMap[w].push(d);
  }

  const weeks = Object.keys(weekMap)
    .map(Number)
    .sort((a, b) => a - b)
    .map(wNum => {
      const days = weekMap[wNum];
      const useDays = days.filter(d => !d.partial);
      const n = useDays.length || days.length;
      const src = useDays.length ? useDays : days;
      const avg = key => src.reduce((s, d) => s + d[key], 0) / n;
      const isCurrentWeek = days.some(d => d.partial);
      const minDay = Math.min(...days.map(d => d.daySinceBirth));
      const maxDay = Math.max(...days.map(d => d.daySinceBirth));
      return {
        weekNum: wNum,
        label: `W${wNum}`,
        rangeLabel: `${fmtDayLabel(minDay)}–${fmtDayLabel(maxDay)}`,
        feeds:  avg('feeds'),
        sleepH: avg('sleepH'),
        poops:  avg('poops'),
        pees:   avg('pees'),
        formulaMl: days.reduce((s, d) => s + d.formulaMl, 0),
        partial: isCurrentWeek,
      };
    });

  const latestWeek = weeks[weeks.length - 1] || {};

  // ── Render ─────────────────────────────────────────────────────
  pane.innerHTML = `
    <div class="toggle-row">
      <button class="toggle-btn active" id="btn-7days">${t('sevenDays')}</button>
      <button class="toggle-btn" id="btn-weekly">${t('weekly')}</button>
    </div>

    <div id="view-7days">
      <div class="section">
        <div class="slabel">${t('weekAvg')} · ${range7}</div>
        <div class="stats">
          <div class="stat">
            <div class="stat-icon">🤱</div>
            <div>
              <div class="stat-num">${avg7('feeds')}</div>
              <div class="stat-desc">${t('feedsDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">😴</div>
            <div>
              <div class="stat-num">${avg7('sleepH')}h</div>
              <div class="stat-desc">${t('sleepDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">💩</div>
            <div>
              <div class="stat-num">${avg7('poops')}</div>
              <div class="stat-desc">${t('poopDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">💧</div>
            <div>
              <div class="stat-num">${avg7('pees')}</div>
              <div class="stat-desc">${t('peeDay')}</div>
            </div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--mut);margin-top:8px;text-align:center;">
          ${t('formulaNote')(formula7)}
        </div>
      </div>
      <div class="section">
        <div class="slabel">${t('dailyTrends')} · ${chartRange7}</div>
        <div class="chart-grid">
          <div class="chart-card" id="chart-feeds"><h3>🤱 ${t('feeds')}</h3></div>
          <div class="chart-card" id="chart-sleep"><h3>😴 ${t('sleepH')}</h3></div>
          <div class="chart-card" id="chart-poop"><h3>💩 ${t('poop')}</h3></div>
          <div class="chart-card" id="chart-pee"><h3>💧 ${t('pee')}</h3></div>
        </div>
      </div>
    </div>

    <div id="view-weekly" style="display:none">
      <div class="section">
        <div class="slabel">Week ${latestWeek.weekNum} · ${latestWeek.rangeLabel ?? ''}${latestWeek.partial ? ' · in progress' : ''}</div>
        <div class="stats">
          <div class="stat">
            <div class="stat-icon">🤱</div>
            <div>
              <div class="stat-num">${latestWeek.feeds?.toFixed(1) ?? '—'}</div>
              <div class="stat-desc">${t('feedsDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">😴</div>
            <div>
              <div class="stat-num">${latestWeek.sleepH?.toFixed(1) ?? '—'}h</div>
              <div class="stat-desc">${t('sleepDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">💩</div>
            <div>
              <div class="stat-num">${latestWeek.poops?.toFixed(1) ?? '—'}</div>
              <div class="stat-desc">${t('poopDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">💧</div>
            <div>
              <div class="stat-num">${latestWeek.pees?.toFixed(1) ?? '—'}</div>
              <div class="stat-desc">${t('peeDay')}</div>
            </div>
          </div>
        </div>
        <div style="font-size:11px;color:var(--mut);margin-top:8px;text-align:center;">
          ${t('formulaNote')(latestWeek.formulaMl ?? 0)}
        </div>
      </div>
      <div class="section">
        <div class="slabel">Week by week · ${weeks.length} week${weeks.length !== 1 ? 's' : ''}</div>
        <div class="chart-grid">
          <div class="chart-card" id="wchart-feeds"><h3>🤱 ${t('feeds')}</h3></div>
          <div class="chart-card" id="wchart-sleep"><h3>😴 ${t('sleepH')}</h3></div>
          <div class="chart-card" id="wchart-poop"><h3>💩 ${t('poop')}</h3></div>
          <div class="chart-card" id="wchart-pee"><h3>💧 ${t('pee')}</h3></div>
        </div>
      </div>
    </div>
  `;

  // Toggle
  const showView = view => {
    document.getElementById('view-7days').style.display  = view === '7days'  ? '' : 'none';
    document.getElementById('view-weekly').style.display = view === 'weekly' ? '' : 'none';
    document.getElementById('btn-7days').classList.toggle('active', view === '7days');
    document.getElementById('btn-weekly').classList.toggle('active', view === 'weekly');
  };
  document.getElementById('btn-7days').addEventListener('click', () => showView('7days'));
  document.getElementById('btn-weekly').addEventListener('click', () => showView('weekly'));

  // 7-day charts
  const days7 = k => WEEKLY7.map(d => ({ label: d.label, v: d[k], partial: d.partial }));
  barChart(document.getElementById('chart-feeds'), days7('feeds'),  { width: 180, height: 85 });
  barChart(document.getElementById('chart-sleep'), days7('sleepH'), { width: 180, height: 85, fmt: v => v.toFixed(1) });
  barChart(document.getElementById('chart-poop'),  days7('poops'),  { width: 180, height: 85 });
  barChart(document.getElementById('chart-pee'),   days7('pees'),   { width: 180, height: 85 });

  // Weekly charts (one bar per week)
  const wkBars = k => weeks.map(w => ({ label: w.label, v: w[k], partial: w.partial }));
  barChart(document.getElementById('wchart-feeds'), wkBars('feeds'),  { width: 180, height: 85, fmt: v => v.toFixed(1) });
  barChart(document.getElementById('wchart-sleep'), wkBars('sleepH'), { width: 180, height: 85, fmt: v => v.toFixed(1) });
  barChart(document.getElementById('wchart-poop'),  wkBars('poops'),  { width: 180, height: 85, fmt: v => v.toFixed(1) });
  barChart(document.getElementById('wchart-pee'),   wkBars('pees'),   { width: 180, height: 85, fmt: v => v.toFixed(1) });
}
