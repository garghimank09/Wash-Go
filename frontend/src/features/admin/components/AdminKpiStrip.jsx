import { CalendarCheck, DollarSign, HeadphonesIcon, Percent, RefreshCw, TrendingUp, Truck, Users } from 'lucide-react';
import { m } from 'framer-motion';

import { StatCard } from '../../../ui/stat-card';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { formatCents } from '../../../utils/format';

export function AdminKpiStrip({ kpis, loading, tickVersion = 0 }) {
  const reduced = useReducedMotion();

  return (
    <div className="space-y-3">
      <m.div
        key={tickVersion ? `kpi-tick-${tickVersion}` : 'kpi'}
        className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6"
        animate={reduced || !tickVersion ? undefined : { opacity: [0.94, 1] }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <StatCard
          label="Revenue (30d)"
          value={kpis ? formatCents(kpis.revenue30dCents) : '—'}
          loading={loading}
          animate={false}
          icon={DollarSign}
          variant="glass"
        />
        <StatCard
          label="Bookings (30d)"
          value={kpis?.bookings30d ?? 0}
          loading={loading}
          icon={CalendarCheck}
          variant="glass"
        />
        <StatCard
          label="Active washers"
          value={kpis?.activeWashers ?? 0}
          loading={loading}
          icon={Truck}
          variant="glass"
        />
        <StatCard
          label="Open complaints"
          value={kpis?.openComplaints ?? 0}
          loading={loading}
          icon={HeadphonesIcon}
          variant="glass"
        />
        <StatCard
          label="CSAT score"
          value={kpis?.csatScore ?? 0}
          loading={loading}
          suffix="/5"
          decimals={1}
          animate={false}
          icon={Users}
          variant="glass"
        />
        <StatCard
          label="Customer growth"
          value={kpis?.customerGrowthPct ?? 0}
          loading={loading}
          suffix="%"
          decimals={1}
          icon={TrendingUp}
          variant="glass"
        />
      </m.div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-3">
        <StatCard
          label="Repeat customers"
          value={kpis?.repeatCustomerPct ?? 0}
          loading={loading}
          suffix="%"
          decimals={1}
          icon={Percent}
          variant="glass"
        />
        <StatCard
          label="Refunds pending"
          value={kpis?.refundsPending ?? 0}
          loading={loading}
          icon={RefreshCw}
          variant="glass"
        />
        <StatCard
          label="Avg acceptance"
          value={kpis?.avgAcceptancePct ?? 0}
          loading={loading}
          suffix="%"
          decimals={0}
          icon={Truck}
          variant="glass"
        />
      </div>
    </div>
  );
}
