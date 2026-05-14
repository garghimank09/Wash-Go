import { cn } from '../lib/cn';

/**
 * WashGo primary actions. Variants: primary | secondary | ghost | danger | outline.
 * Sizes: sm | md | lg.
 */
export function Button({
  children,
  type = 'button',
  variant = 'primary',
  size = 'md',
  className,
  disabled,
  loading,
  ...rest
}) {
  const base = cn(
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200',
    'wg-focus-ring disabled:opacity-50 disabled:pointer-events-none',
  );
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  const variants = {
    primary:
      'bg-gradient-to-r from-brand-from to-brand-to text-white shadow-lg shadow-cyan-500/25 hover:brightness-110 active:scale-[0.98]',
    secondary:
      'bg-slate-200 text-slate-900 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700',
    ghost: 'bg-transparent text-cyan-600 dark:text-cyan-400 hover:bg-slate-200/80 dark:hover:bg-slate-800/80',
    danger: 'bg-rose-600 text-white hover:bg-rose-500',
    outline:
      'border border-wg-border bg-transparent text-wg-text hover:bg-wg-surface-elevated dark:hover:bg-slate-800/80',
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(base, sizes[size], variants[variant], className)}
      {...rest}
    >
      {loading ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
          aria-hidden
        />
      ) : null}
      {children}
    </button>
  );
}
