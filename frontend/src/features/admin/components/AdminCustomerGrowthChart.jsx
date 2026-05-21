import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from 'react-loading-skeleton';

import { Card } from '../../../ui/card';
import { ChartMeasuredContainer } from '../../dashboard/ChartMeasuredContainer';

export function AdminCustomerGrowthChart({ data, chartsReady }) {
  if (!chartsReady) {
    return (
      <Card variant="enterprise" className="min-w-0">
        <h2 className="wg-heading-section">Customer growth</h2>
        <p className="mt-1 text-xs text-wg-muted">Monthly signups vs cumulative base from first-booking dates.</p>
        <div className="mt-6">
          <Skeleton height={180} borderRadius={12} />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="enterprise" className="min-w-0 transition hover:ring-1 hover:ring-cyan-500/20 dark:hover:ring-cyan-400/15">
      <div>
        <h2 className="wg-heading-section">Customer growth</h2>
        <p className="mt-1 text-xs text-wg-muted">Monthly signups and cumulative customers from first-booking dates.</p>
      </div>
      <ChartMeasuredContainer className="mt-4 h-52 w-full min-w-0">
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-wg-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" width={40} tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" width={44} tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--wg-border)',
                  background: 'var(--wg-surface-elevated)',
                  color: 'var(--wg-text)',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="signups"
                name="Signups / mo"
                stroke="var(--wg-brand-from)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--wg-brand-from)' }}
                activeDot={{ r: 5 }}
              />
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="cumulative"
                name="Cumulative"
                stroke="var(--wg-brand-to)"
                strokeWidth={2}
                dot={{ r: 3, fill: 'var(--wg-brand-to)' }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </ChartMeasuredContainer>
    </Card>
  );
}
