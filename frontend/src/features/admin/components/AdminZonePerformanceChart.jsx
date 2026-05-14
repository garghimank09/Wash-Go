import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from 'react-loading-skeleton';

import { Card } from '../../../ui/card';
import { ChartMeasuredContainer } from '../../dashboard/ChartMeasuredContainer';
import { formatCents } from '../../../utils/format';

function ZoneTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;
  return (
    <div className="rounded-xl border border-wg-border bg-wg-surface-elevated px-3 py-2 text-xs shadow-lg">
      <p className="font-bold text-wg-text">{row.zone}</p>
      <p className="mt-1 text-wg-muted">
        Revenue <span className="font-semibold text-wg-text">{formatCents(row.revenueCents)}</span>
      </p>
      <p className="text-wg-muted">
        Bookings <span className="font-semibold text-wg-text">{row.bookings}</span>
      </p>
      <p className="text-wg-muted">
        Repeat <span className="font-semibold text-wg-text">{row.repeatPct}%</span>
      </p>
    </div>
  );
}

export function AdminZonePerformanceChart({ data, chartsReady }) {
  const chartData = (data || []).map((z) => ({
    ...z,
    revenueK: Math.round(z.revenueCents / 1000),
  }));

  if (!chartsReady) {
    return (
      <Card variant="glass" className="min-h-[240px] min-w-0">
        <h2 className="wg-heading-section">City / zone performance</h2>
        <p className="mt-1 text-xs text-wg-muted">Revenue by metro (mock).</p>
        <div className="mt-4">
          <Skeleton height={200} borderRadius={12} />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-h-[240px] min-w-0 border-white/20 transition hover:ring-1 hover:ring-cyan-500/20 dark:hover:ring-cyan-400/15">
      <h2 className="wg-heading-section">City / zone performance</h2>
      <p className="mt-1 text-xs text-wg-muted">Revenue (thousands USD) · hover for bookings & repeat mix.</p>
      <ChartMeasuredContainer className="mt-4 h-56 w-full min-w-0">
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <BarChart data={chartData} layout="vertical" margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-wg-border" horizontal={false} />
              <XAxis
                type="number"
                tickFormatter={(v) => `$${v}k`}
                tick={{ fontSize: 11, fill: 'var(--wg-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="zone"
                width={100}
                tick={{ fontSize: 11, fill: 'var(--wg-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={ZoneTooltip} cursor={{ fill: 'rgb(6 182 212 / 0.06)' }} />
              <Bar dataKey="revenueK" fill="rgb(6 182 212)" radius={[0, 6, 6, 0]} maxBarSize={26} name="Revenue" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartMeasuredContainer>
    </Card>
  );
}
