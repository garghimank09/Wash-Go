import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { m } from 'framer-motion';
import { CalendarDays, Home, Inbox, Wallet } from 'lucide-react';

import { cn } from '../../lib/cn';
import { getMergedIncomingRequests } from './mock/liveDispatchSimulation';

const linkBase =
  'flex min-w-0 flex-1 flex-col items-center gap-1 rounded-2xl py-2.5 text-[10px] font-bold uppercase tracking-wide transition wg-focus-ring active:scale-[0.96]';
const active =
  'text-cyan-800 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] ring-1 ring-cyan-500/25 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.04] dark:text-cyan-100 dark:from-cyan-500/20 dark:to-transparent';
const idle = 'text-wg-muted hover:text-wg-text';

export function WasherBottomNav() {
  const [badge, setBadge] = useState(() => getMergedIncomingRequests().length);

  useEffect(() => {
    const sync = () => setBadge(getMergedIncomingRequests().length);
    sync();
    window.addEventListener('washgo:dispatch-update', sync);
    const id = setInterval(sync, 2500);
    return () => {
      window.removeEventListener('washgo:dispatch-update', sync);
      clearInterval(id);
    };
  }, []);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-white/20 bg-[color:var(--wg-glass-bg)]/95 px-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-14px_44px_-18px_rgb(0_0_0/0.32)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/80 dark:shadow-[0_-18px_52px_-12px_rgb(0_0_0/0.6)]"
      aria-label="Partner navigation"
    >
      <div className="mx-auto flex max-w-lg items-stretch justify-between gap-1.5">
        <NavLink to="/partner" end className={({ isActive }) => cn(linkBase, isActive ? active : idle)}>
          {({ isActive }) => (
            <m.span className="flex flex-col items-center gap-1" whileTap={{ scale: 0.94 }}>
              <Home className={cn('size-5', isActive && 'text-cyan-600 dark:text-cyan-300')} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
              Home
            </m.span>
          )}
        </NavLink>
        <NavLink to="/partner/requests" className={({ isActive }) => cn(linkBase, isActive ? active : idle)}>
          {({ isActive }) => (
            <m.span className="flex flex-col items-center gap-1" whileTap={{ scale: 0.94 }}>
              <span className="relative">
                <Inbox className={cn('size-5', isActive && 'text-cyan-600 dark:text-cyan-300')} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
                {badge > 0 ? (
                  <m.span
                    className="absolute -right-2 -top-1 flex min-w-[1rem] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 px-1 text-[9px] font-black leading-none text-white shadow-md ring-2 ring-white/35 dark:ring-slate-950/80"
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </m.span>
                ) : null}
              </span>
              Offers
            </m.span>
          )}
        </NavLink>
        <NavLink to="/partner/schedule" className={({ isActive }) => cn(linkBase, isActive ? active : idle)}>
          {({ isActive }) => (
            <m.span className="flex flex-col items-center gap-1" whileTap={{ scale: 0.94 }}>
              <CalendarDays className={cn('size-5', isActive && 'text-cyan-600 dark:text-cyan-300')} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
              Schedule
            </m.span>
          )}
        </NavLink>
        <NavLink to="/partner/earnings" className={({ isActive }) => cn(linkBase, isActive ? active : idle)}>
          {({ isActive }) => (
            <m.span className="flex flex-col items-center gap-1" whileTap={{ scale: 0.94 }}>
              <Wallet className={cn('size-5', isActive && 'text-cyan-600 dark:text-cyan-300')} strokeWidth={isActive ? 2.25 : 1.75} aria-hidden />
              Earnings
            </m.span>
          )}
        </NavLink>
      </div>
    </nav>
  );
}
