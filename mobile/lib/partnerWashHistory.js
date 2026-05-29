import { partnerEarningsCents } from './partnerEarnings';

/** Completed washes the partner accepted and finished. */
export function selectCompletedWashHistory(bookings) {
  return (bookings || [])
    .filter((b) => b.status === 'completed')
    .sort(
      (a, b) =>
        new Date(b.updated_at || b.scheduled_at).getTime() -
        new Date(a.updated_at || b.scheduled_at).getTime(),
    );
}

export function historyPayoutCents(booking) {
  return partnerEarningsCents(booking?.price_cents);
}
