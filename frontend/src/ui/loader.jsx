import { cn } from '../lib/cn';

export function Loader({ fullScreen, message, className, compact }) {
  const inner = (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      <div
        className="h-10 w-10 animate-spin rounded-full border-2 border-cyan-500/30 border-t-cyan-500"
        role="status"
        aria-label="Loading"
      />
      {message ? <p className="text-sm text-wg-muted">{message}</p> : null}
    </div>
  );
  if (fullScreen) {
    return <div className="flex min-h-dvh items-center justify-center bg-wg-surface">{inner}</div>;
  }
  return <div className={cn('flex justify-center', compact ? 'py-2' : 'py-12', className)}>{inner}</div>;
}
