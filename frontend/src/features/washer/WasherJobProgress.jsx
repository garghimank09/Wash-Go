import { m } from 'framer-motion';
import { Check } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';
import { WASHER_PHASE_ORDER, phaseRank } from '../../lib/washerJobPhase';

const LABELS = {
  received: 'Request received',
  accepted: 'Queued · heading soon',
  on_the_way: 'Heading to customer',
  arrived: 'Arrived onsite',
  awaiting_approval: 'Arrival photo · customer OK',
  arrival_approved: 'Customer approved',
  wash_started: 'Service in progress',
  qc_review: 'QC review',
  completed: 'Completed',
};

export function WasherJobProgress({ phase }) {
  const reduced = useReducedMotion();
  const r = phaseRank(phase);

  return (
    <ol className="relative space-y-0">
      <m.div
        className="absolute bottom-3 left-[15px] top-3 w-0.5 overflow-hidden rounded-full bg-wg-border/80 dark:bg-white/10"
        aria-hidden
      >
        <m.div
          className="w-full bg-gradient-to-b from-emerald-400 via-cyan-400 to-cyan-600"
          initial={false}
          animate={{ height: `${Math.max(6, (r / (WASHER_PHASE_ORDER.length - 1)) * 100)}%` }}
          transition={{ type: 'spring', stiffness: 300, damping: 26 }}
        />
      </m.div>
      {WASHER_PHASE_ORDER.map((key, i) => {
        const done = phaseRank(key) < r || (phase === 'completed' && phaseRank(key) <= r);
        const current = key === phase;
        return (
          <m.li
            key={key}
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: reduced ? 0 : i * 0.035, type: 'spring', stiffness: 400, damping: 30 }}
            className={cn(
              'relative flex gap-4 border-b border-wg-border/60 py-3.5 pl-10 last:border-0 dark:border-white/10',
              current && 'rounded-xl bg-gradient-to-r from-cyan-500/[0.08] to-transparent ring-1 ring-cyan-500/10',
            )}
          >
            <span className="absolute left-0 top-1/2 z-[1] -translate-y-1/2">
              {current && !reduced ? (
                <span className="absolute inset-0 -m-1 animate-ping rounded-full bg-cyan-400/40" aria-hidden />
              ) : null}
              <span
                className={cn(
                  'relative flex size-8 items-center justify-center rounded-full text-[10px] font-black ring-2 transition-shadow',
                  done
                    ? 'bg-emerald-500 text-white ring-emerald-300/50 shadow-[0_0_0_4px_rgb(16_185_129/0.12)]'
                    : current
                      ? 'bg-gradient-to-br from-cyan-500 to-emerald-500 text-white ring-cyan-200/50 shadow-lg shadow-cyan-500/30'
                      : 'bg-wg-surface-elevated text-wg-muted ring-wg-border dark:bg-slate-800/90',
                )}
              >
                {done ? <Check className="size-4" strokeWidth={2.5} aria-hidden /> : i + 1}
              </span>
            </span>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className={cn('text-[15px] font-bold', current ? 'text-cyan-800 dark:text-cyan-100' : 'text-wg-text')}>
                {LABELS[key]}
              </p>
              <p className="text-xs text-wg-muted">{done ? 'Cleared' : current ? 'Live · in motion' : 'Queued'}</p>
            </div>
          </m.li>
        );
      })}
    </ol>
  );
}
