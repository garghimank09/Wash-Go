import { m } from 'framer-motion';

import { useReducedMotion } from '../../../lib/useReducedMotion';
import { cn } from '../../../lib/cn';

export function MarketingSectionHeader({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className,
}) {
  const reduced = useReducedMotion();
  const centered = align === 'center';

  return (
    <m.div
      initial={reduced ? false : { opacity: 0, y: 20 }}
      whileInView={reduced ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className={cn(centered ? 'mx-auto max-w-3xl text-center' : 'max-w-2xl', className)}
    >
      {eyebrow ? (
        <p className="wg-premium-eyebrow">{eyebrow}</p>
      ) : null}
      <h2 className={cn('wg-premium-title mt-3', centered && 'mx-auto')}>{title}</h2>
      {subtitle ? (
        <p className={cn('wg-premium-subtitle mt-4', centered && 'mx-auto max-w-2xl')}>{subtitle}</p>
      ) : null}
    </m.div>
  );
}
