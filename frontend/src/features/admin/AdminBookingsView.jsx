import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { LayoutGrid } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { adminSectionContainer, adminSectionItem } from './adminMotion';
import { AdminBookingsTable } from './components/AdminBookingsTable';
import { AdminDataNotice } from './components/AdminDataNotice';
import { AdminOperationsToolbar } from './components/AdminOperationsToolbar';
import { useAdminOperations } from './hooks/useAdminOperations';

export function AdminBookingsView() {
  const reduced = useReducedMotion();
  const { bookings, query, setQuery, statusFilter, setStatusFilter } = useAdminOperations();

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
        />
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminBookingsTable rows={bookings} />
      </m.div>
    </m.div>
  );
}
