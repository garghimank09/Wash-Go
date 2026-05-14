import { cn } from '../lib/cn';

/**
 * Consistent max-width, vertical rhythm, and optional page enter animation hook target.
 */
export function PageShell({ children, className, maxWidth = '6xl', ...rest }) {
  const max =
    maxWidth === 'wide'
      ? 'max-w-[min(100%,96rem)]'
      : maxWidth === '7xl'
        ? 'max-w-7xl'
        : 'max-w-6xl';
  return (
    <div className={cn('mx-auto w-full space-y-8', max, className)} {...rest}>
      {children}
    </div>
  );
}
