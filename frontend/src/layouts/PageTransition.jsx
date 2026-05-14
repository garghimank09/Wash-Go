import { AnimatePresence, m } from 'framer-motion';
import { Outlet, useLocation } from 'react-router-dom';

import { useReducedMotion } from '../lib/useReducedMotion';

/** Subtle cross-fade between dashboard routes (respects reduced motion). */
export function PageTransition() {
  const location = useLocation();
  const reduced = useReducedMotion();

  return (
    <AnimatePresence mode="wait">
      <m.div
        key={location.pathname}
        initial={reduced ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={reduced ? undefined : { opacity: 0, y: -6 }}
        transition={{ duration: reduced ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
        className="min-h-0"
      >
        <Outlet />
      </m.div>
    </AnimatePresence>
  );
}
