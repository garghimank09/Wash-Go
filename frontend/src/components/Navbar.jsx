import { Link, NavLink } from 'react-router-dom';
import { Menu } from 'lucide-react';

import { CustomerNavMenu } from './CustomerNavMenu';
import { useAuth } from '../context/AuthContext';
import { Button } from '../ui/button';
import { cn } from '../lib/cn';
import { ThemeToggle } from './ThemeToggle';

export function Navbar({ variant = 'marketing', onMenuClick }) {
  const { user } = useAuth(); // used in marketing variant

  if (variant === 'dashboard') {
    return (
      <header
        className={cn(
          'sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-wg-border/80 px-4 md:px-6',
          'wg-glass-surface shadow-sm backdrop-blur-xl dark:border-white/10',
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <button
            type="button"
            className="wg-focus-ring flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-wg-muted transition hover:bg-wg-surface/80 hover:text-wg-text md:hidden"
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <Menu className="size-6" strokeWidth={2} />
          </button>
          <div className="flex min-w-0 flex-col">
            <Link to="/dashboard" className="text-lg font-black tracking-tight text-wg-text">
              Wash<span className="text-cyan-500">Go</span>
            </Link>
            <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-wg-muted">Customer</span>
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <CustomerNavMenu />
        </div>
      </header>
    );
  }

  return (
    <header
      className={cn(
        'sticky top-0 z-40 border-b border-white/25 wg-glass-surface shadow-sm shadow-cyan-500/[0.04] dark:border-white/10 dark:shadow-cyan-500/[0.02]',
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-xl font-black tracking-tight text-wg-text">
          Wash<span className="text-cyan-500">Go</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-wg-muted lg:flex">
          <a href="#why-washgo" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
            Why WashGo
          </a>
          <a href="#how-it-works" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
            How it works
          </a>
          <a href="#features" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
            Features
          </a>
          <a href="#experience" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
            Preview
          </a>
          <a href="#plans" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
            Plans
          </a>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user ? (
            <Link to="/dashboard">
              <Button size="sm" variant="primary">
                Dashboard
              </Button>
            </Link>
          ) : (
            <>
              <NavLink
                to="/login"
                className={({ isActive }) =>
                  cn(
                    'rounded-xl px-3 py-2 text-sm font-semibold transition wg-focus-ring',
                    isActive ? 'text-cyan-600 dark:text-cyan-400' : 'text-wg-muted hover:text-wg-text',
                  )
                }
              >
                Log in
              </NavLink>
              <Link to="/signup">
                <Button size="sm" variant="primary">
                  Get started
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
