import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import Skeleton from 'react-loading-skeleton';

import {
  ADMIN_BAR_GRAD_ID,
  ADMIN_CHART_HEIGHT,
  adminAxisTick,
  adminBarTooltipCursor,
  adminCartesianGrid,
  adminChartCardHover,
  adminChartMarginBar,
  adminTooltipContentStyle,
} from '../adminChartTheme';
import { Card } from '../../../ui/card';
import { ChartMeasuredContainer } from '../../dashboard/ChartMeasuredContainer';

export function AdminBookingVolumeChart({ data, chartsReady }) {
  if (!chartsReady) {
    return (
      <Card variant="enterprise" className="min-w-0">
        <h2 className="wg-heading-section">Booking volume</h2>
        <p className="mt-1 text-xs text-wg-muted">Completed + active jobs by weekday from API.</p>
        <div className="mt-6">
          <Skeleton height={180} borderRadius={12} />
        </div>
      </Card>
    );
  }

  return (
    <Card variant="enterprise" className={adminChartCardHover}>
      <div>
        <h2 className="wg-heading-section">Booking volume</h2>
        <p className="mt-1 text-xs text-wg-muted">Jobs by weekday from API.</p>
      </div>
      <ChartMeasuredContainer className={`mt-4 ${ADMIN_CHART_HEIGHT} w-full min-w-0`}>
        {({ width, height }) => (
          <ResponsiveContainer width={width} height={height} minWidth={0} minHeight={0}>
            <BarChart data={data} margin={adminChartMarginBar}>
              <CartesianGrid {...adminCartesianGrid} vertical={false} />
              <XAxis dataKey="label" tick={adminAxisTick} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} width={32} tick={adminAxisTick} axisLine={false} tickLine={false} />
              <Tooltip cursor={adminBarTooltipCursor} contentStyle={adminTooltipContentStyle} />
              <Bar dataKey="bookings" name="Bookings" fill={`url(#${ADMIN_BAR_GRAD_ID})`} radius={[6, 6, 0, 0]} maxBarSize={40} />
              <defs>
                <linearGradient id={ADMIN_BAR_GRAD_ID} x1="0" y1="0" x2="0" y2="1">
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
