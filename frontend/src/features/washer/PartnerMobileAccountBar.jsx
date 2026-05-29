import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

import { usePartnerAuth } from '../../context/PartnerAuthContext';

/** Profile + logout on mobile (sidebar is desktop-only). */
export function PartnerMobileAccountBar() {
  const { user, logoutPartner } = usePartnerAuth();
  if (!user) return null;

  return (
    <div className="fixed bottom-[calc(4.25rem+env(safe-area-inset-bottom))] left-0 right-0 z-30 border-t border-wg-border/80 bg-wg-surface-elevated px-4 py-2 md:hidden dark:border-white/10 dark:bg-slate-950">
      <div className="mx-auto flex max-w-xl items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-wg-text">{user.full_name}</p>
          <p className="text-[11px] text-wg-muted">Partner</p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Link
            to="/partner/profile"
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-wg-text hover:bg-wg-surface/80"
          >
            <User className="size-4 text-wg-muted" strokeWidth={1.75} aria-hidden />
            Profile
          </Link>
          <button
            type="button"
            onClick={() => logoutPartner()}
            className="inline-flex min-h-[40px] items-center gap-1.5 rounded-xl px-3 text-sm font-semibold text-wg-text hover:bg-wg-surface/80"
          >
            <LogOut className="size-4 text-wg-muted" strokeWidth={1.75} aria-hidden />
            Log out
          </button>
        </div>
      </div>
    </div>
  );
}
