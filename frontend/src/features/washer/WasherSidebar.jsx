import { NavLink } from 'react-router-dom';
import { m } from 'framer-motion';

import { usePartnerOfferBadge } from '../../hooks/usePartnerOfferBadge';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';
import { WASHER_PARTNER_NAV } from './washerPartnerNav';

const linkBase =
  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition wg-focus-ring';
const active =
  'bg-gradient-to-r from-cyan-500/15 to-cyan-500/[0.04] text-cyan-800 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] ring-1 ring-cyan-500/25 dark:text-cyan-100';
const idle = 'text-wg-muted hover:bg-white/[0.04] hover:text-wg-text dark:hover:bg-white/[0.06]';

/** Desktop partner navigation — same routes as bottom nav. */
export function WasherSidebar() {
  const badge = usePartnerOfferBadge();
  const reduced = useReducedMotion();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r border-white/20 bg-[color:var(--wg-glass-bg)]/80 backdrop-blur-xl dark:border-white/10 md:flex">
      <m.div className="border-b border-wg-border/80 px-5 py-5 dark:border-white/10">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-wg-muted">WashGo</p>
        <p className="text-lg font-black tracking-tight text-wg-text">
          Pro <span className="text-cyan-500">Partner</span>
        </p>
      </m.div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3" aria-label="Partner navigation">
        <p className="mb-1 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-wg-muted">Operations</p>
        {WASHER_PARTNER_NAV.map(({ to, label, end, Icon, badgeKey }) => (
          <m.div
            key={to}
            whileHover={reduced ? undefined : { x: 2 }}
            transition={{ type: 'spring', stiffness: 420, damping: 30 }}
          >
            <NavLink to={to} end={end} className={({ isActive }) => cn(linkBase, isActive ? active : idle)}>
              {({ isActive }) => (
                <>
                  <span className="relative flex shrink-0">
                    <Icon
                      className={cn('size-5', isActive && 'text-cyan-600 dark:text-cyan-300')}
                      strokeWidth={isActive ? 2.25 : 1.75}
                      aria-hidden
                    />
                    {badgeKey === 'offers' && badge > 0 ? (
                      <span className="absolute -right-2 -top-1 flex min-w-[1rem] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 px-1 text-[9px] font-black leading-none text-white shadow-md ring-2 ring-white/35 dark:ring-slate-950/80">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    ) : null}
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </m.div>
        ))}
      </nav>
    </aside>
  );
}
