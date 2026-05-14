import { cn } from '../lib/cn';

/** Large tap-friendly selectable tile for booking flows. */
export function SelectableChip({ selected, children, className, ...rest }) {
  return (
    <button
      type="button"
      className={cn(
        'min-h-[44px] rounded-xl border px-4 py-3 text-left text-sm font-semibold',
        'transition-all duration-200 ease-out will-change-transform',
        'hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 active:scale-[0.99] active:shadow-sm',
        selected
          ? 'border-cyan-500/70 bg-gradient-to-br from-cyan-500/14 via-cyan-500/8 to-indigo-600/10 text-cyan-900 shadow-md ring-1 ring-cyan-500/25 dark:text-cyan-100'
          : 'border-wg-border/90 bg-wg-surface-elevated/55 text-wg-text shadow-sm backdrop-blur-sm hover:border-cyan-500/45 dark:bg-wg-surface-elevated/40 dark:hover:border-cyan-500/35',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
