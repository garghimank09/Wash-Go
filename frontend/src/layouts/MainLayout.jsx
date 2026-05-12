import { useState } from 'react';
import { Outlet } from 'react-router-dom';

import { AssistantDock } from '../components/AssistantDock';
import { Navbar } from '../components/Navbar';
import { Sidebar } from '../components/Sidebar';

export function MainLayout() {
  const [mobileMenu, setMobileMenu] = useState(false);

  return (
    <div className="flex min-h-dvh bg-slate-50 dark:bg-slate-950">
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
          <div className="mx-auto max-w-6xl wg-fade-up">
            <Outlet />
          </div>
        </main>
        <AssistantDock />
      </div>
    </div>
  );
}
