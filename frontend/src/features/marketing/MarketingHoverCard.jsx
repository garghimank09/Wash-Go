import { m } from 'framer-motion';

import { cn } from '../../lib/cn';
import { useReducedMotion } from '../../lib/useReducedMotion';

/**
 * Premium hover surface — lift, soft glow, optional subtle tilt (no heavy 3D).
 */
export function MarketingHoverCard({ children, className }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={cn('wg-marketing-hover-card', className)}>{children}</div>;
  }

  return (
    <m.div
      className={cn('wg-marketing-hover-card', className)}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
    >
      {children}
    </m.div>
  );
}
