import { useId, useMemo } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

import { Card } from '../../ui/card';
import { ChartMeasuredContainer } from './ChartMeasuredContainer';

function monthKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

/** Last N calendar months including current, oldest first. */
function lastNMonthKeys(n) {
  const keys = [];
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  for (let i = n - 1; i >= 0; i -= 1) {
    const x = new Date(d.getFullYear(), d.getMonth() - i, 1);
    keys.push(monthKey(x));
  }
  return keys;
}

function labelFromKey(k) {
  const [y, m] = k.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString(undefined, { month: 'short', year: '2-digit' });
}

/**
 * Completed wash revenue by scheduled month (from list payload only).
 */
export function DashboardRevenueChart({ items }) {
  const gradId = useId().replace(/:/g, '');

  const { data, hasAny } = useMemo(() => {
    const keys = lastNMonthKeys(6);
    const centsBy = Object.fromEntries(keys.map((k) => [k, 0]));
    for (const b of items || []) {
      if (b.status !== 'completed') continue;
      const c = Number(b.price_cents);
      if (!Number.isFinite(c)) continue;
      const k = monthKey(new Date(b.scheduled_at));
      if (k in centsBy) centsBy[k] += c;
    }
    const dataInner = keys.map((k) => ({
      key: k,
      label: labelFromKey(k),
      revenue: centsBy[k] / 100,
    }));
    const hasAnyInner = dataInner.some((row) => row.revenue > 0);
    return { data: dataInner, hasAny: hasAnyInner };
  }, [items]);

  if (!hasAny) {
    return (
      <Card variant="glass" className="min-h-[200px] min-w-0">
        <h2 className="wg-heading-section">Revenue by month</h2>
        <p className="mt-3 max-w-md text-sm text-wg-muted">
          Completed wash totals by scheduled month appear here after you finish your first wash.
        </p>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-h-[220px] min-w-0 transition hover:ring-1 hover:ring-cyan-500/20 dark:hover:ring-cyan-400/15">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="wg-heading-section">Revenue by month</h2>
          <p className="mt-1 text-xs text-wg-muted">Completed bookings only — by scheduled month (USD).</p>
        </div>
      </div>
      <ChartMeasuredContainer className="mt-4 h-52 w-full min-w-0">
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--wg-brand-from)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--wg-brand-to)" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-wg-border" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 11, fill: 'var(--wg-muted)' }} axisLine={false} tickLine={false} />
              <YAxis
                width={44}
                tick={{ fontSize: 11, fill: 'var(--wg-muted)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid var(--wg-border)',
                  background: 'var(--wg-surface-elevated)',
                  color: 'var(--wg-text)',
                }}
                formatter={(value) => [`$${Number(value).toFixed(2)}`, 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke="var(--wg-brand-from)" fill={`url(#${gradId})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartMeasuredContainer>
    </Card>
  );
}
