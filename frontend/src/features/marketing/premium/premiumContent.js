/** Marketing copy + service catalog (Uncle Car Washer structure, WashGo premium voice). */

export const NAV_LINKS = [
  { href: '#features', label: 'Features' },
  { href: '#services', label: 'Services' },
  { href: '#pricing', label: 'Pricing' },
  { href: '#plans', label: 'Membership' },
  { href: '#experience', label: 'Platform' },
  { href: '/partner/signup', label: 'Partner Program', route: true },
];

export const HERO_TRUST = [
  { label: '4.9 rating', sub: '50K+ happy drivers' },
  { label: 'Eco-safe', sub: 'Water-conscious' },
  { label: 'Verified pros', sub: 'Vetted washers' },
  { label: 'Live tracking', sub: 'Uber-style ETA' },
];

export const SERVICE_CATEGORIES = [
  {
    title: 'Exterior wash',
    desc: 'Foam, rinse, and finish — driveway-safe and scratch-conscious.',
    tag: 'Most booked',
  },
  {
    title: 'Interior deep clean',
    desc: 'Vacuum, wipe-down, and cabin refresh for daily drivers.',
    tag: 'Premium',
  },
  {
    title: 'Ceramic coating',
    desc: 'Long-lasting paint protection with showroom gloss.',
    tag: 'Detailing',
  },
  {
    title: 'Full detail',
    desc: 'Inside-out restoration for events, resale, or pride.',
    tag: 'Signature',
  },
];

export const CAR_SEGMENTS = [
  { segment: 'Hatchback', exterior: '₹499', deep: '₹899', ceramic: '₹4,999' },
  { segment: 'Sedan', exterior: '₹599', deep: '₹1,099', ceramic: '₹5,999' },
  { segment: 'SUV / MUV', exterior: '₹799', deep: '₹1,399', ceramic: '₹7,499' },
  { segment: 'Luxury', exterior: '₹1,199', deep: '₹1,999', ceramic: '₹9,999' },
];

export const WASH_PACKAGES = [
  {
    slug: 'exterior',
    name: 'Exterior Wash',
    priceLabel: 'From ₹499',
    desc: 'Quick shine for busy weekdays.',
    features: ['Foam pre-wash', 'Tyre dressing', 'Door jambs', '15–25 min'],
    popular: false,
  },
  {
    slug: 'deep',
    name: 'Deep Cleaning',
    priceLabel: 'From ₹899',
    desc: 'Interior + exterior reset.',
    features: ['Full vacuum', 'Dashboard detail', 'Mat shampoo', '45–60 min'],
    popular: true,
  },
  {
    slug: 'ceramic',
    name: 'Ceramic Coating',
    priceLabel: 'From ₹4,999',
    desc: 'Paint protection that lasts months.',
    features: ['Paint prep', 'Hydrophobic layer', 'UV guard', 'Pro application'],
    popular: false,
  },
];

export const BOOKING_STEPS = [
  { step: '01', title: 'Vehicle', desc: 'Hatchback, sedan, SUV, or luxury.' },
  { step: '02', title: 'Service', desc: 'Exterior, deep clean, or ceramic.' },
  { step: '03', title: 'Address', desc: 'Home, office, or gated community.' },
  { step: '04', title: 'Schedule', desc: 'AI-suggested slots & live availability.' },
  { step: '05', title: 'Payment', desc: 'Demo checkout · membership credits.' },
];

export const TESTIMONIALS = [
  {
    name: 'Priya Sharma',
    role: 'Tesla Model 3 owner',
    quote: 'Feels like Uber for car care — tracking, ETA, and a spotless finish every time.',
    rating: 5,
  },
  {
    name: 'Rahul Mehta',
    role: 'Fleet manager',
    quote: 'We moved 12 vehicles to WashGo memberships. Scheduling is finally predictable.',
    rating: 5,
  },
  {
    name: 'Ananya Iyer',
    role: 'BMW 3 Series',
    quote: 'Ceramic coating looked studio-grade. The before/after on the app sold me instantly.',
    rating: 5,
  },
];

export const BRAND_LOGOS = ['BMW', 'Mercedes', 'Audi', 'Tesla', 'Toyota', 'Honda', 'Hyundai', 'Kia', 'MG', 'Volvo'];

export const AI_FEATURES = [
  { title: 'AI concierge', desc: 'Ask anything about packages, timing, or care tips.' },
  { title: 'Smart reminders', desc: 'Maintenance nudges based on weather and usage.' },
  { title: 'Dynamic pricing', desc: 'Fair estimates by segment, zone, and demand.' },
  { title: 'Predictive scheduling', desc: 'Slots that fit your calendar — not the other way around.' },
];
