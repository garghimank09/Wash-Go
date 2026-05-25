/** Shared Recharts styling for admin dashboards (visual-only). */

export const ADMIN_CHART_HEIGHT = 'h-52';

export const adminChartMargin = { top: 8, right: 8, left: 0, bottom: 0 };

export const adminChartMarginBar = { top: 8, right: 8, left: -12, bottom: 0 };

export const adminAxisTick = { fontSize: 11, fill: 'var(--wg-muted)' };

export const adminTooltipContentStyle = {
  borderRadius: 12,
  border: '1px solid var(--wg-border)',
  background: 'var(--wg-surface-elevated)',
  color: 'var(--wg-text)',
};

export const adminTooltipCursor = { stroke: 'rgb(6 182 212 / 0.25)', strokeWidth: 1 };

export const adminBarTooltipCursor = { fill: 'rgb(6 182 212 / 0.08)' };

export const adminCartesianGrid = { strokeDasharray: '3 3', className: 'stroke-wg-border' };

export const adminLegendStyle = { fontSize: 11, color: 'var(--wg-muted)' };

export const ADMIN_BAR_GRAD_ID = 'adminBarGrad';

export const adminChartCardHover =
  'min-w-0 transition hover:ring-1 hover:ring-cyan-500/20 dark:hover:ring-cyan-400/15';
