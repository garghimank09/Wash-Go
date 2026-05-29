import { Link } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';

import { mediaUrl } from '../lib/mediaUrl';
import { expandOnHover, RAIL_NAV_PAD } from '../lib/collapsibleRailSidebar';
import { cn } from '../lib/cn';

/**
 * Profile + logout pinned to the bottom of app sidebars (customer, partner, admin).
 */
export function SidebarAccountFooter({
  user,
  profileTo,
  profileLabel = 'Profile',
  roleLabel = 'Member',
  onLogout,
  onNavigate,
  className,
}) {
  if (!user) return null;

  const avatarSrc = mediaUrl(user.avatar_url);

  return (
    <div
      className={cn(
        'mt-auto shrink-0 border-t border-wg-border/80 p-3 dark:border-white/10',
        RAIL_NAV_PAD,
        className,
      )}
    >
      <div className={cn('mb-2 flex items-center gap-2.5 px-1', expandOnHover())}>
        <span className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-from/20 to-brand-to/15 text-cyan-700 dark:text-cyan-300">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="size-full object-cover" />
          ) : (
            <User className="size-4" strokeWidth={1.75} aria-hidden />
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-wg-text">{user.full_name}</p>
          <p className="truncate text-[11px] text-wg-muted">{roleLabel}</p>
        </div>
      </div>
      <div className="flex flex-col gap-0.5">
        {profileTo ? (
          <Link
            to={profileTo}
            onClick={onNavigate}
            className="flex min-h-[44px] items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-wg-text transition hover:bg-wg-surface/90 dark:hover:bg-white/[0.06]"
          >
            <User className="size-4 shrink-0 text-wg-muted" strokeWidth={1.75} aria-hidden />
            <span className={expandOnHover()}>{profileLabel}</span>
          </Link>
        ) : null}
        <button
          type="button"
          onClick={() => {
            onNavigate?.();
            onLogout();
          }}
          className="flex min-h-[44px] w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-wg-text transition hover:bg-wg-surface/90 dark:hover:bg-white/[0.06]"
        >
          <LogOut className="size-4 shrink-0 text-wg-muted" strokeWidth={1.75} aria-hidden />
          <span className={expandOnHover()}>Log out</span>
        </button>
      </div>
    </div>
  );
}
