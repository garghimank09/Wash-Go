import { useMemo } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

import { Card } from '../../ui/card';

import { ChartMeasuredContainer } from './ChartMeasuredContainer';

const COLORS = {
  pending: '#fbbf24',
  confirmed: '#38bdf8',
  in_progress: '#22d3ee',
  completed: '#34d399',
  cancelled: '#94a3b8',
};

export function DashboardStatusMix({ items }) {
  const data = useMemo(() => {
    const tally = {};
    for (const b of items || []) {
      const k = b.status || 'pending';
      tally[k] = (tally[k] || 0) + 1;
    }
    return Object.entries(tally).map(([name, value]) => ({
      name: String(name).replace(/_/g, ' '),
      value,
      key: name,
    }));
  }, [items]);

  if (!items?.length) {
    return (
      <Card variant="inset" className="min-h-[200px]">
        <h2 className="wg-heading-section">Status mix</h2>
        <p className="mt-3 text-sm text-wg-muted">Bookings will appear here once you create one.</p>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-h-[220px] min-w-0">
      <h2 className="wg-heading-section">Status mix</h2>
      <p className="mt-1 text-xs text-wg-muted">Share of your bookings by status (current history).</p>
      <ChartMeasuredContainer className="mt-2 h-48 min-h-[12rem] w-full min-w-0">
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={72}
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.key} fill={COLORS[entry.key] || '#64748b'} stroke="transparent" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--wg-border)',
                  background: 'var(--wg-surface-elevated)',
                  color: 'var(--wg-text)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        )}
      </ChartMeasuredContainer>
    </Card>
  );
}
