import { cn } from '../lib/cn';

/**
 * Reusable frosted panel for nav strips, hero callouts, and floating UI.
 */
export function GlassPanel({ children, className, as: Comp = 'div', ...rest }) {
  return (
    <Comp
      className={cn(
        'wg-glass-surface border shadow-wg-card ring-1 ring-white/20 dark:ring-white/5',
        'rounded-2xl',
        className,
      )}
      {...rest}
    >
      {children}
    </Comp>
  );
}
