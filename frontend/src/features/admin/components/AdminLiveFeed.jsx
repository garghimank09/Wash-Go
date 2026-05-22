import { m } from 'framer-motion';
import { Activity, AlertTriangle, Bell, CreditCard, Info, MessageSquare, Sparkles } from 'lucide-react';

import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';
import { useReducedMotion } from '../../../lib/useReducedMotion';
import { AdminDataSourceBadge } from './AdminDataSourceBadge';

const ICONS = {
  booking: Sparkles,
  payout: CreditCard,
  alert: Activity,
  review: MessageSquare,
};

const SEVERITY_RING = {
  info: 'ring-cyan-500/20 border-cyan-500/15',
  warn: 'ring-amber-500/25 border-amber-500/20',
  critical: 'ring-rose-500/30 border-rose-500/25',
};

const SEVERITY_ICON = {
  info: Info,
  warn: Bell,
  critical: AlertTriangle,
};

export function AdminLiveFeed({ items, className }) {
  const reduced = useReducedMotion();
  const list = items || [];
  const scrollable = list.length > 4;

  return (
    <Card
      variant="enterprise"
      className={cn('flex min-w-0 flex-col border-white/35 dark:border-white/10', className)}
    >
      <div className="flex shrink-0 items-start justify-between gap-2">
        <div>
          <h2 className="wg-heading-section">Live activity</h2>
          <p className="mt-1 text-xs text-wg-muted">Recent booking events from the live API stream.</p>
        </div>
      </div>
      {list.length === 0 ? (
        <p className="mt-3 rounded-lg border border-dashed border-wg-border/80 px-3 py-4 text-center text-xs text-wg-muted">
          No recent events yet.
        </p>
      ) : (
      <ul
        className={cn(
          'mt-3 space-y-2 pr-0.5',
          scrollable && 'max-h-[280px] overflow-y-auto',
        )}
      >
        {list.map((ev, i) => {
          const Icon = ICONS[ev.type] || Activity;
          const sev = ev.severity || 'info';
          const SevIcon = SEVERITY_ICON[sev] || Info;
          return (
            <m.li
              key={ev.id}
              initial={reduced ? false : { opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: reduced ? 0 : Math.min(i, 8) * 0.04, duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                'flex gap-3 rounded-xl border bg-white/30 p-3 dark:bg-white/[0.04]',
                'ring-1 transition hover:border-cyan-500/25 hover:bg-cyan-500/[0.06]',
                SEVERITY_RING[sev] || SEVERITY_RING.info,
              )}
            >
              <span className="relative flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-brand-from/20 to-brand-to/15 text-cyan-700 dark:text-cyan-300">
                <Icon className="size-4" strokeWidth={1.75} aria-hidden />
                <span className="absolute -bottom-0.5 -right-0.5 flex size-4 items-center justify-center rounded-full bg-wg-surface-elevated ring-1 ring-wg-border">
                  <SevIcon className="size-2.5 text-wg-muted" strokeWidth={2} aria-hidden />
                </span>
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold leading-snug text-wg-text">{ev.title}</p>
                  <AdminDataSourceBadge source={ev.source || 'live'} />
                </div>
                <p className="mt-0.5 text-xs font-medium text-wg-muted">{ev.time}</p>
              </div>
            </m.li>
          );
        })}
      </ul>
      )}
    </Card>
  );
}
