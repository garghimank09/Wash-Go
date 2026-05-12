import { Link, NavLink } from 'react-router-dom';

import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Button } from './Button';

function ThemeToggle() {
  const { mode, setMode } = useTheme();
  const cycle = () => {
    const order = ['system', 'light', 'dark'];
    const i = order.indexOf(mode);
    setMode(order[(i + 1) % order.length]);
  };
  const label = mode === 'system' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light';
  return (
    <button
      type="button"
      onClick={cycle}
      className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
      title="Theme"
    >
      Theme: {label}
    </button>
  );
}

export function Navbar({ variant = 'marketing', onMenuClick }) {
  const { user, logout } = useAuth();

  if (variant === 'dashboard') {
    return (
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200/80 bg-white/80 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-950/80 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label="Open menu"
            onClick={onMenuClick}
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/dashboard" className="text-lg font-black tracking-tight text-slate-900 dark:text-white">
            Wash<span className="text-cyan-500">Go</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <span className="hidden max-w-[140px] truncate text-sm text-slate-600 sm:inline dark:text-slate-300">
            {user?.full_name}
          </span>
          <Button variant="outline" size="sm" onClick={logout}>
            Log out
          </Button>
        </div>
      </header>
    );
  }

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/60 bg-white/75 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-950/75">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
          Wash<span className="text-cyan-500">Go</span>
        </Link>
        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex dark:text-slate-300">
          <a href="#features" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
            Features
          </a>
          <a href="#plans" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
            Plans
          </a>
          <a href="#ai" className="transition hover:text-cyan-600 dark:hover:text-cyan-400">
            AI
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
                  `rounded-lg px-3 py-2 text-sm font-semibold ${isActive ? 'text-cyan-600' : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'}`
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
