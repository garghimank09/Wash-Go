import { Card } from '../../../ui/card';
import { formatCents } from '../../../utils/format';
import { cn } from '../../../lib/cn';

export function AdminDirectoryMetricsStrip({ segment, metrics }) {
  if (segment === 'customers') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Profiles" value={metrics.count} sub="In current filter" accent="cyan" />
        <MetricCard label="Total bookings" value={metrics.totalBookings} sub="Sum in cohort" accent="indigo" />
        <MetricCard label="Lifetime value" value={formatCents(metrics.totalLtvCents || 0)} sub="Cohort LTV" accent="emerald" isText />
        <MetricCard label="Open complaints" value={metrics.openComplaints} sub="Needs care" accent="amber" />
      </div>
    );
  }
  if (segment === 'partners') {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Partners" value={metrics.count} sub="In filter" accent="slate" />
        <MetricCard label="Online now" value={metrics.online} sub="Live on fleet map" accent="emerald" />
        <MetricCard label="Busy on job" value={metrics.busy} sub="Active wash" accent="amber" />
        <MetricCard label="Partner share" value={formatCents(metrics.earningsYtdCents || 0)} sub="Ledger total" accent="cyan" isText />
      </div>
    );
  }
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <MetricCard label="Staff" value={metrics.count} sub="Directory" accent="violet" />
      <MetricCard label="Production access" value={metrics.productionAccess} sub="Live systems" accent="emerald" />
      <MetricCard label="Super admins" value={metrics.superAdmin} sub="Elevated roles" accent="rose" />
      <MetricCard label="Active now" value={metrics.activeNow} sub="Session signal" accent="cyan" />
    </div>
  );
}

function MetricCard({ label, value, sub, accent, isText }) {
  const border = {
    cyan: 'border-l-cyan-500/60',
    indigo: 'border-l-indigo-500/60',
    emerald: 'border-l-emerald-500/60',
    amber: 'border-l-amber-500/60',
    slate: 'border-l-slate-500/60',
    violet: 'border-l-violet-500/60',
    rose: 'border-l-rose-500/60',
  }[accent] || 'border-l-cyan-500/60';

  return (
    <Card variant="enterprise" className={cn('border-l-4 p-4', border, 'border-y border-r border-white/15 dark:border-white/10')}>
      <p className="text-[10px] font-black uppercase tracking-wide text-wg-muted">{label}</p>
      <p className={cn('mt-1 font-black text-wg-text', isText ? 'text-lg' : 'text-2xl tabular-nums')}>{value}</p>
      <p className="mt-0.5 text-[10px] text-wg-muted">{sub}</p>
    </Card>
  );
}
