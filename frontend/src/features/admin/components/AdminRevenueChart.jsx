import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from 'react-loading-skeleton';

import { Card } from '../../../ui/card';
import { ChartMeasuredContainer } from '../../dashboard/ChartMeasuredContainer';

export function AdminRevenueChart({ data, chartsReady }) {
  const gradId = useId().replace(/:/g, '');

  if (!chartsReady) {
    return (
      <Card variant="glass" className="min-h-[220px] min-w-0">
        <h2 className="wg-heading-section">Revenue</h2>
        <p className="mt-1 text-xs text-wg-muted">Gross booking volume by month (USD, mock).</p>
        <div className="mt-6 space-y-2">
          <Skeleton height={180} borderRadius={12} />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-h-[220px] min-w-0 transition hover:ring-1 hover:ring-cyan-500/20 dark:hover:ring-cyan-400/15">
      <div>
        <h2 className="wg-heading-section">Revenue</h2>
        <p className="mt-1 text-xs text-wg-muted">Gross booking volume by month (USD, mock).</p>
      </div>
      <ChartMeasuredContainer className="mt-4 h-52 w-full min-w-0">
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--wg-brand-from)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--wg-brand-to)" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-wg-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => `$${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
                width={44}
                tick={{ fontSize: 11, fill: 'var(--wg-muted)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ stroke: 'rgb(6 182 212 / 0.25)', strokeWidth: 1 }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--wg-border)',
                  background: 'var(--wg-surface-elevated)',
                  color: 'var(--wg-text)',
                }}
                formatter={(v) => [`$${Number(v).toLocaleString()}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--wg-brand-from)" fill={`url(#${gradId})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartMeasuredContainer>
    </Card>
  );
}
