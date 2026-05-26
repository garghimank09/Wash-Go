import { useState } from 'react';

import { AssistantDock } from '../components/AssistantDock';
import { CustomerBookingSyncBridge } from '../components/BookingSyncBridge';
import { WashTiersProvider } from '../context/WashTiersContext';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
import { railMainOffset } from '../lib/collapsibleRailSidebar';
import { cn } from '../lib/cn';
import { PageShell } from './PageShell';
import { PageTransition } from './PageTransition';

export function MainLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="flex min-h-dvh bg-wg-surface">
      <CustomerBookingSyncBridge />
      {mobileMenu ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
        />
      ) : null}
      <Sidebar mobileOpen={mobileMenu} onNavigate={() => setMobileMenu(false)} />
      <div
        className={cn(
          'relative flex min-w-0 flex-1 flex-col transition-[padding] duration-200 ease-out',
          railMainOffset(),
        )}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-35 dark:opacity-50"
          style={{ background: 'var(--wg-mesh)' }}
          aria-hidden
        />
        <Navbar variant="dashboard" onMenuClick={() => setMobileMenu((v) => !v)} />
        <main className="relative flex-1 p-4 md:p-8">
          <WashTiersProvider>
            <PageShell>
              <PageTransition />
            </PageShell>
          </WashTiersProvider>
        </main>
        <AssistantDock />
      </div>
    </div>
  );
}
