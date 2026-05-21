/**
 * Pure formatting helpers used across partner UI.
 *
 * Lives in `lib/` (not `data/`) so screens can keep using familiar helpers
 * without pulling in any mock dataset.
 */

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

function localeForCurrency(code) {
  const c = String(code || 'USD').toUpperCase();
  if (c === 'INR') return 'en-IN';
  return 'en-US';
}

/**
 * Partner payout display: always two fraction digits (e.g. 4500 cents → $45.00).
 * Uses backend ISO currency code; invalid codes fall back to USD formatting.
 */
export function formatPayoutCurrency(cents, currency = 'USD') {
  const code = String(currency || 'USD')
    .trim()
    .toUpperCase()
    .slice(0, 3);
  const safeCode = /^[A-Z]{3}$/.test(code) ? code : 'USD';
  const amount = (Number(cents) || 0) / 100;
  try {
    return new Intl.NumberFormat(localeForCurrency(safeCode), {
      style: 'currency',
      currency: safeCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
}

/** USD helper; 2dp by default. Prefer {@link formatPayoutCurrency} for booking currency. */
export function formatCurrencyUSD(cents, { fractionDigits = 2 } = {}) {
  if (fractionDigits !== 2) {
    const amount = (Number(cents) || 0) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(amount);
  }
  return formatPayoutCurrency(cents, 'USD');
}

export function formatCurrencyINR(cents) {
  return formatPayoutCurrency(cents, 'INR');
}

/**
 * Format an amount stored as cents using whatever currency the backend
 * tagged on the booking (`booking.currency`). Falls back to USD.
 */
export function formatCurrency(cents, currency = 'USD') {
  return formatPayoutCurrency(cents, currency);
}

export function formatPercent(value, { fractionDigits = 1 } = {}) {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return '—';
  const sign = n > 0 ? '+' : '';
  return `${sign}${n.toFixed(fractionDigits)}%`;
}

/** Safe numeric formatting — never calls `.toFixed` on null/undefined. */
export function formatOptionalNumber(value, { fractionDigits = 1, fallback = '—' } = {}) {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return fallback;
  return n.toFixed(fractionDigits);
}

export function formatRating(value, { fractionDigits = 1, fallback = '—' } = {}) {
  return formatOptionalNumber(value, { fractionDigits, fallback });
}

export function formatCount(value, { fallback = '—' } = {}) {
  const n = Number(value);
  if (value == null || !Number.isFinite(n)) return fallback;
  return String(Math.round(n));
}

/**
 * Customer trust line for job cards. Returns null when the API omits both fields
 * so the UI can hide the row instead of showing broken placeholders.
 */
export function formatCustomerTrustLine({ completedWashes, rating } = {}) {
  const parts = [];
  const washes = formatCount(completedWashes, { fallback: null });
  if (washes != null && washes !== '—') parts.push(`${washes} washes`);
  const ratingStr = formatRating(rating, { fractionDigits: 1, fallback: null });
  if (ratingStr != null && ratingStr !== '—') parts.push(`${ratingStr} rating`);
  return parts.length > 0 ? parts.join(' · ') : null;
}

export function formatPayoutDate(timestamp) {
  const d = new Date(timestamp);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday =
    new Date(Date.now() - DAY).toDateString() === d.toDateString();
  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  if (sameDay) return `Today · ${time}`;
  if (yesterday) return `Yesterday · ${time}`;
  return (
    d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) +
    ` · ${time}`
  );
}

export function formatBookingTime(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatBookingHour(iso) {
  return new Date(iso).toLocaleTimeString(undefined, {
    hour: 'numeric',
  });
}

export function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function timeBasedGreeting(now = new Date()) {
  const h = now.getHours();
  if (h < 5) return 'Good night';
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  if (h < 21) return 'Good evening';
  return 'Good night';
}

export function dateKeyFromDate(date) {
  if (!date) return '';
  if (typeof date === 'string') return date.slice(0, 10);
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
