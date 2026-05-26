import { partnerEarningsCents } from './partnerEarnings';

/** Completed washes the partner accepted and finished. */
export function selectCompletedWashHistory(bookings) {
  return (bookings || [])
    .filter((b) => b.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.scheduled_at).getTime() -
        new Date(a.updated_at || a.scheduled_at).getTime(),
    );
}

export function completedAtLabel(booking) {
  const raw = booking?.updated_at || booking?.scheduled_at;
  if (!raw) return '—';
  return new Date(raw).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function historyPayoutCents(booking) {
  return partnerEarningsCents(booking?.price_cents);
}
