import { barChart } from './svg.js';
import { t } from './i18n.js';

export function render(data) {
  const pane   = document.getElementById('pane-stats');
  const WEEKLY = data.weekly;

  // Compute weekly averages from complete days only
  const complete = WEEKLY.filter(d => !d.partial);
  const n = complete.length;
  const avg = (arr, key) => (arr.reduce((s, d) => s + d[key], 0) / n).toFixed(1);
  const totalFormula = WEEKLY.reduce((s, d) => s + d.formulaMl, 0);

  pane.innerHTML = `
    <div class="section">
      <div class="slabel">${t('weekAvg')}</div>
      <div class="stats">
        <div class="stat">
          <div class="stat-icon">🤱</div>
          <div>
            <div class="stat-num">${avg(complete, 'feeds')}</div>
            <div class="stat-desc">${t('feedsDay')}</div>
          </div>
        </div>
        <div class="stat">
          <div class="stat-icon">😴</div>
          <div>
            <div class="stat-num">${avg(complete, 'sleepH')}h</div>
            <div class="stat-desc">${t('sleepDay')}</div>
          </div>
        </div>
        <div class="stat">
          <div class="stat-icon">💩</div>
          <div>
            <div class="stat-num">${avg(complete, 'poops')}</div>
            <div class="stat-desc">${t('poopDay')}</div>
          </div>
        </div>
        <div class="stat">
          <div class="stat-icon">💧</div>
          <div>
            <div class="stat-num">${avg(complete, 'pees')}</div>
            <div class="stat-desc">${t('peeDay')}</div>
          </div>
        </div>
      </div>
      <div style="font-size:11px; color:var(--mut); margin-top:8px; text-align:center;">
        ${t('formulaNote')(totalFormula)} · ${t('partialNote')}
      </div>
    </div>

    <div class="section">
      <div class="slabel">${t('dailyTrends')}</div>
      <div class="chart-grid">
        <div class="chart-card" id="chart-feeds"><h3>🤱 ${t('feeds')}</h3></div>
        <div class="chart-card" id="chart-sleep"><h3>😴 ${t('sleepH')}</h3></div>
        <div class="chart-card" id="chart-poop"><h3>💩 ${t('poop')}</h3></div>
        <div class="chart-card" id="chart-pee"><h3>💧 ${t('pee')}</h3></div>
      </div>
    </div>
  `;

  // Chart data helpers
  const days = k => WEEKLY.map(d => ({ label: d.label, v: d[k], partial: d.partial }));

  barChart(document.getElementById('chart-feeds'), days('feeds'),
    { width: 180, height: 85 });

  barChart(document.getElementById('chart-sleep'), days('sleepH'),
    { width: 180, height: 85, fmt: v => v.toFixed(1) });

  barChart(document.getElementById('chart-poop'), days('poops'),
    { width: 180, height: 85 });

  barChart(document.getElementById('chart-pee'), days('pees'),
    { width: 180, height: 85 });
}
