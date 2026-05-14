import { Outlet, useLocation } from 'react-router-dom';

import { useWasherAvailability } from '../hooks/useWasherAvailability';
import { useLiveDispatchSimulation } from '../hooks/useLiveDispatchSimulation';
import { WasherBottomNav } from '../features/washer/WasherBottomNav';
import { WasherLiveActivityLayer } from '../features/washer/WasherLiveActivityLayer';
import { WasherPartnerSyncBar } from '../features/washer/WasherPartnerSyncBar';
import { WasherTopBar } from '../features/washer/WasherTopBar';
import { cn } from '../lib/cn';

/** Field-ops shell: mobile-first, partner-only navigation (separate from customer MainLayout). */
export function WasherLayout() {
  const av = useWasherAvailability();
  useLiveDispatchSimulation(av.online);
  const location = useLocation();
  const isJobDetail = /\/partner\/jobs\/.+/.test(location.pathname);

  return (
    <div
      className={cn(
        'flex min-h-dvh flex-col bg-wg-surface',
        'bg-[length:100%_420px] bg-no-repeat dark:bg-slate-950',
      )}
      style={{
        backgroundImage:
          'var(--wg-mesh), radial-gradient(ellipse 120% 80% at 50% -10%, rgb(6 182 212 / 0.08), transparent 55%)',
      }}
    >
      <WasherTopBar av={av} />
      <WasherPartnerSyncBar online={av.online} />
      <WasherLiveActivityLayer online={av.online} />
      <main className={cn('mx-auto w-full max-w-lg flex-1 px-4 pt-2', isJobDetail ? 'pb-48' : 'pb-32')}>
        <Outlet context={av} />
      </main>
      <WasherBottomNav />
    </div>
  );
}
