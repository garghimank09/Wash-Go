import { useState } from 'react';

import { AssistantDock } from '../components/AssistantDock';
import { CustomerBookingSyncBridge } from '../components/BookingSyncBridge';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';
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
      <div className="flex min-w-0 flex-1 flex-col">
        <Navbar variant="dashboard" onMenuClick={() => setMobileMenu((v) => !v)} />
        <main className="flex-1 p-4 md:p-8">
          <PageShell>
            <PageTransition />
          </PageShell>
        </main>
        <AssistantDock />
      </div>
    </div>
  );
}
