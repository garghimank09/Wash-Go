import { NavLink } from 'react-router-dom';
import { m } from 'framer-motion';
import { Sparkles } from 'lucide-react';

import { SidebarAccountFooter } from '../../components/SidebarAccountFooter';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { usePartnerOfferBadge } from '../../hooks/usePartnerOfferBadge';
import {
  expandOnHover,
  railAsideClass,
  RAIL_BRAND_ROW,
  RAIL_LINK,
  RAIL_NAV_PAD,
} from '../../lib/collapsibleRailSidebar';
import { useReducedMotion } from '../../lib/useReducedMotion';
import { cn } from '../../lib/cn';
import { WASHER_PARTNER_NAV } from './washerPartnerNav';

const linkIdle = 'text-wg-muted hover:bg-white/[0.04] hover:text-wg-text dark:hover:bg-white/[0.06]';
const linkActive =
  'bg-gradient-to-r from-cyan-500/15 to-cyan-500/[0.04] text-cyan-800 shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] ring-1 ring-cyan-500/25 dark:text-cyan-100';

/** Partner navigation — icon rail on desktop (hover for labels); hidden on mobile (bottom nav). */
export function WasherSidebar() {
  const badge = usePartnerOfferBadge();
  const reduced = useReducedMotion();
  const { user, logoutPartner } = usePartnerAuth();

  return (
    <aside
      className={cn(
        railAsideClass({
          mobileOpen: false,
          surfaceClass:
            'hidden flex-col border-wg-border/80 wg-glass-surface backdrop-blur-xl dark:border-white/10 md:flex',
        }),
        '-translate-x-0 md:translate-x-0',
      )}
    >
      <div
        className={cn(
          'flex h-[4.25rem] shrink-0 items-center border-b border-wg-border/80 py-4 dark:border-white/10',
          RAIL_BRAND_ROW,
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600 text-white shadow-lg shadow-cyan-500/20">
            <Sparkles className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className={expandOnHover()}>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-wg-muted">WashGo</p>
            <p className="text-lg font-black tracking-tight text-wg-text">
              Pro <span className="text-cyan-500">Partner</span>
            </p>
          </div>
        </div>
      </div>

      <nav
        className={cn('flex flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto p-3', RAIL_NAV_PAD)}
        aria-label="Partner navigation"
      >
        <p className={cn('mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-wg-muted', expandOnHover())}>
          Operations
        </p>
        {WASHER_PARTNER_NAV.map(({ to, label, end, Icon, badgeKey }) => (
          <m.div key={to} whileHover={reduced ? undefined : { x: 2 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
            <NavLink
              to={to}
              end={end}
              aria-label={label}
              className={({ isActive }) =>
                cn(
                  RAIL_LINK.base,
                  isActive ? linkActive : linkIdle,
                  isActive && 'md:ring-2 md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:ring-1',
                )
              }
            >
              {({ isActive }) => (
                <>
                  {isActive ? <span className={RAIL_LINK.activeBar} aria-hidden /> : null}
                  <span className="relative flex shrink-0">
                    <Icon
                      className={cn('relative z-[1] size-5', isActive && 'text-cyan-600 dark:text-cyan-300')}
                      strokeWidth={isActive ? 2.25 : 1.75}
                      aria-hidden
                    />
                    {badgeKey === 'offers' && badge > 0 ? (
                      <span className="absolute -right-2 -top-1 flex min-w-[1rem] items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-orange-500 px-1 text-[9px] font-black leading-none text-white shadow-md ring-2 ring-white/35 dark:ring-slate-950/80">
                        {badge > 9 ? '9+' : badge}
                      </span>
                    ) : null}
                  </span>
                  <span className={cn('relative z-[1]', expandOnHover())}>{label}</span>
                </>
              )}
            </NavLink>
          </m.div>
        ))}
      </nav>

      <SidebarAccountFooter
        user={user}
        profileTo="/partner/profile"
        roleLabel="Partner"
        onLogout={logoutPartner}
      />
    </aside>
  );
}
