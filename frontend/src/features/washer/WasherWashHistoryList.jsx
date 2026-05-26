import { Link } from 'react-router-dom';
import { CheckCircle2, ChevronRight, History } from 'lucide-react';

import {
  completedAtLabel,
  historyPayoutCents,
  selectCompletedWashHistory,
} from '../../lib/partnerWashHistory';
import { formatCents } from '../../utils/format';
import { Card } from '../../ui/card';

function HistoryRow({ booking }) {
  const payout = historyPayoutCents(booking);
  return (
    <Link to={`/partner/jobs/${booking.id}`} className="block">
      <Card
        variant="glass"
        className="transition hover:border-emerald-500/25 hover:ring-1 hover:ring-emerald-500/15"
      >
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-700 ring-1 ring-emerald-500/20 dark:text-emerald-200">
            <CheckCircle2 className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-emerald-800 dark:text-emerald-200">
                Completed
              </span>
              <span className="text-[10px] font-semibold tabular-nums text-wg-muted">
                {completedAtLabel(booking)}
              </span>
            </div>
            <p className="mt-1.5 line-clamp-2 text-sm font-bold leading-snug text-wg-text">
              {booking.service_address}
            </p>
            <p className="mt-0.5 text-xs text-wg-muted">
              Accepted & washed · tap to view job record
            </p>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span className="text-sm font-black tabular-nums text-wg-text">
              {formatCents(payout, booking.currency)}
            </span>
            <span className="text-[10px] font-semibold text-wg-muted">your share</span>
            <ChevronRight className="size-4 text-wg-muted" aria-hidden />
          </div>
        </div>
      </Card>
    </Link>
  );
}

/**
 * List of completed washes for the signed-in partner.
 */
export function WasherWashHistoryList({
  bookings,
  loading = false,
  limit = null,
  emptyTitle = 'No completed washes yet',
  emptyDescription = 'Jobs you accept and finish will appear here with payout and completion time.',
}) {
  const history = selectCompletedWashHistory(bookings);
  const visible = limit != null ? history.slice(0, limit) : history;

  if (loading) {
    return (
      <ul className="space-y-2">
        {[1, 2, 3].map((k) => (
          <li key={k} className="h-[5.25rem] animate-pulse rounded-2xl bg-wg-border/40 dark:bg-white/5" />
        ))}
      </ul>
    );
  }

  if (!visible.length) {
    return (
      <Card variant="glass" className="wg-partner-empty-dashed py-10 text-center">
        <History className="mx-auto size-8 text-wg-muted/60" strokeWidth={1.5} aria-hidden />
        <p className="mt-3 text-sm font-bold text-wg-text">{emptyTitle}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-wg-muted">{emptyDescription}</p>
      </Card>
    );
  }

  return (
    <ul className="space-y-2">
      {visible.map((b) => (
        <li key={b.id}>
          <HistoryRow booking={b} />
        </li>
      ))}
    </ul>
  );
}
