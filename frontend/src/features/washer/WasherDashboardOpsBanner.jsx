import { useEffect, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { Flame, Radio, Zap } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

const ALERTS = [
  { id: 'surge', icon: Zap, title: 'Surge +$4', body: 'SOMA · next 25 min', tone: 'from-amber-500/20 to-orange-500/10 border-amber-400/25 text-amber-950 dark:text-amber-50' },
  { id: 'ops', icon: Radio, title: 'Dispatch ping', body: 'Stay online — 3 drivers short', tone: 'from-cyan-500/15 to-indigo-500/10 border-cyan-400/20 text-wg-text' },
  { id: 'bonus', icon: Flame, title: 'Streak bonus', body: '2 more completes unlock +$12', tone: 'from-rose-500/15 to-fuchsia-500/10 border-rose-400/25 text-rose-950 dark:text-rose-50' },
];

/** Rotating operational micro-alerts — investor-demo energy without APIs. */
export function WasherDashboardOpsBanner({ online }) {
  const reduced = useReducedMotion();
  const [i, setI] = useState(0);

  useEffect(() => {
    if (!online) return undefined;
    const t = setInterval(() => setI((v) => (v + 1) % ALERTS.length), 6200);
    return () => clearInterval(t);
  }, [online]);

  if (!online) return null;

  const item = ALERTS[i];
  const Icon = item.icon;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-lg">
      <AnimatePresence mode="wait">
        <m.div
          key={item.id}
          initial={reduced ? false : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduced ? undefined : { opacity: 0, x: -12 }}
          transition={{ duration: reduced ? 0 : 0.28 }}
          className={cn('flex items-center gap-3 bg-gradient-to-r px-4 py-3.5', item.tone)}
        >
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-black/10 ring-1 ring-white/10 dark:bg-white/5">
            <Icon className="size-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-wg-muted">Live zone</p>
            <p className="truncate text-sm font-black">{item.title}</p>
            <p className="truncate text-xs font-medium text-wg-muted">{item.body}</p>
          </div>
          <span className="relative ml-auto flex size-2.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400/60 opacity-75" />
            <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500" />
          </span>
        </m.div>
      </AnimatePresence>
    </div>
  );
}
