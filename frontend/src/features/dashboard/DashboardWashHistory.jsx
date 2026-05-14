import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { CheckCircle2, History } from 'lucide-react';

import { Card } from '../../ui/card';
import { formatCents, formatDateTime } from '../../utils/format';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

const MAX = 5;

export function DashboardWashHistory({ items }) {
  const reduced = useReducedMotion();
  const rows = useMemo(() => {
    const copy = [...(items || [])].filter((b) => b.status === 'completed');
    copy.sort((a, b) => new Date(b.scheduled_at) - new Date(a.scheduled_at));
    return copy.slice(0, MAX);
  }, [items]);

  if (!rows.length) {
    return (
      <Card variant="glass" className="min-w-0">
        <div className="flex items-center gap-2">
          <History className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
          <h2 className="wg-heading-section">Wash history</h2>
        </div>
        <p className="mt-3 text-sm text-wg-muted">Completed washes will appear here as a timeline.</p>
        <Link to="/booking" className="mt-4 inline-block text-sm font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
          Book your first wash
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-w-0 transition hover:ring-1 hover:ring-cyan-500/15 dark:hover:ring-cyan-400/10">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <History className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
          <h2 className="wg-heading-section">Wash history</h2>
        </div>
        <Link to="/bookings" className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
          View all
        </Link>
      </div>
      <ul className="relative mt-6 space-y-0">
        <div
          className="absolute bottom-2 left-[17px] top-2 w-px bg-gradient-to-b from-emerald-500/40 via-wg-border to-transparent"
          aria-hidden
        />
        {rows.map((b, i) => (
          <m.li
            key={b.id}
            initial={reduced ? false : { opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.05, duration: 0.28 }}
            className={cn('relative flex gap-4 pb-6 pl-10', i === rows.length - 1 && 'pb-0')}
          >
            <span className="absolute left-0 top-1 flex size-9 items-center justify-center rounded-full bg-emerald-500/15 ring-2 ring-emerald-500/30 dark:bg-emerald-500/10">
              <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" strokeWidth={2} aria-hidden />
            </span>
            <div className="min-w-0 flex-1 rounded-xl border border-white/20 bg-white/30 p-3 dark:border-white/10 dark:bg-white/[0.04]">
              <Link to={`/bookings/${b.id}`} className="group block">
                <p className="text-xs font-medium text-wg-muted">{formatDateTime(b.scheduled_at)}</p>
                <p className="mt-1 truncate text-sm font-semibold text-wg-text group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                  {b.service_address}
                </p>
                <p className="mt-1 text-xs tabular-nums text-wg-muted">{formatCents(b.price_cents, b.currency)}</p>
              </Link>
            </div>
          </m.li>
        ))}
      </ul>
    </Card>
  );
}
