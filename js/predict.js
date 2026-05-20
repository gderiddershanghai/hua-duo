/**
 * Simple OLS linear regression.
 * @param {Array<{x:number, y:number}>} pts - data points
 * @returns {{ slope:number, intercept:number, predict:(x:number)=>number, r2:number }|null}
 */
export function linearRegression(pts) {
  const n = pts.length;
  if (n < 3) return null;

  let sx = 0, sy = 0, sxy = 0, sx2 = 0;
  for (const { x, y } of pts) {
    sx  += x;
    sy  += y;
    sxy += x * y;
    sx2 += x * x;
  }
  const denom = n * sx2 - sx * sx;
  if (denom === 0) return null;

  const slope     = (n * sxy - sx * sy) / denom;
  const intercept = (sy - slope * sx) / n;
  const predict   = x => slope * x + intercept;

  // R² goodness of fit
  const yMean = sy / n;
  let ssTot = 0, ssRes = 0;
  for (const { x, y } of pts) {
    ssTot += (y - yMean) ** 2;
    ssRes += (y - predict(x)) ** 2;
  }
  const r2 = ssTot === 0 ? 1 : 1 - ssRes / ssTot;

  return { slope, intercept, predict, r2 };
}
