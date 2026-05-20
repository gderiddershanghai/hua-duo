const NS = 'http://www.w3.org/2000/svg';

/** Create an SVG element with attributes and optional CSS class(es). */
export function el(tag, attrs, cls) {
  const e = document.createElementNS(NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  if (cls) cls.split(' ').forEach(c => e.classList.add(c));
  return e;
}

/** Create an <svg> root element. */
export function mkSvg(viewBox, width) {
  return el('svg', { viewBox, width: width || '100%' });
}

/**
 * Render a simple vertical bar chart.
 *
 * @param {HTMLElement} container - element to append the SVG to
 * @param {Array<{label:string, v:number, partial?:boolean}>} data
 * @param {Object}  opts
 * @param {string}  [opts.cls='bar-accent'] - CSS class for normal bars
 * @param {number}  [opts.width=280]
 * @param {number}  [opts.height=90]
 * @param {function} [opts.fmt] - format a value for the label
 */
export function barChart(container, data, opts = {}) {
  const cls   = opts.cls    || 'bar-accent';
  const W     = opts.width  || 280;
  const H     = opts.height || 90;
  const fmt   = opts.fmt    || (v => v);

  const PT = 18, PB = 14, PX = 4;
  const CW = W - PX * 2;
  const CH = H - PT - PB;
  const n  = data.length;
  const SLOT = CW / n;
  const BW = Math.min(SLOT * 0.6, 26);
  const maxV = Math.max(...data.map(d => d.v), 1);

  const s = mkSvg(`0 0 ${W} ${H}`);

  data.forEach((d, i) => {
    const cx = PX + i * SLOT + SLOT / 2;
    const bh = Math.max((d.v / maxV) * CH, 2);
    const by = PT + CH - bh;

    // Bar
    s.appendChild(el('rect', {
      x: cx - BW / 2, y: by, width: BW, height: bh, rx: 3,
    }, d.partial ? 'bar-partial' : cls));

    // Value label (above bar)
    const vt = el('text', {
      x: cx, y: by - 3, 'text-anchor': 'middle', 'font-size': 9,
    }, 'ax-text');
    vt.textContent = fmt(d.v);
    s.appendChild(vt);

    // Day label (below bar)
    const lt = el('text', {
      x: cx, y: H - 2, 'text-anchor': 'middle', 'font-size': 9,
    }, 'ax-text');
    lt.textContent = d.label;
    s.appendChild(lt);
  });

  container.appendChild(s);
}
