/**
 * Pure formatting helpers used across partner UI.
 *
 * Currency defaults to INR (en-IN) — matches backend + web frontend.
 */

import { DEFAULT_CURRENCY, formatCents } from './formatCurrency';

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

/**
 * Partner payout display (2 fraction digits). Uses backend ISO currency; defaults to INR.
 */
export function formatPayoutCurrency(cents, currency = DEFAULT_CURRENCY) {
  const code = String(currency || DEFAULT_CURRENCY)
    .trim()
    .toUpperCase()
    .slice(0, 3);
  const safeCode = /^[A-Z]{3}$/.test(code) ? code : DEFAULT_CURRENCY;
  return formatCents(cents, safeCode);
}

/** @deprecated Use formatPayoutCurrency — kept for call sites that referenced USD helper. */
export function formatCurrencyUSD(cents, { fractionDigits = 2 } = {}) {
  if (fractionDigits !== 2) {
    const amount = (Number(cents) || 0) / 100;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: DEFAULT_CURRENCY,
      maximumFractionDigits: fractionDigits,
      minimumFractionDigits: fractionDigits,
    }).format(amount);
  }
  return formatPayoutCurrency(cents, DEFAULT_CURRENCY);
}

export function formatCurrencyINR(cents) {
  return formatPayoutCurrency(cents, DEFAULT_CURRENCY);
}

export function formatCurrency(cents, currency = DEFAULT_CURRENCY) {
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
