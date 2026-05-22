import { useEffect, useRef, useState } from 'react';
import { animate } from 'framer-motion';

import { DEFAULT_CURRENCY, formatCents } from '../../utils/format';

/** Count-up / spring-style earnings display for demo psychology. */
export function AnimatedCents({ cents, currency = DEFAULT_CURRENCY, className = '' }) {
  const [v, setV] = useState(() => Math.round(Number(cents) || 0));
  const fromRef = useRef(v);

  useEffect(() => {
    const target = Math.round(Number(cents) || 0);
    const start = fromRef.current;
    const ctrl = animate(start, target, {
      duration: 0.85,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => setV(Math.round(latest)),
      onComplete: () => {
        fromRef.current = target;
      },
    });
    return () => ctrl.stop();
  }, [cents]);

  return <span className={['tabular-nums', className].filter(Boolean).join(' ')}>{formatCents(v, currency)}</span>;
}
