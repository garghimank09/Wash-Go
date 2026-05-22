import { NavLink } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  BarChart3,
  ClipboardList,
  Coins,
  CreditCard,
  LayoutGrid,
  MessageSquareWarning,
  PieChart,
  Sparkles,
  Users,
} from 'lucide-react';

import {
  expandOnHover,
  railAsideClass,
  RAIL_BRAND_ROW,
  RAIL_FOOTER,
  RAIL_LINK,
  RAIL_NAV_PAD,
} from '../lib/collapsibleRailSidebar';
import { useReducedMotion } from '../lib/useReducedMotion';
import { cn } from '../lib/cn';

const GROUPS = [
  {
    label: 'Insights',
    items: [
      { to: '/admin', label: 'Analytics', end: true, Icon: PieChart },
      { to: '/admin/revenue', label: 'Revenue', Icon: Coins },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/admin/operations', label: 'Operations hub', Icon: LayoutGrid },
      { to: '/admin/bookings', label: 'Booking management', Icon: ClipboardList },
      { to: '/admin/wash-tiers', label: 'Wash tiers', Icon: Sparkles },
      { to: '/admin/membership-plans', label: 'Membership plans', Icon: CreditCard },
      { to: '/admin/complaints', label: 'Complaints', Icon: MessageSquareWarning },
    ],
  },
  {
    label: 'Directory',
    items: [{ to: '/admin/users', label: 'Directory', Icon: Users }],
  },
];

export function AdminSidebar({ mobileOpen, onNavigate }) {
  const reduced = useReducedMotion();

  return (
    <aside
      className={railAsideClass({
        mobileOpen,
        expandedWidth: 'md:[@media(hover:hover)_and_(pointer:fine)]:hover:w-72',
        surfaceClass:
          'border-indigo-200/30 bg-gradient-to-b from-slate-50/95 via-wg-surface-elevated/98 to-indigo-50/40 backdrop-blur-2xl dark:border-indigo-500/10 dark:from-slate-950/95 dark:via-slate-950/90 dark:to-indigo-950/30',
      })}
    >
      <div
        className={cn(
          'flex h-[4.25rem] shrink-0 items-center border-b border-indigo-200/30 dark:border-indigo-500/10',
          RAIL_BRAND_ROW,
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
            <BarChart3 className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className={expandOnHover()}>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">
              Console
            </p>
            <p className="text-sm font-black text-wg-text">Operations</p>
          </div>
        </div>
      </div>

      <nav className={cn('flex flex-1 flex-col gap-5 overflow-x-hidden overflow-y-auto p-3', RAIL_NAV_PAD)}>
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className={cn('mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-wg-muted', expandOnHover())}>
              {group.label}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map(({ to, label, end, Icon }) => (
                <m.div
                  key={to}
                  className="md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:motion-safe:[&]:hover:translate-x-0"
                  whileHover={reduced ? undefined : { x: 3 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                >
                  <NavLink to={to} end={end} onClick={onNavigate} aria-label={label}>
                    {({ isActive }) => (
                      <span
                        className={cn(
                          RAIL_LINK.base,
                          isActive
                            ? 'border-indigo-300/40 bg-gradient-to-r from-indigo-600/16 via-cyan-600/10 to-transparent text-indigo-950 shadow-md dark:border-indigo-500/20 dark:from-indigo-500/22 dark:via-cyan-500/12 dark:text-indigo-50'
                            : 'text-wg-muted hover:border-indigo-200/50 hover:bg-indigo-500/[0.06] hover:text-wg-text dark:hover:border-indigo-500/15 dark:hover:bg-indigo-400/10',
                          isActive && 'ring-1 ring-indigo-400/20 dark:ring-indigo-400/15',
                          isActive && 'md:ring-2 md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:ring-1',
                        )}
                      >
                        {isActive ? <span className={RAIL_LINK.activeBar} aria-hidden /> : null}
                        <Icon
                          className={cn(
                            'relative z-[1] size-5 shrink-0',
                            isActive ? 'text-indigo-700 dark:text-cyan-200' : 'opacity-85',
                          )}
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <span className={cn('relative z-[1]', expandOnHover())}>{label}</span>
                      </span>
                    )}
                  </NavLink>
                </m.div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={cn(
          RAIL_FOOTER,
          'border-t border-indigo-200/25 p-4 text-xs leading-relaxed text-wg-muted dark:border-indigo-500/10',
          expandOnHover(),
        )}
      >
        Enterprise controls — live bookings, fleet, and analytics sync.
      </div>
    </aside>
  );
}
