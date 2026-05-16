import { useEffect, useRef, useState } from 'react';
import { m, AnimatePresence } from 'framer-motion';
import { CloudOff, Radio, RefreshCw, Wifi } from 'lucide-react';

import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';

/**
 * Subtle sync / connectivity simulation — rare, short, believable (demo only).
 * Renders only while online so effects never need an offline "idle" branch.
 */
export function WasherPartnerSyncBar({ online }) {
  if (!online) return null;
  return <WasherPartnerSyncBarInner />;
}

function WasherPartnerSyncBarInner() {
  const reduced = useReducedMotion();
  const [mode, setMode] = useState('connected');
  const timeoutsRef = useRef([]);

  useEffect(() => {
    const clearAll = () => {
      timeoutsRef.current.forEach(clearTimeout);
      timeoutsRef.current = [];
    };

    const schedule = (fn, ms) => {
      const t = setTimeout(fn, ms);
      timeoutsRef.current.push(t);
      return t;
    };

    const id = setInterval(() => {
      clearAll();
      const useReconnect = Math.random() < 0.35;
      if (useReconnect) {
        setMode('reconnecting');
        schedule(() => setMode('connected'), 1200 + Math.floor(Math.random() * 400));
      } else {
        setMode('syncing');
        schedule(() => setMode('connected'), 780 + Math.floor(Math.random() * 420));
      }
    }, 56000 + Math.floor(Math.random() * 24000));

    return () => {
      clearInterval(id);
      clearAll();
    };
  }, []);

  const copy =
    mode === 'syncing'
      ? { text: 'Syncing dispatch…', Icon: RefreshCw, spin: true }
      : mode === 'reconnecting'
        ? { text: 'Reconnecting…', Icon: CloudOff, spin: false }
        : { text: 'Live · dispatch linked', Icon: Wifi, spin: false };

  return (
    <div className="border-b border-white/10 bg-black/[0.03] px-4 py-1.5 dark:bg-white/[0.04]">
      <div className="mx-auto flex w-full items-center justify-center gap-2">
        <AnimatePresence mode="wait">
          <m.div
            key={mode}
            initial={reduced ? false : { opacity: 0, y: -3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? undefined : { opacity: 0, y: 3 }}
            transition={{ duration: reduced ? 0 : 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-wg-muted"
          >
            <copy.Icon
              className={cn('size-3.5 text-cyan-600 dark:text-cyan-400', copy.spin && 'animate-spin')}
              strokeWidth={2}
              aria-hidden
            />
            <span className={cn(mode === 'connected' && 'text-emerald-700 dark:text-emerald-300')}>{copy.text}</span>
            {mode === 'connected' ? <Radio className="size-3 text-emerald-500/90" strokeWidth={2} aria-hidden /> : null}
          </m.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
