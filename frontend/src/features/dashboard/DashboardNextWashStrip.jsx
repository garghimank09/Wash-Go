import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';

import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { StatusPill } from '../../ui/status-pill';
import { formatCents } from '../../utils/format';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { formatCustomerWashTiming } from './dashboardEta';

export function DashboardNextWashStrip({ booking, detail }) {
  const reduced = useReducedMotion();

  const timing = useMemo(() => formatCustomerWashTiming(booking, detail), [booking, detail]);

  if (!booking) return null;

  return (
    <m.div
      initial={reduced ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
    >
      <Card
        variant="glass"
        className="border-cyan-500/25 bg-gradient-to-r from-cyan-500/8 via-wg-surface-elevated/95 to-indigo-500/10 shadow-wg-card transition hover:shadow-lg dark:border-cyan-500/15"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 flex-1 gap-4">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from/25 to-brand-to/20 text-cyan-700 dark:text-cyan-200">
              <Calendar className="size-6" strokeWidth={1.75} aria-hidden />
            </span>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-wg-muted">Your next wash</p>
              <p className="mt-1 text-lg font-black leading-snug text-wg-text">{timing.headline}</p>
              <p className="mt-1 text-sm text-wg-muted">{timing.sub}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <StatusPill status={booking.status} />
                <span className="text-xs tabular-nums text-wg-muted">{formatCents(booking.price_cents, booking.currency)}</span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Link to={`/bookings/${booking.id}`}>
              <Button size="sm" variant="outline" className="gap-1">
                Details
                <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
              </Button>
            </Link>
            <Link to="/booking">
              <m.span className="inline-block" whileTap={reduced ? undefined : { scale: 0.97 }}>
                <Button size="sm" className="gap-1.5">
                  <Sparkles className="size-4" strokeWidth={1.75} aria-hidden />
                  Book another
                </Button>
              </m.span>
            </Link>
          </div>
        </div>
      </Card>
    </m.div>
  );
}
