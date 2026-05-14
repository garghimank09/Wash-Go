/** Coherent sample data for admin UI until live admin APIs exist. */

export const adminKpis = {
  revenue30dCents: 4_289_000,
  bookings30d: 1842,
  activeWashers: 47,
  openComplaints: 12,
  csatScore: 4.7,
  customerGrowthPct: 18.4,
  avgTicketCents: 52_90,
  /** BI / ops */
  repeatCustomerPct: 34.2,
  refundsPending: 5,
  avgAcceptancePct: 91,
};

/** Live command snapshot — maps cleanly to a future `/admin/ops/summary` payload. */
export const adminLiveOpsSnapshot = {
  activeBookings: 23,
  inProgressBookings: 8,
  pendingAssignment: 4,
  washersOnline: 38,
  washersOffline: 14,
  health: {
    dispatch: 88,
    fleet: 82,
    csat: 91,
  },
  delayedJobs: [
    { id: 'b-10022', customer: 'Morgan Blake', minutesLate: 14, zone: 'Oakland' },
    { id: 'b-10901', customer: 'Pat Lee', minutesLate: 6, zone: 'SOMA' },
  ],
};

export const adminSurgeZones = [
  { id: 'z1', name: 'SOMA / Mission', multiplier: 1.35, window: '11:00–14:00 PT', demandIndex: 92 },
  { id: 'z2', name: 'Marina / Cow Hollow', multiplier: 1.22, window: '15:00–19:00 PT', demandIndex: 78 },
  { id: 'z3', name: 'Palo Alto corridor', multiplier: 1.18, window: '08:00–11:00 PT', demandIndex: 71 },
];

/** Bookings awaiting washer assignment (dispatch console). */
export const adminDispatchQueue = [
  {
    id: 'dq-1001',
    customer: 'Jamie Fox',
    zone: 'Palo Alto',
    scheduledAt: '2026-05-14T09:00:00Z',
    priceCents: 4299,
    priorityLabel: 'SLA · starts in 2h',
    priorityRank: 1,
    packageLabel: 'Premium',
  },
  {
    id: 'dq-1002',
    customer: 'Riley Chen',
    zone: 'Marina',
    scheduledAt: '2026-05-13T18:00:00Z',
    priceCents: 5499,
    priorityLabel: 'VIP repeat',
    priorityRank: 2,
    packageLabel: 'Deluxe',
  },
  {
    id: 'dq-1003',
    customer: 'Skyler Adams',
    zone: 'SOMA',
    scheduledAt: '2026-05-15T13:15:00Z',
    priceCents: 5899,
    priorityLabel: 'Surge zone',
    priorityRank: 3,
    packageLabel: 'Premium',
  },
];

/** Suggested washers per dispatch queue id. */
export const adminWasherSuggestions = {
  'dq-1001': [
    { washerId: 'w5', name: 'Casey Nguyen', distanceLabel: '2.4 mi', score: 94, priorityReason: 'Highest acceptance in zone' },
    { washerId: 'w3', name: 'Alex Kim', distanceLabel: '4.1 mi', score: 88, priorityReason: 'On-time streak' },
    { washerId: 'w1', name: 'Jordan Lee', distanceLabel: '6.8 mi', score: 81, priorityReason: 'Premium volume' },
  ],
  'dq-1002': [
    { washerId: 'w1', name: 'Jordan Lee', distanceLabel: '0.8 mi', score: 97, priorityReason: 'Territory match' },
    { washerId: 'w2', name: 'Sam Rivera', distanceLabel: '1.9 mi', score: 90, priorityReason: 'Customer requested before' },
    { washerId: 'w5', name: 'Casey Nguyen', distanceLabel: '3.2 mi', score: 85, priorityReason: 'Available now' },
  ],
  'dq-1003': [
    { washerId: 'w2', name: 'Sam Rivera', distanceLabel: '1.1 mi', score: 96, priorityReason: 'Surge-trained' },
    { washerId: 'w1', name: 'Jordan Lee', distanceLabel: '2.0 mi', score: 92, priorityReason: 'Rating lead' },
    { washerId: 'w3', name: 'Alex Kim', distanceLabel: '3.5 mi', score: 84, priorityReason: 'Backup capacity' },
  ],
};

