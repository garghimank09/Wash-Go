import { Link } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';

import { usePartnerBookings } from '../../hooks/usePartnerBookings';
import { formatCents } from '../../utils/format';
import { Card } from '../../ui/card';
import { CustomerBookingStatusPill } from '../../features/bookings/CustomerBookingStatusPill';

export function WasherSchedulePage() {
  const { items, loading, error } = usePartnerBookings();
  const upcoming = [...(items || [])]
    .filter((b) => b.status !== 'cancelled' && b.status !== 'completed')
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black text-wg-text">Schedule</h1>
        <p className="mt-1 text-sm text-wg-muted">Upcoming assigned jobs from your WashGo roster.</p>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {loading ? <p className="text-sm text-wg-muted">Loading…</p> : null}
      {!loading && upcoming.length === 0 ? (
        <Card variant="glass" className="py-10 text-center text-sm text-wg-muted">
          No upcoming assignments. Customer bookings appear here once linked to your washer profile.
        </Card>
      ) : (
        <ul className="space-y-2">
          {upcoming.map((b) => (
            <li key={b.id}>
              <Link to={`/partner/jobs/${b.id}`}>
                <Card variant="glass" className="transition hover:ring-1 hover:ring-cyan-500/20">
                  <div className="flex items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-wg-surface text-cyan-700 ring-1 ring-wg-border dark:bg-white/[0.06] dark:text-cyan-300">
                      <CalendarClock className="size-5" strokeWidth={1.75} aria-hidden />
                    </span>
                    <div className="min-w-0 flex-1">
                      <CustomerBookingStatusPill booking={b} />
                      <p className="mt-2 text-sm font-bold text-wg-text">{new Date(b.scheduled_at).toLocaleString()}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-wg-muted">{b.service_address}</p>
                    </div>
                    <span className="shrink-0 text-sm font-black tabular-nums">{formatCents(b.price_cents, b.currency)}</span>
                  </div>
                </Card>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
