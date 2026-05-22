import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/useReducedMotion';

/** Subtle decorative UI hints — background only, no fake interactivity. */
export function FeatureCardMicroVisual({ variant, className }) {
  const reduced = useReducedMotion();

  if (variant === 'book') {
    return (
      <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
        <div className="absolute right-4 top-4 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider text-cyan-800/90 dark:text-cyan-200/90">
          Live pricing
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <div className="h-1 overflow-hidden rounded-full bg-white/30 dark:bg-white/10">
            <div
              className={cn(
                'h-full w-[72%] rounded-full bg-gradient-to-r from-cyan-400/70 to-emerald-400/60',
                !reduced && 'transition-all duration-700 group-hover:w-[88%]',
              )}
            />
          </div>
          <div className="mt-2 flex justify-between text-[9px] font-semibold text-wg-muted/80">
            <span>Vehicle</span>
            <span>Package</span>
            <span>Time</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'track') {
    return (
      <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
        <svg className="absolute bottom-8 left-5 right-8 h-16 w-auto opacity-40" viewBox="0 0 200 48" fill="none">
          <path
            d="M8 36 C 50 8, 90 40, 130 16 S 180 28, 192 12"
            stroke="url(#trackGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="4 6"
          />
          <defs>
            <linearGradient id="trackGrad" x1="0" y1="0" x2="200" y2="0">
              <stop stopColor="rgb(52 211 153 / 0.6)" />
              <stop offset="1" stopColor="rgb(34 211 238 / 0.6)" />
            </linearGradient>
          </defs>
        </svg>
        <span className="absolute bottom-14 right-8 flex items-center gap-1.5 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:text-emerald-200">
          {!reduced ? (
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-60" />
              <span className="relative size-1.5 rounded-full bg-emerald-500" />
            </span>
          ) : (
            <span className="size-1.5 rounded-full bg-emerald-500" />
          )}
          Live
        </span>
      </div>
    );
  }

  if (variant === 'secure') {
    return (
      <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
        <div className="absolute right-5 top-5 flex flex-col items-end gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-full border border-indigo-400/25 bg-indigo-500/10 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide text-indigo-900/80 dark:text-indigo-200/90">
            Verified
          </span>
          <span className="rounded-lg border border-white/20 bg-white/30 px-2 py-1 font-mono text-[8px] text-wg-muted dark:bg-white/5">
            role · JWT
          </span>
        </div>
        <div className="absolute bottom-6 left-6 flex gap-1">
          {[1, 2, 3].map((n) => (
            <div key={n} className="size-6 rounded-md border border-violet-400/15 bg-violet-500/8" />
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'schedule') {
    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
    return (
      <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
        <div className="absolute bottom-5 left-5 right-5 flex gap-1">
          {days.map((d, i) => (
            <div
              key={`${d}-${i}`}
              className={cn(
                'flex flex-1 flex-col items-center rounded-lg border py-1.5',
                i === 2
                  ? 'border-amber-400/35 bg-amber-500/15 shadow-sm'
                  : 'border-white/15 bg-white/20 dark:bg-white/5',
              )}
            >
              <span className="text-[8px] font-bold text-wg-muted">{d}</span>
              <span className={cn('mt-0.5 size-1 rounded-full', i === 2 ? 'bg-amber-500' : 'bg-wg-muted/30')} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === 'ai') {
    return (
      <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
        <div className="absolute bottom-6 left-6 right-6 rounded-xl border border-fuchsia-400/15 bg-gradient-to-r from-violet-500/8 to-cyan-500/8 px-3 py-2">
          <div className="flex gap-1.5">
            <span className="size-2 rounded-full bg-violet-400/50" />
            <span className="h-2 flex-1 rounded-full bg-white/25 dark:bg-white/10" />
          </div>
          <p className="mt-2 text-[9px] font-medium text-wg-muted/90">How can I reschedule my wash?</p>
        </div>
      </div>
    );
  }

  if (variant === 'support') {
    return (
      <div className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)} aria-hidden>
        <div className="absolute bottom-6 left-6 right-6 space-y-1.5">
          <div className="ml-0 max-w-[70%] rounded-xl rounded-bl-sm border border-cyan-400/15 bg-cyan-500/10 px-2 py-1.5 text-[9px] text-wg-muted">
            Washer is 10 min away
          </div>
          <div className="ml-auto max-w-[55%] rounded-xl rounded-br-sm border border-white/20 bg-white/40 px-2 py-1.5 text-[9px] text-wg-muted dark:bg-white/8">
            Thanks!
          </div>
        </div>
        {!reduced ? (
          <span className="absolute right-6 top-6 size-2 rounded-full bg-cyan-400/80 shadow-[0_0_12px_rgba(34,211,238,0.5)] animate-pulse" />
        ) : null}
      </div>
    );
  }

  return null;
}
