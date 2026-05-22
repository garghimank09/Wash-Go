/** Default app currency (India). */
export const DEFAULT_CURRENCY = 'INR';
const LOCALE = 'en-IN';

export function formatCents(cents, currency = DEFAULT_CURRENCY) {
  return new Intl.NumberFormat(LOCALE, { style: 'currency', currency }).format((cents || 0) / 100);
}

/** Amount already in rupees (e.g. chart series = paise / 100). */
export function formatRupees(amount, { maximumFractionDigits = 0 } = {}) {
  const n = Number(amount) || 0;
  return new Intl.NumberFormat(LOCALE, {
    style: 'currency',
    currency: DEFAULT_CURRENCY,
    maximumFractionDigits,
    minimumFractionDigits: maximumFractionDigits > 0 ? 2 : 0,
  }).format(n);
}

/** Compact axis labels, e.g. 12500 → ₹12.5k */
export function formatRupeesAxis(amount) {
  const n = Number(amount) || 0;
  if (n >= 100_000) {
    return new Intl.NumberFormat(LOCALE, {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n);
  }
  if (n >= 1000) {
    return `₹${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}k`;
  }
  return formatRupees(n, { maximumFractionDigits: 0 });
}

export function formatDateTime(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString(LOCALE);
  } catch {
    return iso;
  }
}
