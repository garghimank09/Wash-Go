import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, CalendarClock } from 'lucide-react';

import { CustomerBookingStatusPill } from '../bookings/CustomerBookingStatusPill';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { formatCents } from '../../utils/format';

const MAX = 8;

function formatRelative(iso) {
  const d = new Date(iso);
  const now = Date.now();
  const diff = d.getTime() - now;
  if (diff > 0) {
    return d.toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  }
  const past = now - d.getTime();
  const mins = Math.round(past / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/**
 * Recent bookings from list data, newest by scheduled time.
 */
export function DashboardRecentActivity({ items }) {
  const rows = useMemo(() => {
    const copy = [...(items || [])];
    copy.sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
    return copy.slice(0, MAX);
  }, [items]);

  if (!rows.length) {
    return (
      <Card variant="glass" className="min-w-0">
        <h2 className="wg-heading-section">Recent activity</h2>
        <p className="mt-3 text-sm text-wg-muted">No bookings yet. Create one to see your timeline here.</p>
        <Link to="/booking" className="mt-4 inline-block">
          <Button size="sm">Book a wash</Button>
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-w-0 transition hover:ring-1 hover:ring-cyan-500/20 dark:hover:ring-cyan-400/15">
      <div className="flex items-center justify-between gap-2">
        <h2 className="wg-heading-section">Recent activity</h2>
        <Link to="/bookings" className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
          View all
        </Link>
      </div>
      <ul className="mt-4 divide-y divide-wg-border/80">
        {rows.map((b) => (
          <li key={b.id}>
            <Link
              to={`/bookings/${b.id}`}
              className="group flex items-start gap-3 py-3 transition first:pt-0 hover:bg-wg-surface/50 dark:hover:bg-white/[0.03]"
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl bg-wg-surface text-wg-muted ring-1 ring-wg-border dark:bg-wg-surface-elevated/60">
                <CalendarClock className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CustomerBookingStatusPill booking={b} />
                  <span className="text-xs text-wg-muted">{formatRelative(b.scheduled_at)}</span>
                </div>
                <p className="mt-1 truncate text-sm font-medium text-wg-text">{b.service_address}</p>
                <p className="mt-0.5 text-xs tabular-nums text-wg-muted">{formatCents(b.price_cents, b.currency)}</p>
              </div>
              <ArrowUpRight
                className="mt-1 size-4 shrink-0 text-wg-muted opacity-0 transition group-hover:opacity-100"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}
