import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from 'react-loading-skeleton';

import {
  adminAxisTick,
  adminCartesianGrid,
  adminChartCardHover,
  adminLegendStyle,
  adminTooltipContentStyle,
} from '../adminChartTheme';
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
      <Card variant="enterprise" className="min-w-0">
        <h2 className="wg-heading-section">Satisfaction mix</h2>
        <p className="mt-1 text-xs text-wg-muted">Survey-weighted NPS-style buckets from completion ratio.</p>
        <div className="mt-6">
          <Skeleton height={120} borderRadius={12} />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="enterprise" className={adminChartCardHover}>
      <div>
        <h2 className="wg-heading-section">Satisfaction mix</h2>
        <p className="mt-1 text-xs text-wg-muted">Share of promoters, passive, and detractors from completion ratio.</p>
      </div>
      <ChartMeasuredContainer className="mt-4 h-36 w-full min-w-0">
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <BarChart layout="vertical" data={[row]} margin={{ top: 0, right: 12, left: 0, bottom: 0 }}>
              <CartesianGrid {...adminCartesianGrid} horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={adminAxisTick} />
              <YAxis type="category" dataKey="label" width={88} tick={adminAxisTick} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v, name) => [`${v}%`, name]} contentStyle={adminTooltipContentStyle} />
              <Legend wrapperStyle={adminLegendStyle} />
              <Bar dataKey="Promoters" stackId="s" fill="var(--wg-brand-from)" maxBarSize={28} />
              <Bar dataKey="Passive" stackId="s" fill="rgb(148 163 184)" maxBarSize={28} />
              <Bar dataKey="Detractors" stackId="s" fill="rgb(248 113 113)" radius={[0, 6, 6, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartMeasuredContainer>
    </Card>
  );
}
