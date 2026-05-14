import { useMemo } from 'react';
import { m } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';
import { Card } from '../../ui/card';
import { formatDateTime } from '../../utils/format';

function currentStepIndex(timeline) {
  if (!timeline?.length) return 0;
  const firstOpen = timeline.findIndex((s) => !s.done);
  return firstOpen === -1 ? timeline.length - 1 : firstOpen;
}

export function BookingTimeline({ timeline, noCard = false, className, heading }) {
  const reduced = useReducedMotion();
  const activeIdx = useMemo(() => currentStepIndex(timeline), [timeline]);

  const listVariants = {
    hidden: {},
    show: {
      transition: reduced ? { duration: 0 } : { staggerChildren: 0.07, delayChildren: 0.05 },
    },
  };

  const rowVariants = {
    hidden: { opacity: reduced ? 1 : 0, x: reduced ? 0 : -8 },
    show: { opacity: 1, x: 0, transition: { duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] } },
  };

  if (!timeline?.length) return null;

  const titleClass = noCard ? 'text-base font-bold text-wg-text' : 'wg-heading-section';
  const titleText = heading ?? (noCard ? 'Progress' : 'Status timeline');
  const inner = (
    <>
      <h2 className={titleClass}>{titleText}</h2>
      <div className={cn('relative pl-1', noCard ? 'mt-4' : 'mt-6')}>
        <div
          className="absolute bottom-3 left-[15px] top-3 w-px bg-gradient-to-b from-cyan-500/45 via-wg-border to-transparent dark:from-cyan-400/35"
          aria-hidden
        />
        <m.ul
          className={cn('relative space-y-0', noCard && 'mt-0')}
          variants={listVariants}
          initial="hidden"
          animate="show"
          aria-label="Booking progress"
        >
          {timeline.map((step, i) => {
            const isCurrent = i === activeIdx && !step.done;
            return (
              <m.li
                key={step.key}
                variants={rowVariants}
                layout={!reduced}
                className={cn(
                  'relative flex gap-4 pl-10',
                  noCard ? 'py-3' : 'py-4',
                  i < timeline.length - 1 ? 'border-b border-wg-border/80' : '',
                )}
              >
                <span
                  className="absolute left-0 top-1/2 z-[1] flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-wg-surface-elevated shadow-sm ring-2 ring-wg-border dark:bg-wg-surface dark:ring-wg-border"
                  aria-hidden
                >
                  {step.done ? (
                    <CheckCircle2 className="size-5 text-emerald-500 dark:text-emerald-400" strokeWidth={1.75} />
                  ) : (
                    <m.span
                      animate={isCurrent && !reduced ? { scale: [1, 1.12, 1] } : {}}
                      transition={{ duration: 2.4, repeat: isCurrent ? Infinity : 0, ease: 'easeInOut' }}
                    >
                      <Circle className="size-5 text-wg-muted" strokeWidth={1.5} />
                    </m.span>
                  )}
                </span>
                <div className="min-w-0 flex-1 pt-0.5">
                  <p className="font-semibold text-wg-text">{step.label}</p>
                  <p className="text-xs text-wg-muted">
                    {step.at ? formatDateTime(step.at) : step.done ? 'Completed' : 'Pending'}
                  </p>
                </div>
              </m.li>
            );
          })}
        </m.ul>
      </div>
    </>
  );

  if (noCard) {
    return <div className={cn('border-t border-wg-border/80 pt-4', className)}>{inner}</div>;
  }

  return (
    <Card variant="glass" className={className}>
      {inner}
    </Card>
  );
}
