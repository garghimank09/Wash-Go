import { AlertTriangle, Database } from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';
import { cn } from '../../../lib/cn';
import { isAdminDemoMode } from '../../../lib/canAccessAdmin';

export function AdminDataNotice({ className }) {
  const { user } = useAuth();
  const demo = isAdminDemoMode(user);

  if (demo) {
    return (
      <div
        className={cn(
          'flex items-start gap-3 rounded-2xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:border-amber-400/30 dark:bg-amber-500/10 dark:text-amber-100',
          className,
        )}
        role="status"
      >
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-amber-600 dark:text-amber-300" strokeWidth={1.75} aria-hidden />
        <div>
          <p className="font-bold">Demo admin access</p>
          <p className="mt-1 text-xs font-medium leading-relaxed opacity-90">
            You are not signed in as an admin. This view is enabled because <code className="rounded bg-black/10 px-1 py-0.5 text-[11px] dark:bg-white/10">VITE_ADMIN_UI_DEMO=true</code> and the app is not in production mode. Metrics still load from live booking and fleet APIs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-white/25 bg-wg-surface-elevated/60 px-4 py-3 text-xs text-wg-muted backdrop-blur-sm dark:border-white/10',
        className,
      )}
    >
      <Database className="mt-0.5 size-4 shrink-0 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
      <p className="leading-relaxed">
        <span className="font-semibold text-wg-text">Live sync active.</span> Bookings, fleet roster, dispatch queue, charts, and directory refresh from the API (SSE ~4s). Complaints appear when a dedicated cases API is available.
      </p>
    </div>
  );
}
