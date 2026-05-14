import { NavLink } from 'react-router-dom';
import { m } from 'framer-motion';
import {
  BarChart3,
  ClipboardList,
  Coins,
  LayoutGrid,
  MessageSquareWarning,
  PieChart,
  Users,
} from 'lucide-react';

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

  const base = cn(
    'fixed inset-y-0 left-0 z-40 flex w-[min(100%,288px)] flex-col border-r transition-transform duration-300 md:static md:translate-x-0',
    'border-indigo-200/30 bg-gradient-to-b from-slate-50/95 via-wg-surface-elevated/98 to-indigo-50/40 shadow-xl backdrop-blur-2xl',
    'dark:border-indigo-500/10 dark:from-slate-950/95 dark:via-slate-950/90 dark:to-indigo-950/30 dark:shadow-black/40',
    'md:w-72 md:shadow-none',
  );
  const open = mobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <aside className={cn(base, open, 'md:flex')}>
      <div className="flex h-[4.25rem] items-center border-b border-indigo-200/30 px-5 dark:border-indigo-500/10 md:px-6">
        <div className="flex items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-lg shadow-indigo-500/25">
            <BarChart3 className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-indigo-700 dark:text-indigo-300">Console</p>
            <p className="text-sm font-black text-wg-text">Operations</p>
          </div>
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-5 overflow-y-auto p-3 md:p-4">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-wg-muted">{group.label}</p>
            <div className="flex flex-col gap-1">
              {group.items.map(({ to, label, end, Icon }) => (
                <m.div key={to} whileHover={reduced ? undefined : { x: 3 }} transition={{ type: 'spring', stiffness: 400, damping: 28 }}>
                  <NavLink to={to} end={end} onClick={onNavigate}>
                    {({ isActive }) => (
                      <span
                        className={cn(
                          'relative flex min-h-[44px] items-center gap-3 rounded-xl border border-transparent px-3 py-2.5 text-sm font-semibold transition-all wg-focus-ring',
                          isActive
                            ? 'border-indigo-300/40 bg-gradient-to-r from-indigo-600/16 via-cyan-600/10 to-transparent text-indigo-950 shadow-md dark:border-indigo-500/20 dark:from-indigo-500/22 dark:via-cyan-500/12 dark:text-indigo-50'
                            : 'text-wg-muted hover:border-indigo-200/50 hover:bg-indigo-500/[0.06] hover:text-wg-text dark:hover:border-indigo-500/15 dark:hover:bg-indigo-400/10',
                          isActive && 'ring-1 ring-indigo-400/20 dark:ring-indigo-400/15',
                        )}
                      >
                        {isActive ? (
                          <span
                            className="absolute bottom-2 left-1 top-2 w-1 rounded-full bg-gradient-to-b from-cyan-400 to-indigo-600 shadow-[0_0_12px_rgba(99,102,241,0.45)]"
                            aria-hidden
                          />
                        ) : null}
                        <Icon
                          className={cn('relative z-[1] size-5 shrink-0', isActive ? 'text-indigo-700 dark:text-cyan-200' : 'opacity-85')}
                          strokeWidth={1.75}
                          aria-hidden
                        />
                        <span className="relative z-[1]">{label}</span>
                      </span>
                    )}
                  </NavLink>
                </m.div>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-indigo-200/25 p-4 text-xs leading-relaxed text-wg-muted dark:border-indigo-500/10">
        Enterprise controls — mock data until admin APIs are connected.
      </div>
    </aside>
  );
}
