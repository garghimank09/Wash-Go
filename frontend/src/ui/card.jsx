import { cn } from '../lib/cn';

const variants = {
  default:
    'rounded-[var(--radius-wg-card)] border border-wg-border bg-wg-surface-elevated/90 shadow-wg-card backdrop-blur-sm transition hover:shadow-md dark:bg-wg-surface-elevated/80',
  glass:
    'rounded-[var(--radius-wg-card)] border border-white/30 bg-[color:var(--wg-glass-bg)] shadow-wg-card backdrop-blur-xl transition hover:shadow-lg dark:border-white/10 dark:bg-[color:var(--wg-glass-bg)] dark:shadow-black/30 dark:ring-1 dark:ring-inset dark:ring-[color:var(--wg-glass-highlight)]',
  enterprise:
    'rounded-[var(--radius-wg-card)] border border-wg-border/90 bg-wg-surface-elevated shadow-wg-card transition hover:shadow-md dark:border-white/10 dark:bg-wg-surface-elevated/95 dark:shadow-black/25',
  inset:
    'rounded-[var(--radius-wg-card)] border border-wg-border bg-wg-surface/80 shadow-[inset_0_1px_2px_rgb(15_23_42/0.06)] backdrop-blur-sm dark:bg-wg-surface/60 dark:shadow-[inset_0_1px_2px_rgb(0_0_0/0.25)]',
};

/**
 * Elevated surface. Variants: default | glass | enterprise | inset.
 */
export function Card({ children, className, padding = true, variant = 'default', ...rest }) {
  return (
    <div className={cn(variants[variant] ?? variants.default, padding && 'p-6', className)} {...rest}>
      {children}
    </div>
  );
}
