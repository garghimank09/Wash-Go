import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PieChart } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { adminSectionContainer, adminSectionItem } from './adminMotion';
import { AdminAssignmentQueueViz } from './components/AdminAssignmentQueueViz';
import { AdminBookingsTable } from './components/AdminBookingsTable';
import { AdminComplaintsTable } from './components/AdminComplaintsTable';
import { AdminDataNotice } from './components/AdminDataNotice';
import { AdminDispatchConsole } from './components/AdminDispatchConsole';
import { AdminFleetMetricsGrid } from './components/AdminFleetMetricsGrid';
import { AdminOperationsToolbar } from './components/AdminOperationsToolbar';
import { AdminRefundQueueCard } from './components/AdminRefundQueueCard';
import { AdminTopPerformerCards } from './components/AdminTopPerformerCards';
import { useAdminDispatch } from './hooks/useAdminDispatch';
import { useAdminOperations } from './hooks/useAdminOperations';
import { adminComplaintsRows, adminTopPerformers, adminWashers } from './mock/adminMock';

export function AdminOperationsView() {
  const reduced = useReducedMotion();
  const {
    bookings,
    complaints,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    complaintStatus,
    setComplaintStatus,
  } = useAdminOperations();
  const dispatch = useAdminDispatch();

  return (
    <m.div
      className="space-y-6 lg:space-y-8"
      variants={adminSectionContainer(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={adminSectionItem(reduced)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="wg-heading-display">Operations desk</h1>
          <p className="mt-1 max-w-2xl text-sm text-wg-muted">
            Search, filter, and triage bookings and complaints. Mock dataset until admin APIs ship.
          </p>
        </div>
        <Link
          to="/admin"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-wg-border bg-transparent px-4 py-2.5 text-sm font-semibold text-wg-text transition wg-focus-ring hover:bg-wg-surface-elevated dark:hover:bg-slate-800/80"
        >
          <PieChart className="size-4" strokeWidth={1.75} aria-hidden />
          Command center
        </Link>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminDataNotice />
      </m.div>

      <m.div variants={adminSectionItem(reduced)} className="space-y-4">
        <AdminAssignmentQueueViz queueLength={dispatch.queue.length} />
        <AdminDispatchConsole
          queue={dispatch.queue}
          selected={dispatch.selected}
          selectedId={dispatch.selectedId}
          onSelect={dispatch.selectBooking}
          suggestions={dispatch.suggestions}
          onAssign={dispatch.assignWasher}
        />
        <AdminTopPerformerCards performers={adminTopPerformers} />
        <AdminFleetMetricsGrid washers={adminWashers} />
        <AdminRefundQueueCard rows={adminComplaintsRows} />
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminOperationsToolbar
          query={query}
          onQueryChange={setQuery}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          complaintStatus={complaintStatus}
          onComplaintStatus={setComplaintStatus}
        />
      </m.div>

      <m.div variants={adminSectionItem(reduced)} className="space-y-8">
        <AdminBookingsTable rows={bookings} />
        <AdminComplaintsTable rows={complaints} />
      </m.div>
    </m.div>
  );
}
