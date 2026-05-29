/** Partner receives 90% of each wash; admin collects 100% and pays partners weekly. */
export const PARTNER_EARNINGS_SHARE = 0.9;
export const PARTNER_EARNINGS_PERCENT = 90;

export const PARTNER_EARNING_STATUSES = ['confirmed', 'in_progress', 'completed'];

export function partnerEarningsCents(priceCents) {
  return Math.floor((Number(priceCents) || 0) * PARTNER_EARNINGS_SHARE);
}

export function isPartnerEarningBooking(booking) {
  return PARTNER_EARNING_STATUSES.includes(String(booking?.status || ''));
}

/** Client-side fallback when /partner/earnings is unavailable. */
export function computePartnerEarningsFromBookings(bookings) {
  const list = (bookings || []).filter(isPartnerEarningBooking);
  const weekAgo = Date.now() - 7 * 86400000;
  const week = list.filter((b) => new Date(b.updated_at || b.scheduled_at).getTime() >= weekAgo);
  const lifetimeCents = list.reduce((s, b) => s + partnerEarningsCents(b.price_cents), 0);
  const weekCents = week.reduce((s, b) => s + partnerEarningsCents(b.price_cents), 0);
  return {
    share_percent: PARTNER_EARNINGS_PERCENT,
    week_partner_cents: weekCents,
    lifetime_partner_cents: lifetimeCents,
    pending_weekly_cents: lifetimeCents,
    week_jobs: week.length,
    lifetime_jobs: list.length,
    series: [],
  };
}