/** Fleet rows — superset for grid + sparkline last 7d completions trend. */
export const adminWashers = [
  {
    id: 'w1',
    name: 'Jordan Lee',
    completed: 186,
    onTimePct: 97,
    rating: 4.9,
    active: true,
    utilizationPct: 82,
    acceptancePct: 94,
    completed7d: 22,
    completed30d: 86,
    trustScore: 94,
    revenue7dCents: 48_200,
    trend7d: [18, 20, 19, 22, 21, 24, 22],
    region: 'SF · SOMA corridor',
    topBadge: 'Velocity',
  },
  {
    id: 'w2',
    name: 'Sam Rivera',
    completed: 172,
    onTimePct: 94,
    rating: 4.8,
    active: true,
    utilizationPct: 78,
    acceptancePct: 91,
    completed7d: 19,
    completed30d: 79,
    trustScore: 90,
    revenue7dCents: 41_800,
    trend7d: [16, 17, 18, 19, 18, 20, 19],
    region: 'SF · Marina / Cow Hollow',
    topBadge: 'Surge',
  },
  {
    id: 'w3',
    name: 'Alex Kim',
    completed: 158,
    onTimePct: 99,
    rating: 4.7,
    active: true,
    utilizationPct: 71,
    acceptancePct: 96,
    completed7d: 17,
    completed30d: 72,
    trustScore: 93,
    revenue7dCents: 36_400,
    trend7d: [14, 15, 16, 17, 16, 18, 17],
    region: 'Peninsula · Palo Alto',
    topBadge: 'Reliability',
  },
  {
    id: 'w4',
    name: 'Taylor Morgan',
    completed: 141,
    onTimePct: 91,
    rating: 4.6,
    active: false,
    utilizationPct: 0,
    acceptancePct: 88,
    completed7d: 0,
    completed30d: 12,
    trustScore: 84,
    revenue7dCents: 0,
    trend7d: [0, 0, 0, 0, 0, 0, 0],
    region: 'East Bay · Oakland',
    topBadge: null,
  },
  {
    id: 'w5',
    name: 'Casey Nguyen',
    completed: 128,
    onTimePct: 96,
    rating: 4.85,
    active: true,
    utilizationPct: 76,
    acceptancePct: 93,
    completed7d: 16,
    completed30d: 64,
    trustScore: 91,
    revenue7dCents: 35_100,
    trend7d: [13, 14, 15, 16, 15, 17, 16],
    region: 'SF · Mission',
    topBadge: null,
  },
];

export const adminTopPerformers = [
  { washerId: 'w1', name: 'Jordan Lee', badge: 'Velocity', metric: '22 completes / 7d', sub: 'Trust 94 · SOMA anchor' },
  { washerId: 'w3', name: 'Alex Kim', badge: 'Reliability', metric: '99% on-time', sub: 'Highest QA pass rate' },
  { washerId: 'w2', name: 'Sam Rivera', badge: 'Surge', metric: '+18% uplift', sub: 'Peak acceptance leader' },
];

export const adminZonePerformance = [
  { zone: 'San Francisco', bookings: 842, revenueCents: 1_982_000, repeatPct: 38 },
  { zone: 'East Bay', bookings: 412, revenueCents: 892_000, repeatPct: 31 },
  { zone: 'Peninsula', bookings: 318, revenueCents: 721_000, repeatPct: 36 },
  { zone: 'South Bay', bookings: 270, revenueCents: 694_000, repeatPct: 29 },
];

export const adminPeakHourInsight = {
  title: 'Peak load',
  body: 'Thu 16:00–19:00 local shows +22% booking density vs 30d median — pre-position washers in SOMA and Marina.',
  peakLabel: 'Thu 16–19',
  liftPct: 22,
};

/** Dense “live” monitor rows (subset + ops fields). */
export const adminActiveMonitorRows = [
  { id: 'b-10022', customer: 'Morgan Blake', washer: 'Sam Rivera', phase: 'In progress', zone: 'Oakland', etaSlipMinutes: 14, status: 'in_progress' },
  { id: 'b-10021', customer: 'Riley Chen', washer: 'Jordan Lee', phase: 'En route', zone: 'SF · Marina', etaSlipMinutes: 0, status: 'confirmed' },
  { id: 'b-10988', customer: 'Devon Walsh', washer: 'Alex Kim', phase: 'QC photos', zone: 'San Jose', etaSlipMinutes: 0, status: 'in_progress' },
  { id: 'b-10990', customer: 'Jordan Miles', washer: '—', phase: 'Matching', zone: 'Berkeley', etaSlipMinutes: 0, status: 'pending' },
  { id: 'b-10991', customer: 'Chris Ng', washer: 'Casey Nguyen', phase: 'Scheduled', zone: 'Palo Alto', etaSlipMinutes: 0, status: 'confirmed' },
];

