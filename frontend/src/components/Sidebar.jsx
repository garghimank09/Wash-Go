import { NavLink } from 'react-router-dom';
import { Calendar, Car, LayoutDashboard, Sparkles } from 'lucide-react';
import { m } from 'framer-motion';

import { SidebarAccountFooter } from './SidebarAccountFooter';
import { useAuth } from '../context/AuthContext';
import {
  expandOnHover,
  railAsideClass,
  RAIL_BRAND_ROW,
  RAIL_LINK,
  RAIL_NAV_PAD,
} from '../lib/collapsibleRailSidebar';
import { useReducedMotion } from '../lib/useReducedMotion';
import { cn } from '../lib/cn';

const mainLinks = [
  { to: '/dashboard', label: 'Dashboard', end: true, Icon: LayoutDashboard },
  { to: '/bookings', label: 'Bookings', Icon: Calendar },
  { to: '/cars', label: 'My garage', Icon: Car },
  { to: '/booking', label: 'New wash', Icon: Sparkles },
];

function SidebarNavItem({ to, label, end, Icon, onNavigate, reduced }) {
  return (
    <m.div whileHover={reduced ? undefined : { x: 2 }} transition={{ type: 'spring', stiffness: 420, damping: 30 }}>
      <NavLink
        to={to}
        end={end}
        onClick={onNavigate}
        aria-label={label}
        className={({ isActive }) =>
          cn(
            RAIL_LINK.base,
            isActive
              ? 'bg-gradient-to-r from-cyan-500/15 to-indigo-600/15 text-cyan-700 shadow-sm ring-1 ring-cyan-400/20 dark:text-cyan-300'
              : 'text-wg-muted hover:bg-wg-surface/90 hover:text-wg-text',
            isActive && 'md:ring-2 md:[@media(hover:hover)_and_(pointer:fine)]:group-hover/sidebar:ring-1',
          )
        }
      >
        <Icon className="size-5 shrink-0 opacity-90" strokeWidth={1.75} aria-hidden />
        <span className={expandOnHover()}>{label}</span>
      </NavLink>
    </m.div>
  );
}

export function Sidebar({ mobileOpen, onNavigate }) {
  const reduced = useReducedMotion();
  const { user, logout } = useAuth();

  return (
    <aside
      className={railAsideClass({
        mobileOpen,
        surfaceClass:
          'flex flex-col border-wg-border/80 wg-glass-surface backdrop-blur-2xl dark:border-white/10',
      })}
    >
      <div className={cn('flex h-16 shrink-0 items-center border-b border-wg-border', RAIL_BRAND_ROW)}>
        <div className="flex min-w-0 items-center gap-2">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand-from to-brand-to text-white shadow-lg shadow-cyan-500/25">
            <Sparkles className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div className={expandOnHover()}>
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-wg-muted">WashGo</p>
            <p className="text-sm font-black text-wg-text">Customer</p>
          </div>
        </div>
      </div>

      <nav
        className={cn('flex min-h-0 flex-1 flex-col gap-1 overflow-x-hidden overflow-y-auto p-3', RAIL_NAV_PAD)}
        aria-label="Customer navigation"
      >
        <p className={cn('mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.12em] text-wg-muted', expandOnHover())}>
          Your garage
        </p>
        {mainLinks.map((link) => (
          <SidebarNavItem key={link.to} {...link} onNavigate={onNavigate} reduced={reduced} />
        ))}
      </nav>

      <SidebarAccountFooter
        user={user}
        profileTo="/profile"
        roleLabel={user?.role === 'admin' ? 'Admin' : 'Member'}
        onLogout={logout}
        onNavigate={onNavigate}
      />
    </aside>
  );
}
