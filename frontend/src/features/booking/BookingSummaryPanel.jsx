import { AnimatePresence, m } from 'framer-motion';

import { Card } from '../../ui/card';
import { cn } from '../../lib/cn';
import { formatCents } from '../../utils/format';
import Skeleton from 'react-loading-skeleton';

export function BookingSummaryPanel({
  carLabel,
  packageLabel,
  priceCents,
  pricingLoading,
  reduced,
  stepIndex,
  totalSteps,
  className,
}) {
  return (
    <m.div
      layout
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-wg-card)]',
        'before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit]',
        'before:bg-gradient-to-br before:from-white/40 before:via-transparent before:to-cyan-500/5',
        'dark:before:from-white/[0.07] dark:before:to-cyan-400/10',
        className,
      )}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
    >
      <Card
        variant="glass"
        className={cn(
          'relative border-white/40 shadow-[0_8px_40px_rgb(15_23_42/0.08),0_1px_0_rgb(255_255_255/0.5)_inset]',
          'dark:border-white/10 dark:shadow-[0_12px_48px_rgb(0_0_0/0.35)]',
          'backdrop-blur-2xl',
        )}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-wg-muted">Live summary</p>
            <p className="mt-1 text-xs text-wg-muted">
              Step {stepIndex + 1} of {totalSteps}
            </p>
          </div>
          <span className="rounded-full border border-cyan-500/25 bg-gradient-to-r from-cyan-500/15 to-indigo-600/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-cyan-800 dark:text-cyan-200">
            Est.
          </span>
        </div>

        <ul className="mt-5 space-y-4 text-sm">
          <li className="flex items-start justify-between gap-3 border-b border-white/15 pb-3 dark:border-white/5">
            <span className="text-xs font-medium text-wg-muted">Vehicle</span>
            <span className="max-w-[60%] text-right text-sm font-semibold leading-snug text-wg-text">{carLabel}</span>
          </li>
          <li className="flex items-start justify-between gap-3 border-b border-white/15 pb-3 dark:border-white/5">
            <span className="text-xs font-medium text-wg-muted">Package</span>
            <span className="max-w-[60%] text-right text-sm font-semibold text-wg-text">{packageLabel}</span>
          </li>
          <li className="flex items-end justify-between gap-3 pt-0.5">
            <span className="text-xs font-medium text-wg-muted">Estimate</span>
            <div className="min-h-[2rem] text-right">
              <AnimatePresence mode="wait" initial={false}>
                {pricingLoading ? (
                  <m.div
                    key="sk"
                    initial={reduced ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={reduced ? undefined : { opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="inline-block w-[7rem]"
                  >
                    <Skeleton height={28} borderRadius={8} />
                  </m.div>
                ) : (
                  <m.span
                    key={priceCents ?? 'na'}
                    initial={reduced ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={reduced ? undefined : { opacity: 0, y: -4 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                    className="inline-block bg-gradient-to-r from-cyan-600 via-indigo-600 to-indigo-700 bg-clip-text text-2xl font-black tabular-nums tracking-tight text-transparent dark:from-cyan-300 dark:via-indigo-300 dark:to-indigo-200"
                  >
                    {priceCents != null ? formatCents(priceCents) : '—'}
                  </m.span>
                )}
              </AnimatePresence>
            </div>
          </li>
        </ul>
      </Card>
    </m.div>
  );
}
