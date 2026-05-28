import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, History } from 'lucide-react';

import { ListFilterToolbar } from '../../components/list/ListFilterToolbar';
import { ListPagination } from '../../components/list/ListPagination';
import { WasherWashHistoryList } from '../../features/washer/WasherWashHistoryList';
import { usePartnerBookings } from '../../hooks/usePartnerBookings';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { selectCompletedWashHistory } from '../../lib/partnerWashHistory';
import { compareByScheduledAt, matchCustomerBookingStatus, searchBookingRow } from '../../lib/paginatedList';
import { formatCents } from '../../utils/format';
import { Card } from '../../ui/card';
import { CustomerBookingStatusPill } from '../../features/bookings/CustomerBookingStatusPill';

const UPCOMING_STATUS_OPTIONS = ['all', 'active', 'pending', 'confirmed', 'in_progress'];

export function WasherSchedulePage() {
  const { items, loading, error } = usePartnerBookings();
  const [statusFilter, setStatusFilter] = useState('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');

  const upcomingSource = useMemo(
    () =>
      [...(items || [])]
        .filter((b) => b.status !== 'cancelled' && b.status !== 'completed')
        .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at)),
    [items],
  );

  const completedCount = selectCompletedWashHistory(items).length;

  const { pageItems, filteredCount, page, setPage, totalPages, rangeStart, rangeEnd } = usePaginatedList(
    upcomingSource,
    {
      statusFilter,
      query,
      sort,
      matchStatus: matchCustomerBookingStatus,
      matchSearch: searchBookingRow,
      compare: compareByScheduledAt,
    },
  );

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-black text-wg-text">Schedule</h1>
        <p className="mt-1 text-sm text-wg-muted">Upcoming assigned jobs and your completed wash record.</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-wg-muted">Upcoming</h2>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        {loading ? <p className="text-sm text-wg-muted">Loading…</p> : null}

        {!loading && upcomingSource.length > 0 ? (
          <ListFilterToolbar
            query={query}
            onQueryChange={setQuery}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            statusOptions={UPCOMING_STATUS_OPTIONS}
            sort={sort}
            onSort={setSort}
            queryPlaceholder="Search address or customer…"
          />
        ) : null}

        {!loading && upcomingSource.length === 0 ? (
          <Card variant="glass" className="py-10 text-center text-sm text-wg-muted">
            No upcoming assignments. Customer bookings appear here once linked to your washer profile.
          </Card>
        ) : null}

        {!loading && upcomingSource.length > 0 && filteredCount === 0 ? (
          <Card variant="glass" className="py-8 text-center text-sm text-wg-muted">
            No upcoming jobs match your filters.
          </Card>
        ) : null}

        {!loading && filteredCount > 0 ? (
          <div className="space-y-3">
            <ul className="space-y-2">
              {pageItems.map((b) => (
                <li key={b.id}>
                  <Link to={`/partner/jobs/${b.id}`}>
                    <Card variant="glass" className="transition hover:ring-1 hover:ring-cyan-500/20">
                      <div className="flex items-start gap-3">
                        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-wg-surface text-cyan-700 ring-1 ring-wg-border dark:bg-white/[0.06] dark:text-cyan-300">
                          <CalendarClock className="size-5" strokeWidth={1.75} aria-hidden />
                        </span>
                        <div className="min-w-0 flex-1">
                          <CustomerBookingStatusPill booking={b} />
                          <p className="mt-2 text-sm font-bold text-wg-text">
                            {new Date(b.scheduled_at).toLocaleString()}
                          </p>
                          <p className="mt-1 line-clamp-2 text-xs text-wg-muted">{b.service_address}</p>
                        </div>
                        <span className="shrink-0 text-sm font-black tabular-nums">
                          {formatCents(b.price_cents, b.currency)}
                        </span>
                      </div>
                    </Card>
                  </Link>
                </li>
              ))}
            </ul>
            <ListPagination
              page={page}
              totalPages={totalPages}
              onPageChange={setPage}
              rangeStart={rangeStart}
              rangeEnd={rangeEnd}
              totalCount={filteredCount}
            />
          </div>
        ) : null}
      </section>

      <section className="space-y-3 border-t border-wg-border/60 pt-8 dark:border-white/10">
        <div className="flex items-end justify-between gap-3">
          <div>
            <h2 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-wg-muted">
              <History className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} aria-hidden />
              Completed washes
            </h2>
            <p className="mt-1 text-xs text-wg-muted">
              {loading ? '—' : `${completedCount} accepted & finished`}
            </p>
          </div>
          <Link
            to="/partner/history"
            className="text-xs font-bold text-cyan-700 dark:text-cyan-300"
          >
            Full history →
          </Link>
        </div>
        <WasherWashHistoryList bookings={items} loading={loading} limit={8} />
      </section>
    </div>
  );
}
