/** Default app currency (India) — matches web frontend. */
export const DEFAULT_CURRENCY = 'INR';
const LOCALE = 'en-IN';

/**
 * Format integer cents as currency (exact backend value, no extra rounding).
 */
export function formatCents(cents, currency = DEFAULT_CURRENCY) {
  if (cents == null) return '—';
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format(
    (cents || 0) / 100,
  );
}
