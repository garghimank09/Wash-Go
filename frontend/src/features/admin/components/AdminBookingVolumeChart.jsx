import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from 'react-loading-skeleton';

import { Card } from '../../../ui/card';
import { ChartMeasuredContainer } from '../../dashboard/ChartMeasuredContainer';

export function AdminBookingVolumeChart({ data, chartsReady }) {
  if (!chartsReady) {
    return (
      <Card variant="glass" className="min-h-[220px] min-w-0">
        <h2 className="wg-heading-section">Booking volume</h2>
        <p className="mt-1 text-xs text-wg-muted">Completed + active jobs by weekday (mock).</p>
        <div className="mt-6">
          <Skeleton height={180} borderRadius={12} />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-h-[220px] min-w-0 transition hover:ring-1 hover:ring-cyan-500/20 dark:hover:ring-cyan-400/15">
      <div>
        <h2 className="wg-heading-section">Booking volume</h2>
        <p className="mt-1 text-xs text-wg-muted">Jobs by weekday (mock).</p>
      </div>
      <ChartMeasuredContainer className="mt-4 h-52 w-full min-w-0">
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-wg-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} width={32} tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgb(6 182 212 / 0.08)' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--wg-border)',
                  background: 'var(--wg-surface-elevated)',
                  color: 'var(--wg-text)',
                }}
              />
              <Bar dataKey="bookings" name="Bookings" fill="url(#adminBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={40} />
              <defs>
                <linearGradient id="adminBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--wg-brand-from)" />
                  <stop offset="100%" stopColor="var(--wg-brand-to)" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartMeasuredContainer>
    </Card>
  );
}
