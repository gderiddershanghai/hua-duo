import { render as renderStats }   from './stats.js';
import { render as renderPattern } from './pattern.js';
import { render as renderLog }     from './log.js';
import { render as renderGrowth }  from './growth.js';
import { render as renderParent }  from './parent.js';
import { t, fmtDayLabel } from './i18n.js';

// Cached so language toggle can re-render without re-fetching
let appData = null;

function renderAll(data) {
  renderStats(data);
  renderPattern(data);
  renderLog(data);
  renderGrowth(data);
  renderParent(data);
  updateTabLabels(data);
}

function updateTabLabels(data) {
  const tabs = document.querySelectorAll('.tab');
  const keys = ['stats', 'pattern', 'log', 'growth', 'parents'];
  tabs.forEach((tab, i) => { tab.textContent = t(keys[i]); });

  // Compute age from dob → today
  const dob      = new Date(data.baby.dob);
  const daysOld  = Math.floor((Date.now() - dob) / 86400000);
  const daysOldFn = t('daysOld');
  if (typeof daysOldFn === 'function') {
    document.getElementById('baby-age').textContent =
      daysOldFn(daysOld) + ' · ' + fmtDayLabel(daysOld) + ', 2026';
  }
}

// ===== Theme cycling =====
const THEMES = [
  { id: 'linen', name: 'Linen' },
  { id: 'sky',   name: 'Sky' },
  { id: 'sage',  name: 'Sage' },
  { id: 'night', name: 'Night' },
];
let themeIdx = 0;

document.getElementById('theme-btn').addEventListener('click', () => {
  themeIdx = (themeIdx + 1) % THEMES.length;
  const th = THEMES[themeIdx];
  document.body.dataset.theme = th.id;
  document.getElementById('tname').textContent = th.name;

  const toast = document.getElementById('toast');
  toast.textContent = th.name;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 1200);
});

// ===== Language toggle =====
document.getElementById('lang-btn').addEventListener('click', () => {
  const current = document.body.dataset.lang || 'en';
  const next = current === 'en' ? 'zh' : 'en';
  document.body.dataset.lang = next;
  document.getElementById('lang-btn').textContent = next === 'en' ? '中文' : 'EN';

  if (appData) renderAll(appData);

  // Re-activate the current tab
  const activeTab = document.querySelector('.tab.active');
  if (activeTab) activeTab.classList.add('active');

  const toast = document.getElementById('toast');
  toast.textContent = next === 'en' ? 'English' : '中文';
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), 1200);
});

// ===== Tab switching =====
const tabBar = document.getElementById('tab-bar');
tabBar.addEventListener('click', e => {
  const tab = e.target.closest('.tab');
  if (!tab) return;
  const id = tab.dataset.tab;

  tabBar.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.pane').forEach(p => p.classList.remove('active'));
  tab.classList.add('active');
  document.getElementById('pane-' + id).classList.add('active');
});

// ===== Boot =====
async function init() {
  try {
    const res = await fetch('/api/data');
    if (!res.ok) throw new Error(`Server returned ${res.status}`);
    appData = await res.json();
    renderAll(appData);
  } catch (err) {
    console.error('Failed to load data:', err);
    document.querySelector('.content').innerHTML =
      `<div style="padding:40px;text-align:center;color:var(--mut);font-size:14px">
         ⚠️ Could not load data<br><small>${err.message}</small>
       </div>`;
  }
}

init();
