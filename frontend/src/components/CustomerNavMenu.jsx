import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, LogOut, User } from 'lucide-react';

import { useAuth } from '../context/AuthContext';
import { mediaUrl } from '../lib/mediaUrl';
import { cn } from '../lib/cn';

export function CustomerNavMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const avatarSrc = mediaUrl(user?.avatar_url);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onClick);
    };
  }, [open]);

  if (!user) return null;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex max-w-[220px] items-center gap-2 rounded-xl border border-wg-border/90 bg-wg-surface-elevated/80 px-2.5 py-1.5 text-left text-sm shadow-sm transition hover:border-cyan-500/35 hover:bg-wg-surface-elevated wg-focus-ring',
          'dark:border-white/10 dark:bg-white/[0.06]',
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-gradient-to-br from-brand-from/20 to-brand-to/15 text-cyan-700 dark:text-cyan-300">
          {avatarSrc ? (
            <img src={avatarSrc} alt="" className="size-full object-cover" />
          ) : (
            <User className="size-4" strokeWidth={1.75} aria-hidden />
          )}
        </span>
        <span className="hidden min-w-0 flex-1 sm:block">
          <span className="block truncate font-semibold text-wg-text">{user.full_name}</span>
          <span className="block truncate text-[11px] text-wg-muted">{user.role === 'admin' ? 'Admin' : 'Member'}</span>
        </span>
        <ChevronDown className={cn('size-4 shrink-0 text-wg-muted transition', open && 'rotate-180')} strokeWidth={2} aria-hidden />
      </button>

      {open ? (
        <div
          className="absolute right-0 top-[calc(100%+0.5rem)] z-50 min-w-[220px] overflow-hidden rounded-2xl border border-wg-border/80 wg-glass-surface py-2 shadow-xl backdrop-blur-xl dark:border-white/10"
          role="menu"
        >
          <div className="border-b border-wg-border/80 px-4 py-3 sm:hidden">
            <p className="truncate font-semibold text-wg-text">{user.full_name}</p>
            <p className="truncate text-xs text-wg-muted">{user.email}</p>
          </div>
          <Link
            to="/profile"
            role="menuitem"
            className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-wg-text transition hover:bg-wg-surface/80 dark:hover:bg-white/[0.06]"
            onClick={() => setOpen(false)}
          >
            <User className="size-4 shrink-0 text-wg-muted" strokeWidth={1.75} aria-hidden />
            Profile
          </Link>
          <button
            type="button"
            role="menuitem"
            className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm font-semibold text-wg-text transition hover:bg-wg-surface/80 dark:hover:bg-white/[0.06]"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            <LogOut className="size-4 shrink-0 text-wg-muted" strokeWidth={1.75} aria-hidden />
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
