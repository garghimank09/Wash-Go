import { Laptop, Moon, Sun } from 'lucide-react';

import { useTheme } from '../context/ThemeContext';
import { cn } from '../lib/cn';

export function ThemeToggle({ className }) {
  const { mode, setMode } = useTheme();
  const cycle = () => {
    const order = ['system', 'light', 'dark'];
    const i = order.indexOf(mode);
    setMode(order[(i + 1) % order.length]);
  };
  const Icon = mode === 'system' ? Laptop : mode === 'dark' ? Moon : Sun;
  const label = mode === 'system' ? 'Auto' : mode === 'dark' ? 'Dark' : 'Light';
  return (
    <button
      type="button"
      onClick={cycle}
      className={cn(
        'inline-flex items-center gap-2 rounded-xl border border-wg-border bg-wg-surface-elevated/80 px-3 py-2 text-xs font-semibold text-wg-text shadow-sm transition hover:border-cyan-500/30 hover:bg-wg-surface-elevated dark:hover:border-cyan-500/20',
        'wg-focus-ring',
        className,
      )}
      title={`Theme: ${label}`}
    >
      <Icon className="size-4 shrink-0 text-cyan-600 dark:text-cyan-400" strokeWidth={1.75} aria-hidden />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}
