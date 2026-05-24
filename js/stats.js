import { barChart } from './svg.js';
import { t } from './i18n.js';

export function render(data) {
  const pane = document.getElementById('pane-stats');

  // Limit to last 7 days
  const WEEKLY = data.weekly.slice(-7);

  // Today = last entry (may be partial)
  const todayData = WEEKLY[WEEKLY.length - 1];

  // Averages from complete days in last 7 only
  const complete = WEEKLY.filter(d => !d.partial);
  const n = complete.length || 1;
  const avg = key => (complete.reduce((s, d) => s + d[key], 0) / n).toFixed(1);
  const totalFormula = WEEKLY.reduce((s, d) => s + d.formulaMl, 0);

  // Dynamic date range label
  const rangeLabel = WEEKLY.length
    ? `May ${WEEKLY[0].label}–${WEEKLY[WEEKLY.length - 1].label}`
    : '';

  pane.innerHTML = `
    <div class="toggle-row">
      <button class="toggle-btn active" id="btn-weekly">${t('weekly')}</button>
      <button class="toggle-btn" id="btn-daily">${t('today')}</button>
    </div>

    <div id="view-weekly">
      <div class="section">
        <div class="slabel">${t('weekAvg')} · ${rangeLabel}</div>
        <div class="stats">
          <div class="stat">
            <div class="stat-icon">🤱</div>
            <div>
              <div class="stat-num">${avg('feeds')}</div>
              <div class="stat-desc">${t('feedsDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">😴</div>
            <div>
              <div class="stat-num">${avg('sleepH')}h</div>
              <div class="stat-desc">${t('sleepDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">💩</div>
            <div>
              <div class="stat-num">${avg('poops')}</div>
              <div class="stat-desc">${t('poopDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">💧</div>
            <div>
              <div class="stat-num">${avg('pees')}</div>
              <div class="stat-desc">${t('peeDay')}</div>
            </div>
          </div>
        </div>
        <div style="font-size:11px; color:var(--mut); margin-top:8px; text-align:center;">
          ${t('formulaNote')(totalFormula)}
        </div>
      </div>

      <div class="section">
        <div class="slabel">${t('dailyTrends')} · ${rangeLabel}</div>
        <div class="chart-grid">
          <div class="chart-card" id="chart-feeds"><h3>🤱 ${t('feeds')}</h3></div>
          <div class="chart-card" id="chart-sleep"><h3>😴 ${t('sleepH')}</h3></div>
          <div class="chart-card" id="chart-poop"><h3>💩 ${t('poop')}</h3></div>
          <div class="chart-card" id="chart-pee"><h3>💧 ${t('pee')}</h3></div>
        </div>
      </div>
    </div>

    <div id="view-daily" style="display:none">
      <div class="section">
        <div class="slabel">${t('today')} · May ${todayData?.label ?? '—'}</div>
        <div class="stats">
          <div class="stat">
            <div class="stat-icon">🤱</div>
            <div>
              <div class="stat-num">${todayData?.feeds ?? '—'}</div>
              <div class="stat-desc">${t('feedsDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">😴</div>
            <div>
              <div class="stat-num">${todayData ? todayData.sleepH + 'h' : '—'}</div>
              <div class="stat-desc">${t('sleepDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">💩</div>
            <div>
              <div class="stat-num">${todayData?.poops ?? '—'}</div>
              <div class="stat-desc">${t('poopDay')}</div>
            </div>
          </div>
          <div class="stat">
            <div class="stat-icon">💧</div>
            <div>
              <div class="stat-num">${todayData?.pees ?? '—'}</div>
              <div class="stat-desc">${t('peeDay')}</div>
            </div>
          </div>
        </div>
        <div style="font-size:11px; color:var(--mut); margin-top:8px; text-align:center;">
          7-day avg: 🤱 ${avg('feeds')} · 😴 ${avg('sleepH')}h · 💩 ${avg('poops')} · 💧 ${avg('pees')}
        </div>
      </div>
    </div>
  `;

  // Toggle handlers
  const showView = view => {
    document.getElementById('view-weekly').style.display = view === 'weekly' ? '' : 'none';
    document.getElementById('view-daily').style.display  = view === 'daily'  ? '' : 'none';
    document.getElementById('btn-weekly').classList.toggle('active', view === 'weekly');
    document.getElementById('btn-daily').classList.toggle('active', view === 'daily');
  };
  document.getElementById('btn-weekly').addEventListener('click', () => showView('weekly'));
  document.getElementById('btn-daily').addEventListener('click', () => showView('daily'));

  // Bar charts (today = partial → lighter bar; all other days → bold accent bar)
  const days = k => WEEKLY.map(d => ({ label: d.label, v: d[k], partial: d.partial }));
  barChart(document.getElementById('chart-feeds'), days('feeds'),  { width: 180, height: 85 });
  barChart(document.getElementById('chart-sleep'), days('sleepH'), { width: 180, height: 85, fmt: v => v.toFixed(1) });
  barChart(document.getElementById('chart-poop'),  days('poops'),  { width: 180, height: 85 });
  barChart(document.getElementById('chart-pee'),   days('pees'),   { width: 180, height: 85 });
}
