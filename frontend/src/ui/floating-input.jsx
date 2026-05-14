import { forwardRef, useCallback, useEffect, useState } from 'react';

import { cn } from '../lib/cn';

/**
 * Floating-label text field — label position driven by focus + value.
 * Use `hint` for secondary copy (e.g. “Optional…”) so it never overlaps the input.
 */
export const FloatingInput = forwardRef(function FloatingInput(
  {
    label,
    hint,
    id,
    className,
    error,
    disabled,
    value,
    defaultValue,
    onFocus,
    onBlur,
    onChange,
    placeholder,
    spellCheck,
    ...rest
  },
  ref,
) {
  const inputId = id || rest.name || `float-${String(label).replace(/\s+/g, '-').toLowerCase()}`;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const isControlled = value !== undefined;
  const [uncontrolledLen, setUncontrolledLen] = useState(() => String(defaultValue ?? '').length);

  useEffect(() => {
    if (!isControlled) setUncontrolledLen(String(defaultValue ?? '').length);
  }, [defaultValue, isControlled]);

  const filled = isControlled ? String(value ?? '').length > 0 : uncontrolledLen > 0;
  const [focused, setFocused] = useState(false);
  const floated = focused || filled;

  const handleChange = useCallback(
    (e) => {
      if (!isControlled) setUncontrolledLen(e.target.value.length);
      onChange?.(e);
    },
    [isControlled, onChange],
  );

  const handleFocus = useCallback(
    (e) => {
      setFocused(true);
      onFocus?.(e);
    },
    [onFocus],
  );

  const handleBlur = useCallback(
    (e) => {
      setFocused(false);
      onBlur?.(e);
    },
    [onBlur],
  );

  const describedBy = [hintId, error ? `${inputId}-err` : null].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('relative', className)}>
      <input
        ref={ref}
        {...rest}
        id={inputId}
        disabled={disabled}
        spellCheck={spellCheck}
        {...(isControlled ? { value } : { defaultValue })}
        placeholder={floated ? (placeholder ?? '') : ' '}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        className={cn(
          'w-full rounded-xl border border-wg-border/90 bg-wg-surface-elevated/85 px-4 text-[15px] leading-normal text-wg-text shadow-sm transition-[border-color,box-shadow,background-color,padding] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
          floated ? 'pb-3 pt-8' : 'py-4',
          'placeholder:text-transparent',
          'hover:border-cyan-500/40 hover:shadow-[0_0_0_1px_rgba(6,182,212,0.1)]',
          'focus:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/35 focus:shadow-[0_0_0_4px_rgba(6,182,212,0.12)] dark:bg-wg-surface-elevated/55 dark:hover:border-cyan-400/30 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/30',
          'disabled:cursor-not-allowed disabled:opacity-55',
          error ? 'border-rose-500/80 focus:ring-rose-500/25' : '',
        )}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
      />
      <label
        htmlFor={inputId}
        className={cn(
          'pointer-events-none absolute left-4 right-4 z-[1] origin-[0] transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]',
          floated
            ? 'top-2.5 translate-y-0 text-[12px] font-semibold leading-tight tracking-normal text-wg-muted'
            : 'top-1/2 -translate-y-1/2 text-[15px] font-medium leading-snug text-wg-muted',
          focused && 'text-cyan-700 dark:text-cyan-300',
        )}
      >
        <span className="block truncate">{label}</span>
      </label>
      {hint ? (
        <p id={hintId} className="mt-1.5 px-1 text-[11px] leading-relaxed text-wg-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${inputId}-err`} className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  );
});

FloatingInput.displayName = 'FloatingInput';
