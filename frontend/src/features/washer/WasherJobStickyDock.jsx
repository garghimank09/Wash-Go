import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { m, animate, useMotionValue } from 'framer-motion';
import { ChevronRight, Clock, Sparkles } from 'lucide-react';

import { cn } from '../../lib/cn';
import { Button } from '../../ui/button';

const PHASE_PRIMARY = {
  received: { label: 'Accept job', sub: 'Lock this run into your queue' },
  accepted: { label: 'Heading to customer', sub: 'Live navigation + ETA' },
  on_the_way: { label: "I've arrived onsite", sub: 'Document vehicle condition at location' },
  arrived: { label: 'Vehicle condition photo', sub: 'Add notes · customer approves before wash' },
  awaiting_approval: { label: 'Waiting for customer', sub: 'They review condition photo & notes' },
  arrival_approved: { label: 'Start service', sub: 'Condition approved — begin wash' },
  wash_started: { label: 'Service in progress', sub: 'Quality pass + wash photos' },
  qc_review: { label: 'Mark service completed', sub: 'Finish QC and close out the job' },
  completed: { label: 'Job complete', sub: 'Great work — back to ops' },
};

function SwipeCompleteRail({ reduced, onComplete, disabled, compact = false }) {
  const x = useMotionValue(0);
  const [committed, setCommitted] = useState(false);
  const maxX = compact ? 132 : 148;

  const onDragEnd = useCallback(
    async (_e, info) => {
      if (disabled || committed || reduced) return;
      if (info.offset.x > 64) {
        setCommitted(true);
        await animate(x, maxX, { type: 'spring', stiffness: 380, damping: 28 });
        onComplete();
      } else {
        animate(x, 0, { type: 'spring', stiffness: 520, damping: 34 });
      }
    },
    [committed, disabled, reduced, x, maxX, onComplete],
  );

  if (reduced) {
    return (
      <Button type="button" size="sm" variant="outline" className="w-full" onClick={() => onComplete()} disabled={disabled}>
        Complete job
      </Button>
    );
  }

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-emerald-500/25 bg-slate-900/60 shadow-inner dark:bg-slate-950/80',
        compact ? 'h-11' : 'h-12',
      )}
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Swipe to finish</p>
      </div>
      <m.div
        drag="x"
        dragConstraints={{ left: 0, right: maxX }}
        dragElastic={0.05}
        dragMomentum={false}
        style={{ x }}
        onDragEnd={onDragEnd}
        whileTap={disabled || committed ? undefined : { scale: 0.98 }}
        className={cn(
          'absolute left-1 top-1 flex cursor-grab items-center justify-center gap-1 rounded-lg border border-white/20 bg-gradient-to-br from-emerald-400 to-cyan-500 text-[11px] font-black text-slate-950 shadow-md active:cursor-grabbing',
          compact ? 'h-9 w-[6.5rem]' : 'h-[calc(100%-0.5rem)] w-[7rem]',
          (disabled || committed) && 'pointer-events-none opacity-50',
        )}
      >
        <Sparkles className="size-3" strokeWidth={2} aria-hidden />
        Slide
      </m.div>
    </div>
  );
}

/**
 * Sticky driver-style action dock — aligned with job page grid on xl+.
 */
export function WasherJobStickyDock({
  phase,
  reduced,
  onAdvance,
  showSwipeComplete,
  showCelebrationBanner,
  advanceDisabled = false,
  advanceHint = null,
}) {
  const copy = PHASE_PRIMARY[phase] || PHASE_PRIMARY.received;
  const isDone = phase === 'completed';
  const waiting = phase === 'awaiting_approval';
  const dockDisabled = advanceDisabled || waiting;
  const showSwipe = showSwipeComplete && phase === 'qc_review' && !isDone;
  const hint = advanceHint || copy.sub;

  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-0 left-0 right-0 z-50 md:left-16',
        'pb-[calc(4.75rem+env(safe-area-inset-bottom))] md:pb-5',
      )}
    >
      <div className="pointer-events-auto mx-auto w-full max-w-[min(100%,96rem)] px-4 md:px-8">
        <div className="xl:grid xl:grid-cols-[minmax(0,1fr)_340px] xl:gap-10">
          <div
            className={cn(
              'rounded-2xl border border-wg-border/80 bg-wg-surface-elevated/97 p-4 shadow-[0_-12px_40px_-16px_rgb(15_23_42/0.35)] backdrop-blur-xl',
              'dark:border-white/12 dark:bg-slate-950/96',
            )}
          >
            {showCelebrationBanner ? (
              <m.div
                initial={reduced ? false : { scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-3 rounded-xl border border-emerald-400/30 bg-emerald-500/12 px-3 py-2.5 text-center"
              >
                <p className="text-sm font-black text-emerald-800 dark:text-emerald-100">Payout queued · customer notified</p>
              </m.div>
            ) : null}

            {isDone ? (
              <Link
                to="/partner"
                className="flex h-11 w-full items-center justify-center rounded-xl border border-wg-border/80 bg-white/5 text-sm font-bold text-wg-text transition hover:bg-wg-surface-elevated dark:border-white/10 dark:hover:bg-white/[0.06]"
              >
                Back to operations
              </Link>
            ) : showSwipe ? (
              <div className="space-y-3">
                <div className="min-w-0">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-wg-muted">Finish job</p>
                  <p className="mt-0.5 text-sm font-black text-wg-text">{copy.label}</p>
                  <p className="mt-0.5 text-xs leading-relaxed text-wg-muted">{hint}</p>
                </div>
                <SwipeCompleteRail reduced={reduced} onComplete={() => onAdvance()} disabled={dockDisabled} compact />
                <button
                  type="button"
                  disabled={dockDisabled}
                  onClick={() => !dockDisabled && onAdvance()}
                  className="w-full text-center text-xs font-semibold text-cyan-700 underline-offset-2 hover:underline disabled:opacity-50 dark:text-cyan-300"
                >
                  Tap here instead of swiping
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-wg-muted">Next step</p>
                  <p className="mt-0.5 text-sm font-black leading-snug text-wg-text">{copy.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-relaxed text-wg-muted">{hint}</p>
                </div>
                <Button
                  type="button"
                  disabled={dockDisabled}
                  className={cn(
                    'wg-partner-cta-gradient h-11 w-full shrink-0 gap-2 rounded-xl text-sm font-black sm:w-auto sm:min-w-[11.5rem]',
                    waiting && 'opacity-70',
                  )}
                  onClick={() => !dockDisabled && onAdvance()}
                >
                  {waiting ? (
                    <>
                      <Clock className="size-4" strokeWidth={2} aria-hidden />
                      Waiting…
                    </>
                  ) : (
                    <>
                      {copy.label}
                      <ChevronRight className="size-4" strokeWidth={2.5} aria-hidden />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="hidden xl:block" aria-hidden />
        </div>
      </div>
    </div>
  );
}
