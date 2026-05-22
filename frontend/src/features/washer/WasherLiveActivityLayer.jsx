import { useCallback, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { m, AnimatePresence } from 'framer-motion';
import { Bell, Radio, Zap } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

const POOL = [
  { icon: Zap, text: 'Surge · Okhla +₹99 active', tone: 'border-amber-400/30 bg-amber-500/15 text-amber-950 dark:text-amber-50' },
  { icon: Radio, text: 'Dispatch · zone rebalanced', tone: 'border-cyan-400/25 bg-cyan-500/12 text-wg-text' },
  { icon: Bell, text: 'Customer opened live ETA link', tone: 'border-indigo-400/25 bg-indigo-500/10 text-wg-text' },
  { icon: Zap, text: 'Peak · acceptance window 90s', tone: 'border-rose-400/25 bg-rose-500/10 text-rose-950 dark:text-rose-50' },
];

let seq = 0;

/** Floating gig-style activity chips — demo realtime feel (no backend). */
export function WasherLiveActivityLayer({ online }) {
  const reduced = useReducedMotion();
  const location = useLocation();
  const onJob = /\/partner\/jobs\//.test(location.pathname);
  const [items, setItems] = useState([]);

  const push = useCallback(() => {
    const row = POOL[Math.floor(Math.random() * POOL.length)];
    const id = ++seq;
    setItems((prev) => [{ id, ...row }, ...prev].slice(0, 3));
    setTimeout(() => {
      setItems((prev) => prev.filter((x) => x.id !== id));
    }, 6000);
  }, []);

  useEffect(() => {
    if (!online) return undefined;
    const t = setInterval(() => {
      if (Math.random() > 0.14) push();
    }, 24000 + Math.random() * 16000);
    const t0 = setTimeout(push, 12000 + Math.random() * 8000);
    return () => {
      clearInterval(t);
      clearTimeout(t0);
      setItems([]);
    };
  }, [online, push]);

  if (!online || items.length === 0) return null;

  return (
    <div
      className={cn(
        'pointer-events-none fixed z-[46] flex max-w-[13.5rem] flex-col gap-2',
        onJob ? 'right-2 top-20' : 'right-3 top-24',
      )}
    >
      <AnimatePresence initial={false}>
        {items.map((row) => {
          const Icon = row.icon;
          return (
            <m.div
              key={row.id}
              layout
              initial={reduced ? false : { opacity: 0, x: 28, scale: 0.92 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0, x: 12, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 420, damping: 28 }}
              className={cn(
                'pointer-events-none flex items-center gap-2 rounded-2xl border px-3 py-2.5 text-[11px] font-bold leading-snug shadow-lg shadow-black/15 ring-1 ring-white/10 backdrop-blur-xl dark:shadow-black/40',
                row.tone,
              )}
            >
              <Icon className="size-3.5 shrink-0 opacity-90" strokeWidth={2} aria-hidden />
              <span>{row.text}</span>
            </m.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
