import { Outlet, useLocation } from 'react-router-dom';

import { PartnerBookingSyncBridge } from '../components/BookingSyncBridge';
import { useWasherAvailability } from '../hooks/useWasherAvailability';
import { WasherBottomNav } from '../features/washer/WasherBottomNav';
import { WasherLiveActivityLayer } from '../features/washer/WasherLiveActivityLayer';
import { WasherPartnerSyncBar } from '../features/washer/WasherPartnerSyncBar';
import { WasherSidebar } from '../features/washer/WasherSidebar';
import { WasherTopBar } from '../features/washer/WasherTopBar';
import { railMainOffset } from '../lib/collapsibleRailSidebar';
import { PageShell } from './PageShell';
import { cn } from '../lib/cn';

/** Partner shell: sidebar + wide content on desktop; bottom nav on small screens. */
export function WasherLayout() {
  const av = useWasherAvailability();
  const location = useLocation();
  const isJobDetail = /\/partner\/jobs\/.+/.test(location.pathname);

  return (
    <div
      className={cn(
        'flex min-h-dvh bg-wg-surface',
        'bg-[length:100%_420px] bg-no-repeat dark:bg-slate-950',
      )}
      style={{
        backgroundImage:
          'var(--wg-mesh), radial-gradient(ellipse 120% 80% at 50% -10%, rgb(6 182 212 / 0.08), transparent 55%)',
      }}
    >
      <PartnerBookingSyncBridge />
      <WasherSidebar />
      <div className={cn('flex min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-out', railMainOffset())}>
        <WasherTopBar av={av} />
        <WasherPartnerSyncBar online={av.online} />
        <WasherLiveActivityLayer online={av.online} />
        <main
          className={cn(
            'mx-auto w-full flex-1 px-4 pt-2 md:px-8 md:pt-4',
            isJobDetail ? 'pb-48 md:pb-28' : 'pb-32 md:pb-8',
          )}
        >
          <PageShell maxWidth="wide" className="space-y-6 md:space-y-8">
            <Outlet context={av} />
          </PageShell>
        </main>
        <WasherBottomNav />
      </div>
    </div>
  );
}
