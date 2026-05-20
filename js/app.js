import { render as renderStats }   from './stats.js';
import { render as renderPattern } from './pattern.js';
import { render as renderLog }     from './log.js';
import { render as renderGrowth }  from './growth.js';
import { render as renderParent }  from './parent.js';
import { t, fmtDayLabel } from './i18n.js';

function renderAll() {
  renderStats();
  renderPattern();
  renderLog();
  renderGrowth();
  renderParent();
  updateTabLabels();
}

function updateTabLabels() {
  const tabs = document.querySelectorAll('.tab');
  const keys = ['stats', 'pattern', 'log', 'growth', 'parents'];
  tabs.forEach((tab, i) => { tab.textContent = t(keys[i]); });

  // Update header age line
  const daysOldFn = t('daysOld');
  if (typeof daysOldFn === 'function') {
    document.getElementById('baby-age').textContent = daysOldFn(8) + ' · ' + fmtDayLabel(8) + ', 2026';
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

  renderAll();

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

// ===== Initial render =====
renderAll();
