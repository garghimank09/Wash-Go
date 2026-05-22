import { useMemo } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PieChart } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { adminSectionContainer, adminSectionItem } from './adminMotion';
import { AdminAssignmentQueueViz } from './components/AdminAssignmentQueueViz';
import { AdminDataNotice } from './components/AdminDataNotice';
import { AdminDispatchConsole } from './components/AdminDispatchConsole';
import { AdminFleetMetricsGrid } from './components/AdminFleetMetricsGrid';
import { AdminRefundQueueCard } from './components/AdminRefundQueueCard';
import { AdminTopPerformerCards } from './components/AdminTopPerformerCards';
import { useAdminOverview } from './hooks/useAdminOverview';
import { fleetWashersToGridRows } from '../../lib/adminBookingsMap';
import { useAdminDispatch } from './hooks/useAdminDispatch';

export function AdminOperationsView() {
  const reduced = useReducedMotion();
  const dispatch = useAdminDispatch();
  const { data } = useAdminOverview();
  const fleetGrid = useMemo(
    () => fleetWashersToGridRows(dispatch.fleetWashers),
    [dispatch.fleetWashers],
  );

  const refundRows = useMemo(
    () =>
      (data.escalations || []).map((e) => ({
        id: e.id,
        customer: e.subject,
        subject: e.subject,
        status: 'open',
        refundStatus: 'none',
        refundCents: 0,
      })),
    [data.escalations],
  );

  return (
    <m.div
      className="space-y-3 md:space-y-4"
      variants={adminSectionContainer(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={adminSectionItem(reduced)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="wg-heading-display">Operations hub</h1>
          <p className="mt-1 max-w-2xl text-sm text-wg-muted">
            Dispatch, fleet health, and assignment queue — synced from bookings and fleet APIs.
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

      <m.div variants={adminSectionItem(reduced)} className="space-y-3">
        <AdminAssignmentQueueViz queueLength={dispatch.queue.length} />
        <AdminDispatchConsole
          queue={dispatch.queue}
          selected={dispatch.selected}
          selectedId={dispatch.selectedId}
          onSelect={dispatch.selectBooking}
          suggestions={dispatch.suggestions}
          onAssign={dispatch.assignWasher}
        />
        <AdminTopPerformerCards performers={data.topPerformers} />
        <AdminFleetMetricsGrid washers={fleetGrid} />
        <AdminRefundQueueCard rows={refundRows} />
      </m.div>
    </m.div>
  );
}
