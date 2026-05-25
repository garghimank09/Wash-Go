import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from 'react-loading-skeleton';

import {
  ADMIN_CHART_HEIGHT,
  adminAxisTick,
  adminCartesianGrid,
  adminChartCardHover,
  adminChartMargin,
  adminTooltipContentStyle,
  adminTooltipCursor,
} from '../adminChartTheme';
import { Card } from '../../../ui/card';
import { ChartMeasuredContainer } from '../../dashboard/ChartMeasuredContainer';
import { formatRupees, formatRupeesAxis } from '../../../utils/format';

export function AdminRevenueChart({ data, chartsReady }) {
  const gradId = useId().replace(/:/g, '');

  if (!chartsReady) {
    return (
      <Card variant="enterprise" className="min-w-0">
        <h2 className="wg-heading-section">Revenue</h2>
        <p className="mt-1 text-xs text-wg-muted">Gross booking volume by month (INR) from completed jobs.</p>
        <div className="mt-6 space-y-2">
          <Skeleton height={180} borderRadius={12} />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="enterprise" className={adminChartCardHover}>
      <div>
        <h2 className="wg-heading-section">Revenue</h2>
        <p className="mt-1 text-xs text-wg-muted">Gross booking volume by month (INR) from completed jobs.</p>
      </div>
      <ChartMeasuredContainer className={`mt-4 ${ADMIN_CHART_HEIGHT} w-full min-w-0`}>
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <AreaChart data={data} margin={adminChartMargin}>
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--wg-brand-from)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--wg-brand-to)" stopOpacity={0.06} />
                </linearGradient>
              </defs>
              <CartesianGrid {...adminCartesianGrid} vertical={false} />
              <XAxis dataKey="label" tick={adminAxisTick} axisLine={false} tickLine={false} />
              <YAxis
                tickFormatter={(v) => formatRupeesAxis(v)}
                width={44}
                tick={adminAxisTick}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={adminTooltipCursor}
                contentStyle={adminTooltipContentStyle}
                formatter={(v) => [formatRupees(Number(v), { maximumFractionDigits: 2 }), 'Revenue']}
              />
              <Area type="monotone" dataKey="revenue" stroke="var(--wg-brand-from)" fill={`url(#${gradId})`} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </ChartMeasuredContainer>
    </Card>
  );
}
