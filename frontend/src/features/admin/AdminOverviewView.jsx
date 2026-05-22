import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { BarChart3, ClipboardList } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';
import { adminSectionContainer, adminSectionItem } from './adminMotion';
import { AdminActiveBookingsMonitor } from './components/AdminActiveBookingsMonitor';
import { AdminBookingVolumeChart } from './components/AdminBookingVolumeChart';
import { AdminCustomerGrowthChart } from './components/AdminCustomerGrowthChart';
import { AdminDataNotice } from './components/AdminDataNotice';
import { AdminEarningsCard } from './components/AdminEarningsCard';
import { AdminFleetMetricsGrid } from './components/AdminFleetMetricsGrid';
import { AdminHeatmap } from './components/AdminHeatmap';
import { AdminKpiStrip } from './components/AdminKpiStrip';
import { AdminLiveFeed } from './components/AdminLiveFeed';
import { AdminLiveOpsCommandBar } from './components/AdminLiveOpsCommandBar';
import {
  AdminDispatchQueuePreview,
  AdminEscalationTrackerCard,
  AdminFleetStatusStrip,
  AdminPeakHourInsightCard,
  AdminRevenuePulseCard,
  AdminSlaAlertsCard,
} from './components/AdminOverviewDenseWidgets';
import { AdminRepeatCustomerCard } from './components/AdminRepeatCustomerCard';
import { AdminRevenueChart } from './components/AdminRevenueChart';
import { AdminSatisfactionChart } from './components/AdminSatisfactionChart';
import { AdminSurgeZonesCard } from './components/AdminSurgeZonesCard';
import { AdminTopPerformerCards } from './components/AdminTopPerformerCards';
import { AdminWasherGrid } from './components/AdminWasherGrid';
import { AdminZonePerformanceChart } from './components/AdminZonePerformanceChart';
import { useAdminLiveOps } from './hooks/useAdminLiveOps';
import { useAdminOverview } from './hooks/useAdminOverview';

function OpsGrid({ children, className }) {
  return <div className={cn('grid grid-cols-12 items-start gap-3 lg:gap-4', className)}>{children}</div>;
}

