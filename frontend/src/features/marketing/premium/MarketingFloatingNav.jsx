import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

import { useAuth } from '../../../context/AuthContext';
import { Button } from '../../../ui/button';
import { ThemeToggle } from '../../../components/ThemeToggle';
import { cn } from '../../../lib/cn';
import { NAV_LINKS } from './premiumContent';

export function MarketingFloatingNav() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-50 flex flex-col items-center px-4 pt-4 sm:px-6">
      <header className="wg-premium-nav pointer-events-auto flex w-full max-w-6xl items-center justify-between gap-3 rounded-2xl border border-white/40 bg-white/70 px-4 py-2.5 shadow-[0_8px_40px_rgb(15_23_42/0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/65 sm:px-5">
        <Link to="/" className="text-lg font-black tracking-tight text-wg-text">
          Wash<span className="bg-gradient-to-r from-cyan-500 to-indigo-500 bg-clip-text text-transparent">Go</span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {NAV_LINKS.map((item) =>
            item.route ? (
              <Link
                key={item.label}
                to={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-wg-muted transition hover:bg-white/60 hover:text-wg-text dark:hover:bg-white/5"
              >
                {item.label}
              </Link>
            ) : (
              <a
                key={item.label}
                href={item.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-wg-muted transition hover:bg-white/60 hover:text-wg-text dark:hover:bg-white/5"
              >
                {item.label}
              </a>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard" className="hidden sm:block">
              <Button size="sm">Dashboard</Button>
            </Link>
          ) : (
            <>
              <NavLink
                to="/login"
                className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-wg-muted transition hover:text-wg-text sm:block"
              >
                Log in
              </NavLink>
              <Link to="/signup" className="hidden sm:block">
                <Button size="sm" className="wg-premium-cta">
                  Book a wash
                </Button>
              </Link>
            </>
          )}
          <button
            type="button"
            className="flex size-10 items-center justify-center rounded-xl text-wg-muted lg:hidden wg-focus-ring"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </header>

      {open ? (
        <div className="wg-premium-nav pointer-events-auto mt-2 w-full max-w-6xl rounded-2xl border border-white/40 bg-white/90 p-4 shadow-xl backdrop-blur-2xl dark:border-white/10 dark:bg-slate-950/90 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((item) =>
              item.route ? (
                <Link
                  key={item.label}
                  to={item.href}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-wg-text"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ) : (
                <a
                  key={item.label}
                  href={item.href}
                  className="rounded-xl px-3 py-3 text-sm font-semibold text-wg-text"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </a>
              ),
            )}
          </nav>
          <div className="mt-4 flex flex-col gap-2 border-t border-wg-border/60 pt-4">
            {user ? (
              <Link to="/dashboard" onClick={() => setOpen(false)}>
                <Button className="w-full">Dashboard</Button>
              </Link>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Log in
                  </Button>
                </Link>
                <Link to="/signup" onClick={() => setOpen(false)}>
                  <Button className="wg-premium-cta w-full">Book a wash</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
