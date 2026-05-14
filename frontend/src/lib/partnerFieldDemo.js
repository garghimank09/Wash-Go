/** Deterministic demo enrichment for partner UI — no API writes; stable per entity. */
export function hashString(s) {
  const str = String(s || '');
  let h = 5381;
  for (let i = 0; i < str.length; i += 1) {
    h = (h << 5) + h + str.charCodeAt(i);
  }
  return Math.abs(h);
}

/**
 * @param {object} offer
 * @returns {object} offer + dispatchIntel
 */
export function enrichDispatchOffer(offer) {
  const h = hashString(`${offer.id}|${offer.address}|${offer.customerName}`);
  const priorities = ['Standard match', 'Elevated fit', 'Priority corridor', 'Best territory match'];
  const heats = ['Zone warming', 'Active demand', 'High intent', 'Peak-adjacent'];
  const demands = [
    'Dispatch load balanced — ETA confidence stable.',
    'Short wait window · customer viewed live map.',
    'Post-lunch lift expected in 1.2 mi radius.',
  ];
  const confidences = [
    'Match confidence: high — repeat booking pattern in zone.',
    'Route stability: strong — low reroute risk.',
    'Customer intent: verified opens + saved payment.',
  ];
  return {
    ...offer,
    dispatchIntel: {
      priorityLabel: priorities[h % priorities.length],
      bestMatchPct: 82 + (h % 14),
      heatLabel: heats[h % heats.length],
      heatLevel: h % 3,
      demandLine: demands[h % demands.length],
      confidenceLine: confidences[h % confidences.length],
    },
  };
}

/**
 * @param {object | null} job
 */
export function enrichPartnerJob(job) {
  if (!job) return null;
  const h = hashString(`${job.id}|${job.service_address}|${job.customerName}|${job.vehicle || job.car_label}`);
  const tiers = ['Silver', 'Gold', 'Platinum'];
  const tagPools = [
    ['Ceramic-safe soap', 'Soft-close doors'],
    ['Matte wrap · pH-neutral only', 'Dog hair · extra vacuum'],
    ['Chrome trim · no acidic wheel acid', 'Panoramic roof · light pressure'],
  ];
  const warnings = [
    'Light brake dust on fronts — pre-rinse wheels before body.',
    'Tree sap on hood — spot-treat before foam.',
    'Recent ceramic coat — skip aggressive clay.',
  ];
  const warning = job.vehicleConditionWarning ?? (h % 6 === 0 ? null : warnings[h % warnings.length]);
  const loyaltyTier = job.loyaltyTier ?? tiers[h % tiers.length];
  const premiumByTier =
    loyaltyTier === 'Platinum'
      ? 'Elite tier · concierge routing'
      : loyaltyTier === 'Gold'
        ? 'Gold member · priority rinse lane'
        : 'Silver · standard care perks';
  return {
    ...job,
    partnerFieldUx: {
      vehicleConditionWarning: warning,
      specialHandlingTags: job.specialHandlingTags ?? tagPools[h % tagPools.length],
      repeatCustomer: job.repeatCustomer ?? h % 5 !== 0,
      loyaltyTier,
      premiumMemberLabel: job.premiumMemberLabel ?? premiumByTier,
      serviceNote: job.serviceNote ?? 'Preferred microfiber on glass; no ammonia on tint.',
    },
  };
}

/**
 * @param {object | null} user from /auth/me
 */
export function getPartnerTrustDemo(user) {
  const h = hashString(user?.id || user?.email || 'partner');
  return {
    rating: Math.round((4.55 + (h % 20) / 100) * 10) / 10,
    completionStreak: 3 + (h % 5),
    acceptancePct: 88 + (h % 10),
    onTimePct: 91 + (h % 8),
    trustScore: 78 + (h % 18),
    safetyVerified: h % 7 !== 0,
  };
}