export function AdminOverviewView() {
  const reduced = useReducedMotion();
  const { data, chartsReady, loading, error } = useAdminOverview();
  const { snapshot, feedItems, tickVersion } = useAdminLiveOps(true);

  return (
    <m.div
      className="space-y-3 md:space-y-4"
      variants={adminSectionContainer(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={adminSectionItem(reduced)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="wg-heading-display">Command center</h1>
          <p className="mt-1 max-w-3xl text-sm text-wg-muted">
            Live bookings, dispatch, fleet, and analytics — all synced from the API (SSE).
          </p>
        </div>
        <Link
          to="/admin/operations"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-wg-border bg-transparent px-4 py-2.5 text-sm font-semibold text-wg-text transition wg-focus-ring hover:bg-wg-surface-elevated dark:hover:bg-slate-800/80"
        >
          <ClipboardList className="size-4" strokeWidth={1.75} aria-hidden />
          Operations desk
        </Link>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminDataNotice />
      </m.div>

      {error ? (
        <m.div variants={adminSectionItem(reduced)}>
          <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-800 dark:text-rose-200">
            Could not load admin data: {error}
          </p>
        </m.div>
      ) : null}

      <m.div variants={adminSectionItem(reduced)} className="space-y-3">
        <AdminLiveOpsCommandBar snapshot={snapshot} />
        <AdminActiveBookingsMonitor
          rows={data.activeMonitorRows}
          liveCount={data.activeMonitorLiveCount}
          loading={loading}
        />
      </m.div>

      {data.surgeZones?.length ? (
        <m.div variants={adminSectionItem(reduced)}>
          <AdminSurgeZonesCard zones={data.surgeZones} />
        </m.div>
      ) : null}

      <m.div variants={adminSectionItem(reduced)}>
        <AdminFleetStatusStrip snapshot={snapshot} />
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminKpiStrip kpis={data.kpis} loading={false} tickVersion={tickVersion} />
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <OpsGrid>
          <div className="col-span-12 min-w-0 xl:col-span-6 2xl:col-span-7">
            <AdminRevenueChart data={data.revenueSeries} chartsReady={chartsReady} />
          </div>
          <div className="col-span-12 flex min-w-0 flex-col gap-3 sm:flex-row xl:col-span-3 2xl:col-span-2 xl:flex-col">
            <AdminRevenuePulseCard series={data.revenueSeries} kpis={data.kpis} />
            <AdminRepeatCustomerCard repeatPct={data.kpis?.repeatCustomerPct} bookings30d={data.kpis?.bookings30d} />
          </div>
          <div className="col-span-12 min-w-0 self-start xl:col-span-3 2xl:col-span-3">
            <AdminEarningsCard earnings={data.earnings} />
          </div>
        </OpsGrid>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <OpsGrid>
          <div className="col-span-12 min-w-0 md:col-span-6">
            <AdminBookingVolumeChart data={data.bookingVolumeSeries} chartsReady={chartsReady} />
          </div>
          <div className="col-span-12 min-w-0 md:col-span-6">
            <AdminCustomerGrowthChart data={data.customerGrowth} chartsReady={chartsReady} />
          </div>
        </OpsGrid>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <OpsGrid>
          <div className="col-span-12 min-w-0 lg:col-span-6">
            <AdminZonePerformanceChart data={data.zonePerformance} chartsReady={chartsReady} />
          </div>
          <div className="col-span-12 min-w-0 lg:col-span-6">
            <AdminSatisfactionChart segments={data.satisfaction} chartsReady={chartsReady} />
          </div>
        </OpsGrid>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <OpsGrid>
          <div className="col-span-12 min-w-0 xl:col-span-7">
            <AdminHeatmap matrix={data.heatmap.matrix} dayLabels={data.heatmap.dayLabels} hourLabels={data.heatmap.hourLabels} />
          </div>
          <div className="col-span-12 min-w-0 self-start xl:col-span-5">
            <AdminLiveFeed items={feedItems} />
          </div>
        </OpsGrid>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <OpsGrid>
          <div className="col-span-12 min-h-0 min-w-0 md:col-span-6 xl:col-span-4">
            <AdminDispatchQueuePreview queue={data.dispatchQueue} isLive={data.dispatchQueue?.length > 0} />
          </div>
          <div className="col-span-12 min-h-0 min-w-0 md:col-span-6 xl:col-span-4">
            <AdminSlaAlertsCard items={data.slaAlerts} />
          </div>
          <div className="col-span-12 min-h-0 min-w-0 xl:col-span-4">
            <AdminEscalationTrackerCard items={data.escalations} />
          </div>
        </OpsGrid>
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <AdminPeakHourInsightCard insight={data.peakHourInsight} />
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <OpsGrid>
          <div className="col-span-12 min-w-0 xl:col-span-6">
            <AdminFleetMetricsGrid washers={data.washers} />
          </div>
          <div className="col-span-12 min-w-0 xl:col-span-6">
            <AdminWasherGrid washers={data.washers} />
          </div>
        </OpsGrid>
      </m.div>

      <m.div variants={adminSectionItem(reduced)} className="space-y-3">
        <AdminTopPerformerCards performers={data.topPerformers} />
        <DrillIntoQueuesCard />
      </m.div>
    </m.div>
  );
}

function DrillIntoQueuesCard() {
  return (
    <div className="flex flex-col gap-4 rounded-[var(--radius-wg-card)] border border-white/25 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-600/10 p-4 shadow-wg-card sm:flex-row sm:items-center sm:justify-between dark:border-white/10">
      <div>
        <div className="flex items-center gap-2 text-wg-text">
          <BarChart3 className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
          <p className="text-sm font-bold">Drill into queues</p>
        </div>
        <p className="mt-2 text-xs leading-relaxed text-wg-muted">
          Filters, booking edits, complaint triage, and full dispatch console on the operations desk.
        </p>
      </div>
      <Link
        to="/admin/operations"
        className="inline-flex w-full shrink-0 items-center justify-center rounded-xl bg-gradient-to-r from-brand-from to-brand-to px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-cyan-500/25 transition hover:brightness-110 active:scale-[0.98] sm:w-auto wg-focus-ring"
      >
        Open operations
      </Link>
    </div>
  );
}
