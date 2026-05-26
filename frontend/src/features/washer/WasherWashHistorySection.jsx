import { Link } from 'react-router-dom';
import { ArrowRight, History } from 'lucide-react';

import { selectCompletedWashHistory } from '../../lib/partnerWashHistory';
import { WasherWashHistoryList } from './WasherWashHistoryList';

/** Dashboard preview — recent completed washes + link to full history. */
export function WasherWashHistorySection({ bookings, loading }) {
  const total = selectCompletedWashHistory(bookings).length;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-wg-muted">
            <History className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} aria-hidden />
            Wash history
          </h2>
          <p className="mt-1 text-xs text-wg-muted">
            {loading ? 'Loading…' : `${total} completed ${total === 1 ? 'job' : 'jobs'} you accepted`}
          </p>
        </div>
        {total > 0 ? (
          <Link
            to="/partner/history"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-bold text-cyan-700 dark:text-cyan-300"
          >
            View all
            <ArrowRight className="size-3.5" strokeWidth={2} aria-hidden />
          </Link>
        ) : null}
      </div>
      <WasherWashHistoryList bookings={bookings} loading={loading} limit={5} />
    </section>
  );
}