/** Synthetic alert templates for throttled live feed (useAdminLiveOps). */
export const adminLiveAlertTemplates = [
  { type: 'alert', severity: 'warn', title: 'Dispatch · 2 jobs unassigned >45m in Palo Alto corridor' },
  { type: 'alert', severity: 'info', title: 'Fleet · washer density rebalanced — Marina +3 online' },
  { type: 'booking', severity: 'info', title: 'Booking surge detected — SOMA multiplier 1.35' },
  { type: 'alert', severity: 'critical', title: 'SLA · complaint c-504 approaching exec escalation window' },
  { type: 'payout', severity: 'info', title: 'Settlement batch #482 cleared — $128k washer payouts' },
];

/** SLA watchlist — command center density rail (mock). */
export const adminSlaAlerts = [
  { id: 'sla-1', title: 'Complaint c-504 · exec escalation window', zone: 'Marina', minutesToBreach: 18, severity: 'critical' },
  { id: 'sla-2', title: '3 bookings start <45m · thin washer pool', zone: 'Palo Alto', minutesToBreach: 36, severity: 'warn' },
  { id: 'sla-3', title: 'QC photo backlog · tower B', zone: 'San Jose', minutesToBreach: 95, severity: 'info' },
];

/** Escalation tracker — exec / cross-team queue (mock). */
export const adminEscalations = [
  { id: 'esc-1', subject: 'VIP churn risk · Morgan Blake', stage: 'L2', owner: 'Ops lead', ageHours: 6 },
  { id: 'esc-2', subject: 'Washer incident · equipment claim', stage: 'Trust & Safety', owner: 'T&S queue', ageHours: 14 },
  { id: 'esc-3', subject: 'Payout provider latency spike', stage: 'Engineering', owner: 'SRE bridge', ageHours: 2 },
  { id: 'esc-4', subject: 'Surge pricing dispute batch', stage: 'CX', owner: 'Escalations pod', ageHours: 9 },
];

/** Monthly revenue in USD for charting (same pattern as customer dashboard charts). */
export const adminRevenueSeries = [
  { label: 'Jun', revenue: 112_400 },
  { label: 'Jul', revenue: 128_200 },
  { label: 'Aug', revenue: 119_800 },
  { label: 'Sep', revenue: 142_100 },
  { label: 'Oct', revenue: 156_300 },
  { label: 'Nov', revenue: 168_900 },
];

export const adminBookingVolumeSeries = [
  { label: 'Mon', bookings: 142 },
  { label: 'Tue', bookings: 128 },
  { label: 'Wed', bookings: 156 },
  { label: 'Thu', bookings: 151 },
  { label: 'Fri', bookings: 198 },
  { label: 'Sat', bookings: 224 },
  { label: 'Sun', bookings: 176 },
];

export const adminCustomerGrowth = [
  { label: 'Jan', signups: 420, cumulative: 4200 },
  { label: 'Feb', signups: 510, cumulative: 4710 },
  { label: 'Mar', signups: 488, cumulative: 5198 },
  { label: 'Apr', signups: 602, cumulative: 5800 },
  { label: 'May', signups: 640, cumulative: 6440 },
  { label: 'Jun', signups: 710, cumulative: 7150 },
];

/** CSAT distribution (must sum ~100). */
export const adminSatisfactionSegments = [
  { name: 'Promoters', value: 72, fill: 'var(--wg-brand-from)' },
  { name: 'Passive', value: 21, fill: 'rgb(148 163 184)' },
  { name: 'Detractors', value: 7, fill: 'rgb(248 113 113)' },
];

/** Illustrative breakdown rows (not audited to sum). */
export const adminEarningsBreakdown = {
  grossCents: 4_289_000,
  platformFeesCents: 644_000,
  washerPayoutsCents: 3_085_000,
  pendingSettlementCents: 560_000,
};

