import { Link } from 'react-router-dom';
import { Sparkles, ToggleLeft, ToggleRight } from 'lucide-react';

import { NotificationBell } from '../../components/NotificationBell';
import { PartnerNavMenu } from '../../components/PartnerNavMenu';
import { WasherTrustCompactBar } from '../../features/washer/WasherTrustCompactBar';
import { partnerNotificationsService } from '../../services/notificationsService';
import { cn } from '../../lib/cn';

export function WasherTopBar({ av }) {
  return (
    <header className="relative sticky top-0 z-30 border-b border-wg-border/80 bg-wg-surface-elevated/95 px-4 py-2.5 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-wg-surface-elevated/90">
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-cyan-400/35 to-transparent"
        aria-hidden
      />
      <div className="mx-auto flex w-full flex-wrap items-center justify-between gap-2">
        <Link to="/partner" className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-wg-muted">WashGo</p>
          <p className="truncate text-base font-black tracking-tight text-wg-text sm:text-lg">
            Pro <span className="text-cyan-500">Partner</span>
          </p>
        </Link>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <NotificationBell service={partnerNotificationsService} defaultPath="/partner/requests" />
          <button
            type="button"
            onClick={() => av.setOnline(!av.online)}
            className={cn(
              'flex min-h-[44px] items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition wg-focus-ring',
              av.online ? 'wg-partner-status-online' : 'border-wg-border bg-wg-surface/90 text-wg-muted dark:border-white/15',
            )}
            aria-pressed={av.online}
          >
            {av.online ? <ToggleRight className="size-5" strokeWidth={1.75} aria-hidden /> : <ToggleLeft className="size-5" strokeWidth={1.75} aria-hidden />}
            {av.online ? 'Online' : 'Offline'}
          </button>
          <span
            className={cn(
              'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide',
              av.workMode === 'accepting' && 'wg-partner-status-online',
              av.workMode === 'busy' && 'wg-partner-status-busy',
              av.workMode === 'break' && 'wg-partner-status-break',
              (av.workMode === 'idle' || av.workMode === 'offline') && 'border border-wg-border bg-wg-surface/90 text-wg-muted',
            )}
          >
            <Sparkles className="size-3 shrink-0" strokeWidth={2} aria-hidden />
            {av.summary}
          </span>
          <PartnerNavMenu />
        </div>
      </div>
      <WasherTrustCompactBar className="mx-auto mt-2 w-full" />
    </header>
  );
}
