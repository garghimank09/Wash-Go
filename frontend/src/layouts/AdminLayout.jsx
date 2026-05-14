import { useState } from 'react';

import { AdminHeader } from '../components/AdminHeader';
import { AdminSidebar } from '../components/AdminSidebar';
import { AssistantDock } from '../components/AssistantDock';
import { PageShell } from './PageShell';
import { PageTransition } from './PageTransition';

export function AdminLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="relative flex min-h-dvh bg-wg-surface">
      <div
        className="pointer-events-none absolute inset-0 opacity-70 dark:opacity-100"
        style={{ background: 'var(--wg-mesh)' }}
        aria-hidden
      />
      {mobileMenu ? (
        <button
          type="button"
          className="fixed inset-0 z-30 bg-slate-950/60 backdrop-blur-sm md:hidden"
          aria-label="Close admin menu"
          onClick={() => setMobileMenu(false)}
        />
      ) : null}
      <AdminSidebar mobileOpen={mobileMenu} onNavigate={() => setMobileMenu(false)} />
      <div className="relative flex min-w-0 flex-1 flex-col">
        <AdminHeader onMenuClick={() => setMobileMenu((v) => !v)} />
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <PageShell maxWidth="wide" className="space-y-5 md:space-y-6">
            <PageTransition />
          </PageShell>
        </main>
        <AssistantDock />
      </div>
    </div>
  );
}
