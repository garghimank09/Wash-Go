import { useState } from 'react';
import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { LayoutGrid } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';
import { adminSectionContainer, adminSectionItem } from './adminMotion';
import { AdminDataNotice } from './components/AdminDataNotice';
import { AdminDirectoryCustomerTable } from './components/AdminDirectoryCustomerTable';
import { AdminDirectoryDrawer } from './components/AdminDirectoryDrawer';
import { AdminDirectoryMetricsStrip } from './components/AdminDirectoryMetricsStrip';
import { AdminDirectoryPartnerTable } from './components/AdminDirectoryPartnerTable';
import { AdminDirectoryStaffTable } from './components/AdminDirectoryStaffTable';
import { AdminDirectoryTabs } from './components/AdminDirectoryTabs';
import { AdminDirectoryToolbar } from './components/AdminDirectoryToolbar';
import { useAdminDirectory } from './hooks/useAdminDirectory';

export function AdminUsersView() {
  const reduced = useReducedMotion();
  const [segment, setSegment] = useState('customers');

  return (
    <m.div
      className="space-y-6 lg:space-y-8"
      variants={adminSectionContainer(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={adminSectionItem(reduced)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="wg-heading-display">Operations directory</h1>
          <p className="mt-1 max-w-2xl text-sm text-wg-muted">
            Customers and partners from live bookings and fleet; staff from your signed-in admin session.
          </p>
        </div>
        <Link
          to="/admin"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-wg-border bg-transparent px-4 py-2.5 text-sm font-semibold text-wg-text transition wg-focus-ring hover:bg-wg-surface-elevated dark:hover:bg-slate-800/80"
        >
          <LayoutGrid className="size-4" strokeWidth={1.75} aria-hidden />
          Command center
        </Link>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminDataNotice />
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminDirectoryTabs value={segment} onChange={setSegment} />
      </m.div>

      <AdminDirectoryPanel key={segment} segment={segment} />
    </m.div>
  );
}

function AdminDirectoryPanel({ segment }) {
  const reduced = useReducedMotion();
  const { rows, metrics, search, setSearch, chip, setChip, tickVersion } = useAdminDirectory(segment);
  const [drawerRow, setDrawerRow] = useState(null);

  const onExportDemo = () => {
    toast.success('Export queued — connect admin API for CSV (demo).', { duration: 2400 });
  };

  const segmentIntro =
    segment === 'customers'
      ? 'Consumer-oriented profiles — bookings, loyalty, LTV, and complaint posture.'
      : segment === 'partners'
        ? 'Fleet and field partners — presence, performance, earnings, and operational state.'
        : 'Internal staff — roles, permissions, access planes, and session posture.';

  return (
    <>
      <m.div
        variants={adminSectionItem(reduced)}
        className={cn(
          'rounded-2xl border border-white/12 bg-gradient-to-br p-4 ring-1 ring-black/[0.03] dark:ring-white/5',
          segment === 'customers' && 'from-cyan-500/[0.06] via-transparent to-indigo-500/[0.04]',
          segment === 'partners' && 'from-emerald-500/[0.07] via-transparent to-slate-500/[0.05]',
          segment === 'staff' && 'from-violet-500/[0.08] via-transparent to-indigo-500/[0.05]',
        )}
      >
        <p className="text-xs font-semibold leading-relaxed text-wg-muted">{segmentIntro}</p>
        <div className="mt-4">
          <AdminDirectoryMetricsStrip segment={segment} metrics={metrics} />
        </div>
        <div className="mt-6 space-y-4">
          <AdminDirectoryToolbar
            segment={segment}
            search={search}
            onSearchChange={setSearch}
            chip={chip}
            onChipChange={setChip}
            onExportDemo={onExportDemo}
          />
        </div>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        {segment === 'customers' ? (
          <AdminDirectoryCustomerTable rows={rows} onPreview={(r) => setDrawerRow(r)} />
        ) : null}
        {segment === 'partners' ? (
          <AdminDirectoryPartnerTable rows={rows} onPreview={(r) => setDrawerRow(r)} tickVersion={tickVersion} />
        ) : null}
        {segment === 'staff' ? <AdminDirectoryStaffTable rows={rows} onPreview={(r) => setDrawerRow(r)} /> : null}
      </m.div>

      <AdminDirectoryDrawer open={Boolean(drawerRow)} segment={segment} row={drawerRow} onClose={() => setDrawerRow(null)} />
    </>
  );
}
