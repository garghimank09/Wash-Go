import { useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { CheckCircle2, ChevronDown, Circle } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';
import { Card } from '../../ui/card';

/**
 * Expandable customer service progress — tap a step for transparency sub-checkpoints.
 * @param {{ timeline: Array<{ key: string; label: string; done: boolean; statusLabel: string; subCheckpoints?: string[]; isCurrent?: boolean }>; heading?: string; noCard?: boolean; className?: string }} props
 */
export function ServiceProgressTimeline({ timeline, heading = 'Service progress', noCard = false, className }) {
  const reduced = useReducedMotion();
  const [expandedKey, setExpandedKey] = useState(null);

  if (!timeline?.length) return null;

  const titleClass = noCard ? 'text-base font-bold text-wg-text' : 'wg-heading-section';

  const inner = (
    <>
      <h2 className={titleClass}>{heading}</h2>
      <p className="mt-1 text-xs text-wg-muted">Tap any step to see what happens behind the scenes.</p>
      <div className={cn('relative pl-1', noCard ? 'mt-4' : 'mt-6')}>
        <div
          className="absolute bottom-3 left-[15px] top-3 w-px bg-gradient-to-b from-cyan-500/45 via-wg-border to-transparent dark:from-cyan-400/35"
          aria-hidden
        />
        <ul className="relative space-y-0" aria-label="Service progress">
          {timeline.map((step, i) => {
            const expanded = expandedKey === step.key;
            const isCurrent = step.isCurrent || (!step.done && timeline.findIndex((s) => !s.done) === i);
            return (
              <li
                key={step.key}
                className={cn(
                  i < timeline.length - 1 ? 'border-b border-wg-border/80' : '',
                  isCurrent && 'bg-cyan-500/[0.04]',
                )}
              >
                <button
                  type="button"
                  className={cn(
                    'relative flex w-full gap-4 py-4 pl-10 pr-3 text-left transition wg-focus-ring',
                    noCard && 'py-3',
                  )}
                  onClick={() => setExpandedKey((k) => (k === step.key ? null : step.key))}
                  aria-expanded={expanded}
                >
                  <span
                    className="absolute left-0 top-1/2 z-[1] flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-wg-surface-elevated shadow-sm ring-2 ring-wg-border dark:bg-wg-surface"
                    aria-hidden
                  >
                    {step.done ? (
                      <CheckCircle2 className="size-5 text-emerald-500 dark:text-emerald-400" strokeWidth={1.75} />
                    ) : (
                      <Circle
                        className={cn('size-5', isCurrent ? 'text-cyan-500' : 'text-wg-muted')}
                        strokeWidth={1.5}
                      />
                    )}
                  </span>
                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-wg-text">{step.label}</p>
                      <ChevronDown
                        className={cn(
                          'size-4 shrink-0 text-wg-muted transition',
                          expanded && 'rotate-180',
                        )}
                        aria-hidden
                      />
                    </div>
                    <p
                      className={cn(
                        'text-xs',
                        step.done ? 'text-emerald-700 dark:text-emerald-300' : 'text-wg-muted',
                        isCurrent && !step.done && 'font-semibold text-cyan-700 dark:text-cyan-300',
                      )}
                    >
                      {step.statusLabel}
                    </p>
                  </div>
                </button>
                <AnimatePresence initial={false}>
                  {expanded && step.subCheckpoints?.length ? (
                    <m.div
                      initial={reduced ? false : { height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={reduced ? undefined : { height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <ul className="mb-3 ml-10 mr-3 space-y-1.5 rounded-xl border border-wg-border/80 bg-wg-surface/60 px-3 py-2.5 text-xs text-wg-muted dark:bg-white/[0.03]">
                        {step.subCheckpoints.map((line) => (
                          <li key={line} className="flex gap-2 leading-relaxed">
                            <span className="text-cyan-600 dark:text-cyan-400" aria-hidden>
                              ·
                            </span>
                            <span>{line}</span>
                          </li>
                        ))}
                      </ul>
                    </m.div>
                  ) : null}
                </AnimatePresence>
              </li>
            );
          })}
        </ul>
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
