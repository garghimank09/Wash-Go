import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Car, ChevronRight } from 'lucide-react';

import { Card } from '../../ui/card';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

export function DashboardSavedVehicles({ cars, loading }) {
  const reduced = useReducedMotion();

  if (loading) {
    return (
      <Card variant="glass" className="min-w-0">
        <h2 className="wg-heading-section">Saved vehicles</h2>
        <div className="mt-4 h-20 animate-pulse rounded-xl bg-wg-border/40" />
      </Card>
    );
  }

  if (!cars?.length) {
    return (
      <Card variant="glass" className="min-w-0">
        <div className="flex items-center gap-2">
          <Car className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
          <h2 className="wg-heading-section">Saved vehicles</h2>
        </div>
        <p className="mt-3 text-sm text-wg-muted">Add a vehicle for faster booking and tailored care tips.</p>
        <Link to="/cars" className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
          Add a vehicle
          <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-w-0 transition hover:ring-1 hover:ring-cyan-500/15 dark:hover:ring-cyan-400/10">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Car className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
          <h2 className="wg-heading-section">Saved vehicles</h2>
        </div>
        <Link to="/cars" className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
          Manage
        </Link>
      </div>
      <ul className="mt-4 space-y-2">
        {cars.map((c, i) => (
          <m.li
            key={c.id}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.04 }}
            className={cn(
              'flex items-center justify-between gap-3 rounded-xl border border-white/25 bg-white/40 px-4 py-3 transition hover:border-cyan-500/30 hover:shadow-sm dark:border-white/10 dark:bg-white/[0.05]',
            )}
          >
            <div className="min-w-0">
              <p className="truncate font-bold text-wg-text">
                {c.make} {c.model}
              </p>
              <p className="text-xs text-wg-muted">{c.license_plate}</p>
            </div>
            <span className="shrink-0 rounded-full bg-cyan-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-cyan-800 dark:text-cyan-200">
              Ready
            </span>
          </m.li>
        ))}
      </ul>
    </Card>
  );
}
