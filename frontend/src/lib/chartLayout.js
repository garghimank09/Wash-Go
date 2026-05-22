/** Compact chart height from row/category count (avoids empty space with sparse data). */
export function chartHeightFromCount(count, { perRow = 44, min = 112, max = 224, header = 56 } = {}) {
  const n = Math.max(1, Number(count) || 1);
  return Math.min(max, Math.max(min, n * perRow + header));
}
