/**
 * Build a smooth SVG path from a 1D series of numeric values, mapped into a
 * bounded box. Uses a Catmull-Rom -> cubic Bezier conversion so the curve is
 * smooth without overshoot (premium financial chart feel).
 *
 * Returns { line, area, points, range } where:
 *   - line: "M x0 y0 C ... " — the smooth stroked curve.
 *   - area: line concatenated with bottom-edge close, for gradient fill.
 *   - points: [{ x, y, raw, index }] — useful for hit-testing.
 *   - range: { min, max } of input values (after small floor for empty-day visual).
 */
export function buildSmoothChartPath(values, { width, height, padY = 8 } = {}) {
  if (!values?.length || !width || !height) {
    return { line: '', area: '', points: [], range: { min: 0, max: 0 } };
  }

  const cleaned = values.map((v) => (Number.isFinite(v) ? v : 0));
  const min = Math.min(...cleaned);
  const max = Math.max(...cleaned);
  const span = Math.max(max - min, 1);

  const innerTop = padY;
  const innerBottom = height - padY;
  const innerHeight = innerBottom - innerTop;
  const stepX = cleaned.length > 1 ? width / (cleaned.length - 1) : 0;

  const points = cleaned.map((v, i) => {
    const x = i * stepX;
    const ratio = (v - min) / span;
    const y = innerBottom - ratio * innerHeight;
    return { x, y, raw: v, index: i };
  });

  if (points.length === 1) {
    const { x, y } = points[0];
    const line = `M ${x} ${y} L ${x} ${y}`;
    const area = `M ${x} ${innerBottom} L ${x} ${y} L ${x} ${innerBottom} Z`;
    return { line, area, points, range: { min, max } };
  }

  const tension = 0.5;
  let line = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`;

  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;

    const cp1x = p1.x + ((p2.x - p0.x) / 6) * tension;
    const cp1y = p1.y + ((p2.y - p0.y) / 6) * tension;
    const cp2x = p2.x - ((p3.x - p1.x) / 6) * tension;
    const cp2y = p2.y - ((p3.y - p1.y) / 6) * tension;

    line += ` C ${cp1x.toFixed(2)} ${cp1y.toFixed(2)}, ${cp2x.toFixed(2)} ${cp2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`;
  }

  const last = points[points.length - 1];
  const first = points[0];
  const area = `${line} L ${last.x.toFixed(2)} ${innerBottom.toFixed(2)} L ${first.x.toFixed(2)} ${innerBottom.toFixed(2)} Z`;

  return { line, area, points, range: { min, max } };
}
