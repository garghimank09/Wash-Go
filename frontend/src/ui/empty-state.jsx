import { cn } from '../lib/cn';

/**
 * Centered empty state with optional Lucide icon and action slot.
 */
export function EmptyState({ icon: Icon, title, description, children, className }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center rounded-[var(--radius-wg-card)] border border-dashed border-wg-border bg-wg-surface-elevated/50 px-6 py-12 text-center dark:bg-wg-surface-elevated/30',
        className,
      )}
    >
      {Icon ? (
        <div className="mb-4 flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-from/15 to-brand-to/15 text-cyan-600 dark:text-cyan-400">
          <Icon className="size-7" strokeWidth={1.5} />
        </div>
      ) : null}
      <h3 className="text-lg font-bold text-wg-text">{title}</h3>
      {description ? <p className="mt-2 max-w-sm text-sm text-wg-muted">{description}</p> : null}
      {children ? <div className="mt-6 flex flex-wrap justify-center gap-2">{children}</div> : null}
    </div>
  );
}
