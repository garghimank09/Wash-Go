import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from 'react-loading-skeleton';

import { Card } from '../../../ui/card';
import { ChartMeasuredContainer } from '../../dashboard/ChartMeasuredContainer';

export function AdminSatisfactionChart({ segments, chartsReady }) {
  const row = segments?.length
    ? {
        label: 'Responses',
        Promoters: segments.find((s) => s.name === 'Promoters')?.value ?? 0,
        Passive: segments.find((s) => s.name === 'Passive')?.value ?? 0,
        Detractors: segments.find((s) => s.name === 'Detractors')?.value ?? 0,
      }
    : { label: 'Responses', Promoters: 0, Passive: 0, Detractors: 0 };

  if (!chartsReady) {
    return (
      <Card variant="glass" className="min-h-[200px] min-w-0">
        <h2 className="wg-heading-section">Satisfaction mix</h2>
        <p className="mt-1 text-xs text-wg-muted">Survey-weighted NPS-style buckets (mock).</p>
        <div className="mt-6">
          <Skeleton height={72} borderRadius={12} />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-h-[200px] min-w-0 transition hover:ring-1 hover:ring-cyan-500/20 dark:hover:ring-cyan-400/15">
      <div>
        <h2 className="wg-heading-section">Satisfaction mix</h2>
        <p className="mt-1 text-xs text-wg-muted">Share of promoters, passive, and detractors (mock).</p>
      </div>
      <ChartMeasuredContainer className="mt-4 h-24 w-full min-w-0">
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <BarChart layout="vertical" data={[row]} margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-wg-border" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} />
              <YAxis type="category" dataKey="label" width={88} tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v, name) => [`${v}%`, name]}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--wg-border)',
                  background: 'var(--wg-surface-elevated)',
                  color: 'var(--wg-text)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Promoters" stackId="s" fill="var(--wg-brand-from)" radius={[0, 0, 0, 0]} maxBarSize={28} />
              <Bar dataKey="Passive" stackId="s" fill="rgb(148 163 184)" maxBarSize={28} />
              <Bar dataKey="Detractors" stackId="s" fill="rgb(248 113 113)" radius={[0, 6, 6, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartMeasuredContainer>
    </Card>
  );
}
