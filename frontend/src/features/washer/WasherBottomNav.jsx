import { NavLink } from 'react-router-dom';
import { m } from 'framer-motion';

import { usePartnerOfferBadge } from '../../hooks/usePartnerOfferBadge';
import { cn } from '../../lib/cn';
import { WASHER_PARTNER_NAV } from './washerPartnerNav';

const linkBase =
  'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[9px] font-bold uppercase tracking-wide transition wg-focus-ring active:scale-[0.96] sm:gap-1 sm:py-2.5 sm:text-[10px]';
const active =
  'text-cyan-800 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] ring-1 ring-cyan-500/25 bg-gradient-to-b from-cyan-500/15 to-cyan-500/[0.04] dark:text-cyan-100 dark:from-cyan-500/20 dark:to-transparent';
const idle = 'text-wg-muted hover:text-wg-text';

/** Mobile-only bottom nav — desktop uses {@link WasherSidebar}. */
export function WasherBottomNav() {
  const badge = usePartnerOfferBadge();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 border-t border-wg-border/90 bg-wg-surface-elevated/98 px-2 pb-[max(0.65rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_32px_-8px_rgb(15_23_42/0.18)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/92 dark:shadow-[0_-12px_40px_-8px_rgb(0_0_0/0.45)] md:hidden"
      aria-label="Partner navigation"
    >
      <div className="mx-auto flex w-full max-w-xl items-stretch justify-between gap-0.5 sm:gap-1.5">
        {WASHER_PARTNER_NAV.map(({ to, label, end, Icon, badgeKey }) => (
          <NavLink key={to} to={to} end={end} className={({ isActive }) => cn(linkBase, isActive ? active : idle)}>
            {({ isActive }) => (
              <m.span className="flex flex-col items-center gap-1" whileTap={{ scale: 0.94 }}>
                <span className="relative">
                  <Icon
                    className={cn('size-5', isActive && 'text-cyan-600 dark:text-cyan-300')}
                    strokeWidth={isActive ? 2.25 : 1.75}
                    aria-hidden
                  />
                  {badgeKey === 'offers' && badge > 0 ? (
                    <m.span
                      className="absolute -right-2 -top-1 flex min-w-[1rem] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 px-1 text-[9px] font-black leading-none text-white shadow-md ring-2 ring-white/35 dark:ring-slate-950/80"
                      animate={{ scale: [1, 1.04, 1] }}
                      transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    >
                      {badge > 9 ? '9+' : badge}
                    </m.span>
                  ) : null}
                </span>
                {label}
              </m.span>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
