import { useState } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

import { ListPagination } from '../../components/list/ListPagination';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { usePaginatedList } from '../../hooks/usePaginatedList';
import { compareByScheduledAt } from '../../lib/paginatedList';
import { adminSectionContainer, adminSectionItem } from './adminMotion';
import { AdminBookingsTable } from './components/AdminBookingsTable';
import { AdminDataNotice } from './components/AdminDataNotice';
import { AdminOperationsToolbar } from './components/AdminOperationsToolbar';
import { useAdminOperations } from './hooks/useAdminOperations';

function matchAdminRowStatus(row, filter) {
  if (!filter || filter === 'all') return true;
  return row.status === filter;
}

function searchAdminRow(row, q) {
  const hay = [row.customer, row.washer, row.city, row.id, row.rawId, row.status].join(' ').toLowerCase();
  return hay.includes(q);
}

function compareAdminRow(a, b, sort) {
  return compareByScheduledAt({ scheduled_at: a.scheduledAt }, { scheduled_at: b.scheduledAt }, sort);
}

export function AdminBookingsView() {
  const reduced = useReducedMotion();
  const { bookings, query, setQuery, statusFilter, setStatusFilter } = useAdminOperations();
  const [sort, setSort] = useState('newest');

  const { pageItems, filteredCount, page, setPage, totalPages, rangeStart, rangeEnd } = usePaginatedList(
    bookings,
    {
      statusFilter,
      query,
      sort,
      matchStatus: matchAdminRowStatus,
      matchSearch: searchAdminRow,
      compare: compareAdminRow,
    },
  );

  return (
    <m.div
      className="space-y-6 lg:space-y-8"
      variants={adminSectionContainer(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={adminSectionItem(reduced)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="wg-heading-display">Booking management</h1>
          <p className="mt-1 max-w-2xl text-sm text-wg-muted">Filter and review the live queue. Full triage lives in Operations hub.</p>
        </div>
        <Link
          to="/admin/operations"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-wg-border bg-transparent px-4 py-2.5 text-sm font-semibold text-wg-text transition wg-focus-ring hover:bg-wg-surface-elevated dark:hover:bg-slate-800/80"
        >
          <LayoutGrid className="size-4" strokeWidth={1.75} aria-hidden />
          Operations hub
        </Link>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminDataNotice />
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminOperationsToolbar
          scope="bookings"
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          sort={sort}
          onSort={setSort}
        />
      </m.div>

      <m.div variants={adminSectionItem(reduced)} className="space-y-4">
        <AdminBookingsTable rows={pageItems} />
        <ListPagination
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          totalCount={filteredCount}
        />
      </m.div>
    </m.div>
  );
}
