import { CalendarDays, History, Home, Inbox, Trophy, Wallet } from 'lucide-react';

/** Shared partner routes — used by mobile bottom nav and desktop sidebar. */
export const WASHER_PARTNER_NAV = [
  { to: '/partner', label: 'Home', end: true, Icon: Home },
  { to: '/partner/requests', label: 'Offers', Icon: Inbox, badgeKey: 'offers' },
  { to: '/partner/schedule', label: 'Schedule', Icon: CalendarDays },
  { to: '/partner/history', label: 'History', Icon: History },
  { to: '/partner/earnings', label: 'Earnings', Icon: Wallet },
  { to: '/partner/rewards', label: 'Rewards', Icon: Trophy },
];
