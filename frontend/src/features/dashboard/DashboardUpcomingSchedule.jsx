import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { m } from 'framer-motion';
import { CalendarRange, ChevronRight, MapPin } from 'lucide-react';

import { Card } from '../../ui/card';
import { StatusPill } from '../../ui/status-pill';
import { formatDateTime } from '../../utils/format';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

const TERMINAL = ['completed', 'cancelled'];

/** Next few non-terminal bookings — customer schedule, not analytics. */
export function DashboardUpcomingSchedule({ items }) {
  const reduced = useReducedMotion();
  const rows = useMemo(() => {
    return [...(items || [])]
      .filter((b) => !TERMINAL.includes(b.status))
      .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))
      .slice(0, 4);
  }, [items]);

  if (!rows.length) {
    return (
      <Card variant="glass" className="min-w-0 transition hover:ring-1 hover:ring-cyan-500/15 dark:hover:ring-cyan-400/10">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
          <h2 className="wg-heading-section">Upcoming schedule</h2>
        </div>
        <p className="mt-3 text-sm text-wg-muted">Nothing on the calendar yet. Pick a time that fits your week.</p>
        <Link
          to="/booking"
          className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-cyan-600 hover:underline dark:text-cyan-400"
        >
          Schedule a wash
          <ChevronRight className="size-4" strokeWidth={2} aria-hidden />
        </Link>
      </Card>
    );
  }

  return (
    <Card variant="glass" className="min-w-0 shadow-wg-card transition hover:shadow-lg hover:ring-1 hover:ring-cyan-500/15 dark:hover:ring-cyan-400/10">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-5 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
          <h2 className="wg-heading-section">Upcoming schedule</h2>
        </div>
        <Link to="/bookings" className="text-xs font-semibold text-cyan-600 hover:underline dark:text-cyan-400">
          Full calendar
        </Link>
      </div>
      <ul className="mt-4 space-y-2">
        {rows.map((b, i) => (
          <m.li
            key={b.id}
            initial={reduced ? false : { opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.04 }}
          >
            <Link
              to={`/bookings/${b.id}`}
              className={cn(
                'group flex items-start gap-3 rounded-xl border border-white/20 bg-white/35 p-3 transition',
                'hover:border-cyan-500/35 hover:bg-white/50 dark:border-white/10 dark:bg-white/[0.04] dark:hover:bg-white/[0.07]',
              )}
            >
              <span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-wg-surface text-cyan-700 ring-1 ring-wg-border dark:bg-wg-surface-elevated/80 dark:text-cyan-300">
                <MapPin className="size-4" strokeWidth={1.75} aria-hidden />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <StatusPill status={b.status} />
                  <span className="text-xs font-medium text-wg-muted">{formatDateTime(b.scheduled_at)}</span>
                </div>
                <p className="mt-1 truncate text-sm font-semibold text-wg-text group-hover:text-cyan-700 dark:group-hover:text-cyan-300">
                  {b.service_address}
                </p>
              </div>
              <ChevronRight
                className="mt-1 size-4 shrink-0 text-wg-muted opacity-0 transition group-hover:opacity-100"
                strokeWidth={2}
                aria-hidden
              />
            </Link>
          </m.li>
        ))}
      </ul>
    </Card>
  );
}
