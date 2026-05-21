import { m } from 'framer-motion';
import { Link } from 'react-router-dom';
import { PieChart } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { Card } from '../../ui/card';
import { adminSectionContainer, adminSectionItem } from './adminMotion';
import { AdminBookingVolumeChart } from './components/AdminBookingVolumeChart';
import { AdminCustomerGrowthChart } from './components/AdminCustomerGrowthChart';
import { AdminDataNotice } from './components/AdminDataNotice';
import { AdminEarningsCard } from './components/AdminEarningsCard';
import { AdminKpiStrip } from './components/AdminKpiStrip';
import { AdminRepeatCustomerCard } from './components/AdminRepeatCustomerCard';
import { AdminRevenueChart } from './components/AdminRevenueChart';
import { AdminSatisfactionChart } from './components/AdminSatisfactionChart';
import { AdminZonePerformanceChart } from './components/AdminZonePerformanceChart';
import { useAdminOverview } from './hooks/useAdminOverview';

export function AdminRevenueView() {
  const reduced = useReducedMotion();
  const { data, chartsReady } = useAdminOverview();

  return (
    <m.div
      className="space-y-3 md:space-y-4"
      variants={adminSectionContainer(reduced)}
      initial="hidden"
      animate="show"
    >
      <m.div variants={adminSectionItem(reduced)} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="wg-heading-display">Revenue</h1>
          <p className="mt-1 max-w-2xl text-sm text-wg-muted">Gross performance, pipeline, and satisfaction — derived from completed bookings.</p>
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

      <m.div variants={adminSectionItem(reduced)}>
        <AdminKpiStrip kpis={data.kpis} loading={false} tickVersion={0} />
      </m.div>

      <m.div variants={adminSectionItem(reduced)}>
        <Card variant="enterprise" className="border-l-4 border-l-violet-500/50 border-white/15 p-4 dark:border-white/10">
          <p className="text-[10px] font-black uppercase tracking-wide text-wg-muted">{data.peakHourInsight?.title}</p>
          <p className="mt-1 text-sm font-bold text-wg-text">
            {data.peakHourInsight?.peakLabel} · +{data.peakHourInsight?.liftPct}% vs median
          </p>
          <p className="mt-2 text-xs leading-relaxed text-wg-muted">{data.peakHourInsight?.body}</p>
        </Card>
      </m.div>

      <div className="grid min-w-0 items-start gap-4 xl:grid-cols-3">
        <m.div variants={adminSectionItem(reduced)} className="min-w-0 space-y-4 xl:col-span-2">
          <AdminRevenueChart data={data.revenueSeries} chartsReady={chartsReady} />
          <AdminZonePerformanceChart data={data.zonePerformance} chartsReady={chartsReady} />
          <div className="grid min-w-0 items-start gap-4 lg:grid-cols-2">
            <AdminBookingVolumeChart data={data.bookingVolumeSeries} chartsReady={chartsReady} />
            <AdminCustomerGrowthChart data={data.customerGrowth} chartsReady={chartsReady} />
          </div>
        </m.div>
        <m.div variants={adminSectionItem(reduced)} className="min-w-0 space-y-4">
          <AdminRepeatCustomerCard repeatPct={data.kpis?.repeatCustomerPct} bookings30d={data.kpis?.bookings30d} />
          <AdminEarningsCard earnings={data.earnings} />
          <AdminSatisfactionChart segments={data.satisfaction} chartsReady={chartsReady} />
        </m.div>
      </div>
    </m.div>
  );
}
