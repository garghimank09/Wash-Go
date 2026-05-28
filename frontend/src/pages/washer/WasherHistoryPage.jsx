import { useMemo, useState } from 'react';
import { History } from 'lucide-react';

import { ListFilterToolbar } from '../../components/list/ListFilterToolbar';
import { ListPagination } from '../../components/list/ListPagination';
import { WasherWashHistoryList } from '../../features/washer/WasherWashHistoryList';
import { usePartnerBookings } from '../../hooks/usePartnerBookings';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { selectCompletedWashHistory, historyPayoutCents } from '../../lib/partnerWashHistory';
import { compareByScheduledAt, searchBookingRow } from '../../lib/paginatedList';
import { formatCents } from '../../utils/format';
import { Card } from '../../ui/card';

export function WasherHistoryPage() {
  const { items, loading, error } = usePartnerBookings();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('newest');

  const historySource = useMemo(() => selectCompletedWashHistory(items), [items]);

  const { pageItems, filteredCount, page, setPage, totalPages, rangeStart, rangeEnd } = usePaginatedList(
    historySource,
    {
      query,
      sort,
      matchSearch: searchBookingRow,
      compare: compareByScheduledAt,
    },
  );

  const totalPayout = useMemo(
    () => historySource.reduce((sum, b) => sum + historyPayoutCents(b), 0),
    [historySource],
  );

  return (
    <div className="space-y-5">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-black text-wg-text">
          <History className="size-7 text-emerald-600 dark:text-emerald-400" strokeWidth={1.75} aria-hidden />
          Wash history
        </h1>
        <p className="mt-1 text-sm text-wg-muted">
          Every job you accepted and completed — payout shown at your 90% partner share.
        </p>
      </div>

      {!loading && historySource.length > 0 ? (
        <Card variant="glass" className="border-emerald-500/20 bg-gradient-to-br from-emerald-500/8 to-transparent p-4 dark:border-emerald-500/10">
          <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">Lifetime completed</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">{historySource.length}</p>
          <p className="mt-0.5 text-sm text-wg-muted">
            Total partner share · <span className="font-bold text-wg-text">{formatCents(totalPayout)}</span>
          </p>
        </Card>
      ) : null}

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {!loading && historySource.length > 0 ? (
        <ListFilterToolbar
          query={query}
          onQueryChange={setQuery}
          showStatus={false}
          sort={sort}
          onSort={setSort}
          queryPlaceholder="Search address…"
        />
      ) : null}

      {!loading && historySource.length > 0 && filteredCount === 0 ? (
        <Card variant="glass" className="py-8 text-center text-sm text-wg-muted">
          No completed washes match your search.
        </Card>
      ) : (
        <WasherWashHistoryList loading={loading} rows={pageItems} />
      )}

      {!loading && filteredCount > 0 ? (
        <ListPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalCount={filteredCount}
        />
      ) : null}
    </div>
  );
}
