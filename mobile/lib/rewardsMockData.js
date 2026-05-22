/**
 * Local rewards catalog — UI-only until backend loyalty API exists.
 * Replace with API fetch when available.
 */

export const WASH_POINTS = 2450;

export const REWARD_TIER = {
  id: 'gold',
  label: 'Gold',
  nextTier: 'Platinum',
  pointsToNext: 550,
  progress: 0.82,
  tiers: [
    { id: 'silver', label: 'Silver', min: 0 },
    { id: 'gold', label: 'Gold', min: 1500 },
    { id: 'platinum', label: 'Platinum', min: 3000 },
  ],
};

export const REWARD_BENEFITS = [
  {
    id: 'free_premium',
    title: 'Free premium wash',
    subtitle: 'Redeem 1,800 WashPoints',
    icon: 'auto-awesome',
    accent: 'cyan',
    locked: false,
  },
  {
    id: 'interior',
    title: 'Interior upgrade',
    subtitle: 'Add to any Deluxe booking',
    icon: 'weekend',
    accent: 'violet',
    locked: false,
  },
  {
    id: 'priority',
    title: 'Priority booking',
    subtitle: 'Skip the queue on weekends',
    icon: 'bolt',
    accent: 'amber',
    locked: false,
  },
  {
    id: 'cashback',
    title: '10% cashback',
    subtitle: 'Platinum members only',
    icon: 'savings',
    accent: 'slate',
    locked: true,
  },
];

export const REWARD_ACHIEVEMENTS = [
  {
    id: 'five_washes',
    title: '5 washes completed',
    subtitle: 'Consistency pays off',
    icon: 'emoji-events',
    earned: true,
  },
  {
    id: 'first_premium',
    title: 'First premium booking',
    subtitle: 'Showroom shine unlocked',
    icon: 'diamond',
    earned: true,
  },
  {
    id: 'weekend',
    title: 'Weekend washer',
    subtitle: 'Book 3 weekend slots',
    icon: 'calendar-today',
    earned: false,
    progress: 0.66,
  },
  {
    id: 'eco',
    title: 'Eco-friendly customer',
    subtitle: 'Water-saving wash streak',
    icon: 'eco',
    earned: false,
    progress: 0.35,
  },
];

export const REWARD_PROMOS = [
  {
    id: 'monsoon',
    title: 'Monsoon shine',
    subtitle: '20% off exterior packages',
    badge: 'Seasonal',
    gradient: ['#0e7490', '#06b6d4'],
  },
  {
    id: 'referral',
    title: 'Refer & earn',
    subtitle: '500 pts per friend',
    badge: 'Limited',
    gradient: ['#4f46e5', '#7c3aed'],
  },
  {
    id: 'first_booking',
    title: 'Welcome bonus',
    subtitle: '200 pts on next wash',
    badge: 'New',
    gradient: ['#b45309', '#f59e0b'],
  },
];

export const REFERRAL_COPY = {
  title: 'Invite friends & earn WashPoints',
  subtitle: 'Share your code — both get rewarded when they complete their first wash.',
  cta: 'Share invite link',
  code: 'WASH-GO-VE',
};
