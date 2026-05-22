import { m } from 'framer-motion';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { marketingReveal } from './marketingMotion';

export function MarketingReveal({ children, className, delay = 0 }) {
  const reduced = useReducedMotion();

  return (
    <m.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: '-48px' }}
      variants={marketingReveal(reduced)}
      transition={reduced ? undefined : { delay }}
    >
      {children}
    </m.div>
  );
}
