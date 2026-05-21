import { m } from 'framer-motion';
import { Award } from 'lucide-react';

import { Card } from '../../../ui/card';
import { cn } from '../../../lib/cn';
import { useReducedMotion } from '../../../lib/useReducedMotion';

export function AdminTopPerformerCards({ performers }) {
  const reduced = useReducedMotion();
  if (!performers?.length) return null;

  const cols =
    performers.length === 1
      ? 'grid-cols-1'
      : performers.length === 2
        ? 'grid-cols-1 sm:grid-cols-2'
        : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';

  return (
    <div className={cn('grid min-w-0 gap-3', cols)}>
      {performers.map((p, i) => (
        <m.div
          key={p.washerId}
          initial={reduced ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduced ? 0 : i * 0.06, type: 'spring', stiffness: 380, damping: 32 }}
        >
          <Card
            variant="enterprise"
            className={cn(
              'border-white/20 bg-gradient-to-br from-white/45 to-transparent p-4 shadow-lg ring-1 ring-black/[0.04] dark:from-white/[0.08] dark:to-transparent dark:ring-white/10',
              i === 0 && 'border-l-4 border-l-amber-400/80',
            )}
          >
            <div className="flex items-start justify-between gap-2">
              <span className="rounded-full bg-gradient-to-r from-amber-500/20 to-orange-500/15 px-2 py-0.5 text-[9px] font-black uppercase tracking-wide text-amber-950 dark:text-amber-100">
                {p.badge}
              </span>
              <Award className="size-5 text-amber-600 dark:text-amber-400" strokeWidth={1.75} aria-hidden />
            </div>
            <p className="mt-3 text-sm font-black text-wg-text">{p.name}</p>
            <p className="mt-1 text-xs font-bold text-cyan-700 dark:text-cyan-300">{p.metric}</p>
            <p className="mt-2 text-[11px] leading-snug text-wg-muted">{p.sub}</p>
          </Card>
        </m.div>
      ))}
    </div>
  );
}