/** 7 weekdays × 12 slots (2h blocks from 6:00–30:00 local conceptual). */
export const adminHeatmapMatrix = [
  [2, 4, 6, 8, 12, 14, 18, 22, 20, 16, 10, 6],
  [3, 5, 7, 9, 14, 16, 20, 24, 22, 18, 11, 7],
  [4, 6, 8, 11, 15, 18, 22, 26, 24, 19, 12, 8],
  [3, 5, 8, 10, 14, 17, 21, 25, 23, 17, 11, 7],
  [5, 7, 9, 12, 18, 22, 26, 30, 28, 22, 14, 9],
  [8, 10, 12, 16, 22, 26, 32, 38, 34, 28, 18, 12],
  [6, 8, 10, 14, 18, 20, 24, 28, 26, 20, 14, 9],
];

export const adminHeatmapHourLabels = ['6–8', '8–10', '10–12', '12–14', '14–16', '16–18', '18–20', '20–22', '22–24', '0–2', '2–4', '4–6'];

export const adminDayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const adminLiveFeed = [
  { id: 'e1', type: 'booking', severity: 'info', title: 'Deluxe wash confirmed — Marina district', time: '2m ago' },
  { id: 'e2', type: 'payout', severity: 'info', title: 'Batch payout sent to 12 washers', time: '14m ago' },
  { id: 'e3', type: 'alert', severity: 'warn', title: 'SLA risk: 3 bookings starting in <45m', time: '22m ago' },
  { id: 'e4', type: 'review', severity: 'info', title: 'New 5★ review — Jordan Lee', time: '31m ago' },
  { id: 'e5', type: 'booking', severity: 'info', title: 'Premium package booked — SOMA', time: '48m ago' },
];

export const adminBookingsRows = [
  {
    id: 'b-10021',
    customer: 'Riley Chen',
    washer: 'Jordan Lee',
    scheduledAt: '2026-05-13T14:00:00Z',
    status: 'confirmed',
    priceCents: 5499,
    city: 'San Francisco',
  },
  {
    id: 'b-10022',
    customer: 'Morgan Blake',
    washer: 'Sam Rivera',
    scheduledAt: '2026-05-13T16:30:00Z',
    status: 'in_progress',
    priceCents: 6299,
    city: 'Oakland',
  },
  {
    id: 'b-10023',
    customer: 'Quinn Park',
    washer: 'Alex Kim',
    scheduledAt: '2026-05-12T11:00:00Z',
    status: 'completed',
    priceCents: 4899,
    city: 'San Jose',
  },
  {
    id: 'b-10024',
    customer: 'Jamie Fox',
    washer: 'Casey Nguyen',
    scheduledAt: '2026-05-14T09:00:00Z',
    status: 'pending',
    priceCents: 4299,
    city: 'Palo Alto',
  },
  {
    id: 'b-10025',
    customer: 'Drew Ellis',
    washer: 'Taylor Morgan',
    scheduledAt: '2026-05-11T15:00:00Z',
    status: 'cancelled',
    priceCents: 0,
    city: 'Berkeley',
  },
  {
    id: 'b-10026',
    customer: 'Skyler Adams',
    washer: 'Jordan Lee',
    scheduledAt: '2026-05-15T13:15:00Z',
    status: 'confirmed',
    priceCents: 5899,
    city: 'San Francisco',
  },
];

export const adminComplaintsRows = [
  {
    id: 'c-501',
    customer: 'Avery Brooks',
    subject: 'Arrived 12 minutes late',
    status: 'open',
    priority: 'high',
    createdAt: '2026-05-12T09:12:00Z',
    slaDueAt: '2026-05-13T09:00:00Z',
    escalationStage: 'L1',
    refundStatus: 'none',
    refundCents: 0,
  },
  {
    id: 'c-502',
    customer: 'Reese Patel',
    subject: 'Water spots on rear glass',
    status: 'in_review',
    priority: 'medium',
    createdAt: '2026-05-11T18:40:00Z',
    slaDueAt: '2026-05-14T18:00:00Z',
    escalationStage: 'L1',
    refundStatus: 'none',
    refundCents: 0,
  },
  {
    id: 'c-503',
    customer: 'Cameron Diaz',
    subject: 'Charged twice for same booking',
    status: 'resolved',
    priority: 'high',
    createdAt: '2026-05-10T11:05:00Z',
    slaDueAt: '2026-05-11T11:00:00Z',
    escalationStage: 'L2',
    refundStatus: 'approved',
    refundCents: 5499,
  },
  {
    id: 'c-504',
    customer: 'Logan Wright',
    subject: 'Washer cancelled last minute',
    status: 'open',
    priority: 'urgent',
    createdAt: '2026-05-12T07:55:00Z',
    slaDueAt: '2026-05-12T15:00:00Z',
    escalationStage: 'Exec',
    refundStatus: 'requested',
    refundCents: 6299,
  },
];

