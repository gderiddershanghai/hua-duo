import { t, fmtDayLabel } from './i18n.js';

export function render(data) {
  const pane = document.getElementById('pane-log');
  const LOG  = data.log;

  const todayStr = new Date().toISOString().slice(0, 10);

  const daysHtml = LOG.map(day => {
    const partial = (day.partial && day.date === todayStr) ? ` ${t('partial')}` : '';
    const entries = day.events.map(entry => {
      const tagsHtml = entry.tags
        .map(e => `<span class="tag ${e.cls}">${e.text}</span>`)
        .join('');

      const inner = entry.note
        ? `<div>
             <div class="tags">${tagsHtml}</div>
             <div class="log-note">${entry.note}</div>
           </div>`
        : `<div class="tags">${tagsHtml}</div>`;

      return `
        <div class="log-item">
          <div class="log-time">${entry.time}</div>
          ${inner}
        </div>`;
    }).join('');

    return `
      <div class="section">
        <div class="slabel">${fmtDayLabel(day.day)}${partial}</div>
        <div class="log">${entries}</div>
      </div>`;
  }).join('');

  pane.innerHTML = daysHtml;
}
