import { useMemo } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Card } from '../../ui/card';

import { ChartMeasuredContainer } from './ChartMeasuredContainer';

function localYMD(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function buildWeekSeries(items) {
  const now = new Date();
  const keys = [];
  for (let i = 6; i >= 0; i -= 1) {
    const d = new Date(now);
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    keys.push(localYMD(d));
  }
  const counts = Object.fromEntries(keys.map((k) => [k, 0]));
  for (const b of items) {
    try {
      const k = localYMD(new Date(b.scheduled_at));
      if (k in counts) counts[k] += 1;
    } catch {
      /* ignore */
    }
  }
  return keys.map((date) => ({
    label: date.slice(5).replace('-', '/'),
    count: counts[date],
  }));
}

export function DashboardActivityChart({ items }) {
  const data = useMemo(() => buildWeekSeries(items || []), [items]);

  return (
    <Card variant="glass" className="min-h-[220px] min-w-0">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="wg-heading-section">Booking activity</h2>
          <p className="mt-1 text-xs text-wg-muted">Counts by scheduled day — last 7 days (from your history).</p>
        </div>
      </div>
      <ChartMeasuredContainer className="mt-4 h-44 w-full min-h-[11rem] min-w-0 sm:min-h-[12rem]">
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <BarChart data={data} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-wg-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} width={28} tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} axisLine={false} tickLine={false} />
              <Tooltip
                cursor={{ fill: 'rgb(6 182 212 / 0.08)' }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--wg-border)',
                  background: 'var(--wg-surface-elevated)',
                  color: 'var(--wg-text)',
                }}
              />
              <Bar dataKey="count" name="Bookings" fill="url(#wgBarGrad)" radius={[6, 6, 0, 0]} maxBarSize={36} />
              <defs>
                <linearGradient id="wgBarGrad" x1="0" y1="0" x2="0" y2="1">
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