/** Operations directory — Customers (consumer CRM slice). */
export const adminDirectoryCustomers = [
  {
    id: 'u-1',
    fullName: 'Riley Chen',
    email: 'riley.chen@example.com',
    active: true,
    joinedAt: '2025-08-12',
    bookingsCount: 28,
    loyaltyTier: 'Gold',
    lifetimeValueCents: 142_800,
    recentActivityAt: '2026-05-12T10:22:00Z',
    recentActivityLabel: 'Booked Premium · Marina',
    complaintsStatus: 'none',
    notes: 'Prefers SMS reminders · corporate account.',
  },
  {
    id: 'u-4',
    fullName: 'Morgan Blake',
    email: 'morgan.blake@example.com',
    active: true,
    joinedAt: '2026-01-04',
    bookingsCount: 6,
    loyaltyTier: 'Silver',
    lifetimeValueCents: 31_200,
    recentActivityAt: '2026-05-11T16:05:00Z',
    recentActivityLabel: 'Completed wash · Oakland',
    complaintsStatus: 'resolved',
    notes: 'Price-sensitive · responds to promos.',
  },
  {
    id: 'u-6',
    fullName: 'Avery Brooks',
    email: 'avery.brooks@example.com',
    active: true,
    joinedAt: '2025-11-02',
    bookingsCount: 14,
    loyaltyTier: 'Silver',
    lifetimeValueCents: 68_400,
    recentActivityAt: '2026-05-10T09:00:00Z',
    recentActivityLabel: 'Support ticket · ETA',
    complaintsStatus: 'open',
    notes: 'Watch NPS on late arrivals.',
  },
  {
    id: 'u-7',
    fullName: 'Jamie Fox',
    email: 'jamie.fox@example.com',
    active: true,
    joinedAt: '2025-04-18',
    bookingsCount: 42,
    loyaltyTier: 'Platinum',
    lifetimeValueCents: 218_900,
    recentActivityAt: '2026-05-13T08:40:00Z',
    recentActivityLabel: 'Subscription renew',
    complaintsStatus: 'none',
    notes: 'VIP routing · quarterly detail add-on.',
  },
  {
    id: 'u-8',
    fullName: 'Quinn Park',
    email: 'quinn.park@example.com',
    active: false,
    joinedAt: '2024-09-30',
    bookingsCount: 3,
    loyaltyTier: '—',
    lifetimeValueCents: 12_400,
    recentActivityAt: '2026-02-01T12:00:00Z',
    recentActivityLabel: 'Account suspended · payment',
    complaintsStatus: 'none',
    notes: 'Churn risk — win-back queue.',
  },
  {
    id: 'u-9',
    fullName: 'Skyler Adams',
    email: 'skyler.adams@example.com',
    active: true,
    joinedAt: '2026-03-08',
    bookingsCount: 9,
    loyaltyTier: 'Gold',
    lifetimeValueCents: 52_100,
    recentActivityAt: '2026-05-13T14:12:00Z',
    recentActivityLabel: 'Rescheduled booking',
    complaintsStatus: 'none',
    notes: 'Mobile-only · push preferred.',
  },
  {
    id: 'u-10',
    fullName: 'Drew Ellis',
    email: 'drew.ellis@example.com',
    active: true,
    joinedAt: '2025-12-20',
    bookingsCount: 11,
    loyaltyTier: 'Silver',
    lifetimeValueCents: 44_600,
    recentActivityAt: '2026-05-09T19:30:00Z',
    recentActivityLabel: 'Referral sent',
    complaintsStatus: 'none',
    notes: 'Referred 2 neighbors.',
  },
];

