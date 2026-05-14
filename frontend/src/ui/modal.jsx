import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, m } from 'framer-motion';

import { cn } from '../lib/cn';
import { useReducedMotion } from '../lib/useReducedMotion';

const sizes = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

/**
 * Accessible overlay dialog with motion + backdrop blur.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md', className }) {
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const node = (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center" role="presentation">
          <m.button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/50 backdrop-blur-[2px]"
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduced ? 0 : 0.2 }}
            onClick={onClose}
          />
          <m.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="wg-modal-title"
            className={cn(
              'relative z-[101] w-full overflow-hidden rounded-2xl border border-white/25 bg-[color:var(--wg-glass-bg)] shadow-2xl backdrop-blur-xl dark:border-white/10',
              sizes[size],
              className,
            )}
            initial={reduced ? false : { opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? undefined : { opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className="border-b border-wg-border/80 bg-gradient-to-r from-cyan-500/10 via-transparent to-indigo-500/10 px-5 py-4 dark:border-white/10">
              <h2 id="wg-modal-title" className="text-lg font-black tracking-tight text-wg-text">
                {title}
              </h2>
              {description ? <p className="mt-1 text-sm text-wg-muted">{description}</p> : null}
            </div>
            <div className="max-h-[min(70vh,640px)] overflow-y-auto px-5 py-4">{children}</div>
            {footer ? <div className="border-t border-wg-border/80 px-5 py-4 dark:border-white/10">{footer}</div> : null}
          </m.div>
        </div>
      ) : null}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}
