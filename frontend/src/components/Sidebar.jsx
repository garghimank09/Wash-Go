import { Link, NavLink } from 'react-router-dom';
import { Calendar, Car, LayoutDashboard, Shield, Sparkles } from 'lucide-react';
import { m } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import { canAccessAdmin } from '../lib/canAccessAdmin';
import { useReducedMotion } from '../lib/useReducedMotion';
import { cn } from '../lib/cn';

const links = [
  { to: '/dashboard', label: 'Dashboard', end: true, Icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', Icon: Calendar },
  { to: '/cars', label: 'My garage', Icon: Car },
  { to: '/booking', label: 'New wash', Icon: Sparkles },
];

export function Sidebar({ mobileOpen, onNavigate }) {
  const { user } = useAuth();
  const showAdminEntry = canAccessAdmin(user);
  const reduced = useReducedMotion();

  const base =
    'fixed inset-y-0 left-0 z-40 w-[min(100%,280px)] transform border-r border-white/20 wg-glass-surface shadow-xl transition-transform duration-300 dark:border-white/10 md:static md:z-0 md:w-64 md:translate-x-0 md:shadow-none';
  const open = mobileOpen ? 'translate-x-0' : '-translate-x-full';

  return (
    <aside className={cn(base, open, 'md:flex md:flex-col')}>
      <div className="flex h-16 items-center border-b border-wg-border px-5 md:hidden">
        <span className="text-lg font-black text-wg-text">Menu</span>
      </div>
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
        <p className="mb-1 px-4 text-[10px] font-bold uppercase tracking-[0.12em] text-wg-muted">Your garage</p>
        {links.map(({ to, label, end, Icon }) => (
          <m.div key={to} whileHover={reduced ? undefined : { x: 2 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
            <NavLink
              to={to}
              end={end}
              onClick={onNavigate}
              className={({ isActive }) =>
                cn(
                  'flex min-h-[44px] items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition wg-focus-ring',
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-600/15 text-cyan-700 shadow-sm dark:text-cyan-300'
                    : 'text-wg-muted hover:bg-wg-surface/90 hover:text-wg-text',
                )
              }
            >
              <Icon className="size-5 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
              {label}
            </NavLink>
          </m.div>
        ))}

        {showAdminEntry ? (
          <m.div
            className="mt-4 px-1"
            initial={reduced ? false : { opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to="/admin"
              onClick={onNavigate}
              className={cn(
                'flex min-h-[44px] items-center gap-3 rounded-xl border border-indigo-500/20 bg-indigo-500/[0.06] px-4 py-2.5 text-sm font-semibold text-indigo-800 transition wg-focus-ring',
                'hover:border-indigo-500/35 hover:bg-indigo-500/10 dark:border-indigo-500/15 dark:text-indigo-100 dark:hover:bg-indigo-500/15',
              )}
            >
              <Shield className="size-4 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
              <span className="min-w-0 flex-1 truncate">Admin console</span>
              <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-600/80 dark:text-indigo-200/90">
                Open
              </span>
            </Link>
          </m.div>
        ) : null}
      </nav>
      <div className="border-t border-wg-border p-4 text-xs text-wg-muted">
        Tip: use the floating chat for quick help while you navigate.
      </div>
    </aside>
  );
}
