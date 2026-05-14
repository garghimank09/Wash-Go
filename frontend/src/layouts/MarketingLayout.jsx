import { Outlet } from 'react-router-dom';

import { Navbar } from '../components/Navbar';
import { SiteFooter } from '../components/SiteFooter';

export function MarketingLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-wg-surface">
      <Navbar variant="marketing" />
      <Outlet />
      <SiteFooter />
    </div>
  );
}
