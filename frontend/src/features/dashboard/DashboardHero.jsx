import { m } from 'framer-motion';
import { Link } from 'react-router-dom';

import { Button } from '../../ui/button';
import { useReducedMotion } from '../../lib/useReducedMotion';

export function DashboardHero({ firstName }) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className="relative overflow-hidden rounded-[var(--radius-wg-xl)] border border-wg-border bg-wg-surface-elevated/90 p-6 shadow-wg-card sm:p-8 dark:bg-wg-surface-elevated/70"
      initial={reduced ? false : { opacity: 0, y: 14 }}
      animate={reduced ? false : { opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.65] dark:opacity-90"
        style={{ background: 'var(--wg-mesh)' }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-brand-from/10 via-transparent to-brand-to/12" />
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-cyan-400/12 blur-3xl dark:bg-cyan-500/15" />

      <div className="relative flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
        <div className="max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-wg-muted">Your wash hub</p>
          <h1 className="wg-hero mt-2">
            Hello, <span className="text-transparent bg-gradient-to-r from-brand-from to-brand-to bg-clip-text">{firstName}</span>
          </h1>
          <p className="wg-subtitle mt-3 max-w-xl">
            Plan your next visit, follow live progress, and keep every vehicle looking its best — in one calm, premium
            surface.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:shrink-0">
          <Link to="/booking">
            <m.span className="inline-block" whileTap={reduced ? undefined : { scale: 0.97 }}>
              <Button size="sm">Book a wash</Button>
            </m.span>
          </Link>
          <Link to="/bookings">
            <m.span className="inline-block" whileTap={reduced ? undefined : { scale: 0.97 }}>
              <Button size="sm" variant="outline">
                View schedule
              </Button>
            </m.span>
          </Link>
        </div>
      </div>
    </m.div>
  );
}
