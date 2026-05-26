import { PartyPopper } from 'lucide-react';
import { m } from 'framer-motion';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { Card } from '../../ui/card';
import { WasherJobProgress } from './WasherJobProgress';

export function WasherJobTimelineAside({ phase }) {
  const reduced = useReducedMotion();

  return (
    <Card
      variant="glass"
      className="border-white/15 p-4 shadow-wg-card ring-1 ring-wg-border/40 sm:p-5 xl:p-4 dark:border-white/10 dark:ring-white/10"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-black text-wg-text">Wash timeline</h2>
          <p className="mt-0.5 text-[11px] leading-snug text-wg-muted">Synced with dock actions & customer app</p>
        </div>
        {phase === 'completed' ? (
          <m.span
            initial={reduced ? false : { scale: 0.8 }}
            animate={{ scale: 1 }}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500 text-white shadow-md"
          >
            <PartyPopper className="size-4" strokeWidth={1.75} aria-hidden />
          </m.span>
        ) : null}
      </div>

      <div className="mt-3 xl:mt-4">
        <WasherJobProgress phase={phase} compact />
      </div>

      {phase === 'completed' ? (
        <p className="mt-4 text-center text-xs font-bold text-emerald-700 dark:text-emerald-300">
          All milestones cleared — customer sees completed
        </p>
      ) : null}
    </Card>
  );
}
