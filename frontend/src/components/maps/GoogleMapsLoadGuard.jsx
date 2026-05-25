import { APILoadingStatus, useApiLoadingStatus } from '@vis.gl/react-google-maps';
import { Loader2 } from 'lucide-react';

import { cn } from '../../lib/cn';

/**
 * Shows loading / auth errors inside APIProvider (must be a child of APIProvider).
 */
export function GoogleMapsLoadGuard({ children, className }) {
  const status = useApiLoadingStatus();

  if (status === APILoadingStatus.LOADING || status === APILoadingStatus.NOT_LOADED) {
    return (
      <div
        className={cn(
          'flex h-52 items-center justify-center rounded-2xl border border-wg-border/80 bg-wg-surface-elevated/60 text-sm text-wg-muted',
          className,
        )}
      >
        <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
        Loading Google Maps…
      </div>
    );
  }

  if (status === APILoadingStatus.AUTH_FAILURE || status === APILoadingStatus.FAILED) {
    return (
      <div
        className={cn(
          'rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4 text-sm leading-relaxed text-amber-950 dark:text-amber-100',
          className,
        )}
        role="alert"
      >
        <p className="font-semibold">Google Maps could not load</p>
        <p className="mt-2 text-xs opacity-90">
          Billing is enabled — also check: <strong>Maps JavaScript API</strong> and{' '}
          <strong>Places API</strong> are enabled, your browser key allows{' '}
          <code className="rounded bg-black/10 px-1 dark:bg-white/10">http://localhost:5173/*</code>, and{' '}
          <code className="rounded bg-black/10 px-1 dark:bg-white/10">VITE_GOOGLE_MAPS_API_KEY</code> in{' '}
          <code className="rounded bg-black/10 px-1 dark:bg-white/10">frontend/.env</code> matches that key.
          Open DevTools → Console for the exact Google error, then hard-refresh (Ctrl+Shift+R).
        </p>
      </div>
    );
  }

  return children;
}
