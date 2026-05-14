import RawCountUp from 'react-countup';
import Skeleton from 'react-loading-skeleton';

import { cn } from '../lib/cn';
import { Card } from './card';

/** Vite + CJS interop: `react-countup` may resolve to `{ default: Component }`. */
const CountUp = typeof RawCountUp === 'function' ? RawCountUp : RawCountUp?.default;

/**
 * KPI tile with optional CountUp animation and tabular numerals for numbers.
 */
export function StatCard({
  label,
  value,
  loading,
  animate = true,
  prefix,
  suffix,
  decimals = 0,
  className,
  variant = 'default',
  icon: Icon,
}) {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : null;

  return (
    <Card variant={variant} className={cn('h-full', className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">{label}</p>
          <div className="mt-2 min-h-[2.5rem] tabular-nums">
            {loading ? (
              <Skeleton height={36} width="70%" />
            ) : animate && numeric != null && typeof CountUp === 'function' ? (
              <p className="text-2xl font-black text-wg-text">
                {prefix}
                <CountUp duration={1.1} decimals={decimals} end={numeric} preserveValue />
                {suffix}
              </p>
            ) : (
              <p className="text-2xl font-black text-wg-text">
                {prefix}
                {numeric != null ? numeric : typeof value === 'number' ? '—' : value}
                {suffix}
              </p>
            )}
          </div>
        </div>
        {Icon ? (
          <span
            className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from/18 to-brand-to/15 text-cyan-700 dark:text-cyan-300"
            aria-hidden
          >
            <Icon className="size-5" strokeWidth={1.75} />
          </span>
        ) : null}
      </div>
    </Card>
  );
}
