import { Outlet } from 'react-router-dom';

import { MarketingFloatingNav } from '../features/marketing/premium/MarketingFloatingNav';
import { PremiumFooter } from '../features/marketing/premium/PremiumFooter';

export function MarketingLayout() {
  return (
    <div className="flex min-h-dvh flex-col bg-wg-surface">
      <MarketingFloatingNav />
      <Outlet />
      <PremiumFooter />
    </div>
  );
}
