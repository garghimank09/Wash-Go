import { Link } from 'react-router-dom';
import { ArrowLeft, LogOut, Menu, Shield } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { isAdminDemoMode } from '../lib/canAccessAdmin';
import { cn } from '../lib/cn';
import { Button } from '../ui/button';
import { ThemeToggle } from './ThemeToggle';

export function AdminHeader({ onMenuClick }) {
  const { user, logout } = useAuth();
  const demo = isAdminDemoMode(user);
  const roleLabel = user?.role === 'admin' ? 'Administrator' : demo ? 'Demo access' : 'Admin';

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-[4.25rem] items-center justify-between gap-4 border-b px-4 md:px-6',
        'border-indigo-200/40 bg-gradient-to-r from-slate-950/[0.04] via-wg-surface-elevated/95 to-indigo-950/[0.06] shadow-sm backdrop-blur-xl',
        'dark:border-indigo-500/15 dark:from-slate-950/80 dark:via-wg-surface-elevated/90 dark:to-indigo-950/40',
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <button
          type="button"
          className="wg-focus-ring flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-wg-muted transition hover:bg-indigo-500/10 hover:text-wg-text md:hidden"
          aria-label="Open admin menu"
          onClick={onMenuClick}
        >
          <Menu className="size-6 text-indigo-600 dark:text-indigo-300" strokeWidth={2} />
        </button>
        <div className="flex min-w-0 flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin" className="text-lg font-black tracking-tight text-wg-text">
              Wash<span className="text-indigo-500 dark:text-indigo-400">Go</span>
              <span className="ml-2 text-sm font-bold tracking-wide text-wg-muted">Admin</span>
            </Link>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide',
                demo
                  ? 'border-amber-500/40 bg-amber-500/15 text-amber-900 dark:text-amber-100'
                  : 'border-indigo-400/35 bg-indigo-500/12 text-indigo-900 dark:text-indigo-100',
              )}
            >
              <Shield className="size-3" strokeWidth={2} aria-hidden />
              {roleLabel}
            </span>
          </div>
          <span className="truncate text-[11px] font-medium text-wg-muted">
            {user?.full_name}
            {user?.email ? <span className="hidden sm:inline"> · {user.email}</span> : null}
          </span>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <Link
          to="/dashboard"
          className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl border border-wg-border/80 bg-white/40 sm:hidden dark:bg-white/5"
          aria-label="Customer app"
        >
          <ArrowLeft className="size-4" strokeWidth={2} aria-hidden />
        </Link>
        <Link
          to="/dashboard"
          className="hidden items-center gap-1.5 rounded-xl border border-wg-border/80 bg-white/40 px-3 py-2 text-xs font-semibold text-wg-text transition hover:border-indigo-400/40 hover:bg-indigo-500/10 sm:inline-flex dark:bg-white/5"
        >
          <ArrowLeft className="size-3.5" strokeWidth={2} aria-hidden />
          Customer app
        </Link>
        <ThemeToggle className="border-indigo-200/50 dark:border-indigo-500/20" />
        <Button variant="outline" size="sm" className="gap-2 border-indigo-200/60 dark:border-indigo-500/25" onClick={logout}>
          <LogOut className="size-4" strokeWidth={1.75} aria-hidden />
          <span className="hidden sm:inline">Log out</span>
        </Button>
      </div>
    </header>
  );
}
