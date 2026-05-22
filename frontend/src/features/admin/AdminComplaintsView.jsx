import { useMemo } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { AlertTriangle, LayoutGrid, RefreshCw } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { adminSectionContainer, adminSectionItem } from './adminMotion';
import { AdminComplaintsTable } from './components/AdminComplaintsTable';
import { AdminDataNotice } from './components/AdminDataNotice';
import { AdminOperationsToolbar } from './components/AdminOperationsToolbar';
import { useAdminOperations } from './hooks/useAdminOperations';
import { Card } from '../../ui/card';

export function AdminComplaintsView() {
  const reduced = useReducedMotion();
  const { complaints, query, setQuery, complaintStatus, setComplaintStatus } = useAdminOperations();

  const stats = useMemo(() => {
    const rows = complaints;
    const open = rows.filter((r) => r.status === 'open').length;
    const inReview = rows.filter((r) => r.status === 'in_review').length;
    const now = Date.now();
    const slaOverdue = rows.filter((r) => r.slaDueAt && new Date(r.slaDueAt).getTime() < now).length;
    const refundsPending = rows.filter((r) => r.refundStatus === 'requested').length;
    return { open, inReview, slaOverdue, refundsPending };
  }, [complaints]);

  return (
    <m.div
      className="space-y-6 lg:space-y-8"
      variants={adminSectionContainer(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={adminSectionItem(reduced)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="wg-heading-display">Complaints</h1>
          <p className="mt-1 max-w-2xl text-sm text-wg-muted">Case queue and SLA signals — synced when a complaints API is connected.</p>
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

      <m.div variants={adminSectionItem(reduced)} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Card variant="enterprise" className="border-l-4 border-l-sky-500/50 p-4">
          <p className="text-[10px] font-bold uppercase text-wg-muted">Open cases</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">{stats.open}</p>
        </Card>
        <Card variant="enterprise" className="border-l-4 border-l-violet-500/50 p-4">
          <p className="text-[10px] font-bold uppercase text-wg-muted">In review</p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">{stats.inReview}</p>
        </Card>
        <Card variant="enterprise" className="border-l-4 border-l-amber-500/50 p-4">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-wg-muted">
            <AlertTriangle className="size-3" strokeWidth={2} aria-hidden />
            SLA overdue
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-amber-800 dark:text-amber-200">{stats.slaOverdue}</p>
        </Card>
        <Card variant="enterprise" className="border-l-4 border-l-rose-500/50 p-4">
          <p className="flex items-center gap-1 text-[10px] font-bold uppercase text-wg-muted">
            <RefreshCw className="size-3" strokeWidth={2} aria-hidden />
            Refunds pending
          </p>
          <p className="mt-1 text-2xl font-black tabular-nums text-wg-text">{stats.refundsPending}</p>
        </Card>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminOperationsToolbar
          scope="complaints"
          query={query}
          onQueryChange={setQuery}
          complaintStatus={complaintStatus}
          onComplaintStatus={setComplaintStatus}
        />
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminComplaintsTable rows={complaints} />
      </m.div>
    </m.div>
  );
}
