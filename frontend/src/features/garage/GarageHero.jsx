import { m } from 'framer-motion';
import { Car, Sparkles } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

export function GarageHero({ vehicleCount, loading }) {
  const reduced = useReducedMotion();

  return (
    <m.section
      className={cn(
        'relative overflow-hidden rounded-[var(--radius-wg-xl)] border border-white/20 bg-wg-surface-elevated/90 p-5 shadow-wg-card sm:p-6 dark:border-white/10 dark:bg-wg-surface-elevated/70',
      )}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="pointer-events-none absolute inset-0 opacity-60 dark:opacity-90" style={{ background: 'var(--wg-mesh)' }} />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-indigo-600/12" />
      <div className="pointer-events-none absolute -right-16 top-0 size-56 rounded-full bg-cyan-400/15 blur-3xl dark:bg-cyan-500/20" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from/25 to-brand-to/20 text-cyan-700 shadow-inner dark:text-cyan-200">
            <Car className="size-7" strokeWidth={1.5} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-wg-muted">WashGo</p>
            <h1 className="wg-heading-display mt-0.5 text-balance">My Garage</h1>
            <p className="wg-caption mt-1 max-w-xl text-pretty">
              Vehicles you save here sync everywhere — booking, reminders, and wash history stay tied to each plate.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
          <div className="rounded-2xl border border-white/25 bg-white/40 px-4 py-3 text-center dark:border-white/10 dark:bg-white/[0.06]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-wg-muted">In garage</p>
            <p className="mt-0.5 text-2xl font-black tabular-nums text-wg-text">
              {loading ? '—' : vehicleCount}
            </p>
          </div>
          <div className="hidden items-center gap-2 rounded-2xl border border-cyan-500/20 bg-cyan-500/8 px-3 py-2 text-xs font-semibold text-cyan-900 dark:text-cyan-100 sm:flex">
            <Sparkles className="size-4 shrink-0" strokeWidth={1.75} aria-hidden />
            <span>Premium care profiles</span>
          </div>
        </div>
      </div>
    </m.section>
  );
}