/** Partners / washers — fleet ops slice. */
export const adminDirectoryPartners = [
  {
    id: 'u-2',
    fullName: 'Jordan Lee',
    email: 'jordan.lee@washgo.test',
    active: true,
    joinedAt: '2025-03-01',
    online: true,
    acceptancePct: 94,
    completionPct: 98,
    trustScore: 94,
    earningsYtdCents: 186_400,
    activeJobs: 2,
    operationalState: 'busy',
    territory: 'SF · Marina / Pac Heights',
    notes: 'Top performer · surge-certified.',
  },
  {
    id: 'u-5',
    fullName: 'Sam Rivera',
    email: 'sam.rivera@washgo.test',
    active: true,
    joinedAt: '2025-06-18',
    online: false,
    acceptancePct: 91,
    completionPct: 96,
    trustScore: 90,
    earningsYtdCents: 162_200,
    activeJobs: 0,
    operationalState: 'off_shift',
    territory: 'East Bay',
    notes: 'PT schedule · Thu–Sun.',
  },
  {
    id: 'u-11',
    fullName: 'Alex Kim',
    email: 'alex.kim@washgo.test',
    active: true,
    joinedAt: '2025-01-10',
    online: true,
    acceptancePct: 96,
    completionPct: 99,
    trustScore: 93,
    earningsYtdCents: 178_900,
    activeJobs: 1,
    operationalState: 'available',
    territory: 'Peninsula',
    notes: 'QC photo exemplar.',
  },
  {
    id: 'u-12',
    fullName: 'Casey Nguyen',
    email: 'casey.nguyen@washgo.test',
    active: true,
    joinedAt: '2024-11-05',
    online: true,
    acceptancePct: 93,
    completionPct: 97,
    trustScore: 91,
    earningsYtdCents: 155_000,
    activeJobs: 1,
    operationalState: 'busy',
    territory: 'Palo Alto / Menlo',
    notes: 'Ceramic specialist.',
  },
  {
    id: 'u-13',
    fullName: 'Taylor Morgan',
    email: 'taylor.morgan@washgo.test',
    active: false,
    joinedAt: '2025-02-14',
    online: false,
    acceptancePct: 88,
    completionPct: 91,
    trustScore: 84,
    earningsYtdCents: 42_300,
    activeJobs: 0,
    operationalState: 'suspended',
    territory: 'Berkeley',
    notes: 'Compliance review · document upload.',
  },
  {
    id: 'u-14',
    fullName: 'Riley Ortiz',
    email: 'riley.ortiz@washgo.test',
    active: true,
    joinedAt: '2026-02-22',
    online: true,
    acceptancePct: 89,
    completionPct: 95,
    trustScore: 87,
    earningsYtdCents: 28_100,
    activeJobs: 0,
    operationalState: 'available',
    territory: 'SOMA',
    notes: 'New hire · shadowing Jordan.',
  },
];

/** Admin staff — internal directory slice. */
export const adminDirectoryStaff = [
  {
    id: 'u-3',
    fullName: 'Ops Admin',
    email: 'ops@washgo.test',
    active: true,
    joinedAt: '2024-11-20',
    staffRole: 'super_admin',
    permissionsSummary: 'Full platform · users · payouts · config',
    operationalAccess: 'production',
    activityState: 'active',
    lastLoginAt: '2026-05-13T11:02:00Z',
    notes: 'Primary incident commander.',
  },
  {
    id: 'u-15',
    fullName: 'Jordan Patel',
    email: 'j.patel@washgo.test',
    active: true,
    joinedAt: '2025-07-01',
    staffRole: 'ops',
    permissionsSummary: 'Bookings · complaints · dispatch read',
    operationalAccess: 'production',
    activityState: 'active',
    lastLoginAt: '2026-05-13T09:45:00Z',
    notes: 'SOMA shift lead.',
  },
  {
    id: 'u-16',
    fullName: 'Sam Chen',
    email: 's.chen@washgo.test',
    active: true,
    joinedAt: '2025-09-12',
    staffRole: 'ops',
    permissionsSummary: 'Analytics export · read-only users',
    operationalAccess: 'staging',
    activityState: 'away',
    lastLoginAt: '2026-05-12T16:20:00Z',
    notes: 'QA dry-run access.',
  },
];

/** Legacy flat list — concatenation of directory rows for API-compat imports. */
export const adminUsers = [
  ...adminDirectoryCustomers.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    role: 'customer',
    active: r.active,
    joinedAt: r.joinedAt,
  })),
  ...adminDirectoryPartners.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    role: 'washer',
    active: r.active,
    joinedAt: r.joinedAt,
  })),
  ...adminDirectoryStaff.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    role: 'admin',
    active: r.active,
    joinedAt: r.joinedAt,
  })),
];
