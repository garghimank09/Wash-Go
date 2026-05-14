import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { m, animate, useMotionValue } from 'framer-motion';
import { ChevronRight, Sparkles } from 'lucide-react';

import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';

const PHASE_PRIMARY = {
  received: { label: 'Accept job', sub: 'Lock this run into your queue' },
  accepted: { label: 'Heading to customer', sub: 'Live navigation + ETA' },
  on_the_way: { label: "I've arrived onsite", sub: 'Pin verified · start check-in' },
  arrived: { label: 'Start service', sub: 'Begin wash timer + proof flow' },
  wash_started: { label: 'Service in progress', sub: 'Quality pass + photos' },
  qc_review: { label: 'Run QC review', sub: 'Checklist + shine verification' },
  awaiting_approval: { label: 'Notify customer', sub: 'Request in-app approval' },
  completed: { label: 'Job complete', sub: 'Great work — back to ops' },
};

function SwipeCompleteRail({ reduced, onComplete, disabled }) {
  const x = useMotionValue(0);
  const [committed, setCommitted] = useState(false);
  const maxX = 148;

  const onDragEnd = useCallback(
    async (_e, info) => {
      if (disabled || committed || reduced) return;
      if (info.offset.x > 72) {
        setCommitted(true);
        await animate(x, maxX, { type: 'spring', stiffness: 380, damping: 28 });
        onComplete();
      } else {
        animate(x, 0, { type: 'spring', stiffness: 520, damping: 34 });
      }
    },
    [committed, disabled, reduced, x, onComplete],
  );

  if (reduced) {
    return <p className="mt-2 text-center text-xs text-wg-muted">Use “Notify customer” above — reduced motion.</p>;
  }

  return (
    <div className="relative mt-3 h-[3.25rem] overflow-hidden rounded-2xl border border-emerald-500/30 bg-slate-900/70 shadow-inner dark:bg-slate-950/85">
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center pr-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/40">Swipe to finish →</p>
      </div>
      <m.div
        drag="x"
        dragConstraints={{ left: 0, right: maxX }}
        dragElastic={0.05}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={onDragEnd}
        whileTap={disabled || committed ? undefined : { scale: 0.97 }}
        className={cn(
          'absolute left-1 top-1 flex h-[calc(100%-0.5rem)] w-[7.25rem] cursor-grab items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-black text-slate-950 shadow-lg active:cursor-grabbing',
          (disabled || committed) && 'pointer-events-none opacity-50',
        )}
      >
        <Sparkles className="size-3.5" strokeWidth={2} aria-hidden />
        Slide
      </m.div>
    </div>
  );
}

/**
 * Sticky driver-style action dock — sits above bottom nav.
 */
export function WasherJobStickyDock({ phase, reduced, onAdvance, showSwipeComplete, showCelebrationBanner }) {
  const copy = PHASE_PRIMARY[phase] || PHASE_PRIMARY.received;
  const isDone = phase === 'completed';

  return (
    <div
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-white/18 bg-[color:var(--wg-glass-bg)]/96 px-4 pt-3 shadow-[0_-16px_48px_-14px_rgb(0_0_0/0.4)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/92',
        'pb-[calc(4.5rem+env(safe-area-inset-bottom))]',
      )}
    >
      <div className="mx-auto max-w-lg space-y-2">
        {showCelebrationBanner ? (
          <m.div
            initial={reduced ? false : { scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="rounded-2xl border border-emerald-400/35 bg-gradient-to-r from-emerald-500/25 via-cyan-500/18 to-emerald-500/12 px-4 py-3 text-center shadow-lg ring-1 ring-emerald-400/20"
          >
            <p className="text-sm font-black text-emerald-900 dark:text-emerald-100">Payout queued · customer notified</p>
            <p className="mt-0.5 text-xs font-medium text-wg-muted">Demo celebration — production hooks to ledger + push.</p>
          </m.div>
        ) : null}

        {!isDone ? (
          <>
            <div className="flex flex-col gap-0.5 px-0.5">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-wg-muted">Next action</p>
              <p className="text-xs text-wg-muted">{copy.sub}</p>
            </div>
            <Button
              type="button"
              className="h-14 w-full gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-cyan-500 text-base font-black text-white shadow-[0_10px_32px_-6px_rgb(6_182_212/0.55)] active:scale-[0.99]"
              onClick={() => onAdvance()}
            >
              {copy.label}
              <ChevronRight className="size-5" strokeWidth={2.5} aria-hidden />
            </Button>
            {showSwipeComplete && phase === 'awaiting_approval' ? (
              <SwipeCompleteRail reduced={reduced} onComplete={() => onAdvance()} disabled={isDone} />
            ) : null}
          </>
        ) : (
          <Link
            to="/partner"
            className="flex h-12 w-full items-center justify-center rounded-2xl border border-wg-border bg-white/5 text-sm font-bold text-wg-text shadow-sm backdrop-blur-sm transition hover:bg-wg-surface-elevated dark:bg-white/[0.04] dark:hover:bg-slate-800/80"
          >
            Back to operations
          </Link>
        )}
      </div>
    </div>
  );
}
