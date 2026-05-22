import { Link } from 'react-router-dom';
import { LogOut, Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';

import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { NotificationBell } from '../../components/NotificationBell';
import { WasherTrustCompactBar } from '../../features/washer/WasherTrustCompactBar';
import { partnerNotificationsService } from '../../services/notificationsService';
import { Button } from '../../ui/button';
import { cn } from '../../lib/cn';

export function WasherTopBar({ av }) {
  const { user, logoutPartner } = usePartnerAuth();

  return (
    <header className="relative sticky top-0 z-30 border-b border-white/15 bg-[color:var(--wg-glass-bg)]/95 px-4 py-3 shadow-sm backdrop-blur-2xl dark:border-white/10">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent dark:via-cyan-300/35"
        aria-hidden
      />
      <div className="mx-auto flex w-full items-center justify-between gap-3">
        <Link to="/partner" className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-wg-muted">WashGo</p>
          <p className="truncate text-lg font-black tracking-tight text-wg-text">
            Pro <span className="text-cyan-500">Partner</span>
          </p>
        </Link>
        <div className="flex shrink-0 items-center gap-2">
          <NotificationBell service={partnerNotificationsService} defaultPath="/partner/requests" />
          <button
            type="button"
            onClick={() => av.setOnline(!av.online)}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition wg-focus-ring',
              av.online
                ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-800 dark:text-emerald-100'
                : 'border-wg-border bg-wg-surface/80 text-wg-muted dark:border-white/10',
            )}
            aria-pressed={av.online}
          >
            {av.online ? <ToggleRight className="size-5" strokeWidth={1.75} aria-hidden /> : <ToggleLeft className="size-5" strokeWidth={1.75} aria-hidden />}
            {av.online ? 'Online' : 'Offline'}
          </button>
          <Button type="button" variant="ghost" size="sm" className="px-2" onClick={() => logoutPartner()} aria-label="Log out">
            <LogOut className="size-4" strokeWidth={1.75} />
          </Button>
        </div>
      </div>
      <div className="mx-auto mt-2 flex w-full flex-wrap items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide ring-1',
            av.workMode === 'accepting' &&
              'bg-emerald-500/15 text-emerald-800 ring-emerald-400/35 dark:text-emerald-100',
            av.workMode === 'busy' && 'bg-amber-500/15 text-amber-900 ring-amber-400/35 dark:text-amber-100',
            av.workMode === 'break' && 'bg-indigo-500/15 text-indigo-900 ring-indigo-400/35 dark:text-indigo-100',
            av.workMode === 'idle' && 'bg-wg-surface/90 text-wg-muted ring-wg-border dark:bg-white/[0.06]',
            av.workMode === 'offline' && 'bg-wg-surface/90 text-wg-muted ring-wg-border dark:bg-white/[0.06]',
          )}
        >
          <Sparkles
            className={cn(
              'size-3',
              av.workMode === 'accepting' && 'text-emerald-600 dark:text-emerald-400',
              av.workMode === 'busy' && 'text-amber-600 dark:text-amber-300',
              av.workMode === 'break' && 'text-indigo-600 dark:text-indigo-300',
              (av.workMode === 'idle' || av.workMode === 'offline') && 'text-cyan-600 dark:text-cyan-400',
            )}
            strokeWidth={2}
            aria-hidden
          />
          {av.summary}
        </span>
        {user?.full_name ? (
          <span className="truncate text-xs font-semibold text-wg-muted">{user.full_name}</span>
        ) : null}
      </div>
      <WasherTrustCompactBar />
    </header>
  );
}
