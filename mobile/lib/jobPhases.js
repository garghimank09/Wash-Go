/**
 * Field-UX phase metadata for the active-job timeline + footer CTAs.
 *
 * These are the granular washer-side states the UI exposes (e.g. arrived,
 * service_started, before_uploaded, washing, qc_complete). They are
 * higher-resolution than the backend `BookingStatus` and live on the
 * device — see `lib/washerJobPhase.js` for the mapping back to API status.
 */

export const JOB_PHASES = [
  {
    id: 'accepted',
    label: 'Request accepted',
    description: 'You accepted the booking. Head out when ready.',
    ctaLabel: 'Start heading to customer',
    icon: 'CheckCircle2',
  },
  {
    id: 'heading',
    label: 'Heading to customer',
    description: 'Driving toward the service location.',
    ctaLabel: "I've arrived onsite",
    icon: 'Navigation',
  },
  {
    id: 'arrived',
    label: 'Arrived onsite',
    description: "You are at the customer's location.",
    ctaLabel: 'Start service',
    icon: 'MapPin',
  },
  {
    id: 'service_started',
    label: 'Service started',
    description: 'Capture before-wash photos to proceed.',
    ctaLabel: 'Upload before photos',
    icon: 'Sparkles',
  },
  {
    id: 'before_uploaded',
    label: 'Pre-wash documented',
    description: 'Before photos uploaded — ready to wash.',
    ctaLabel: 'Begin wash',
    icon: 'CameraIcon',
  },
  {
    id: 'washing',
    label: 'Wash in progress',
    description: 'Run through your service steps.',
    ctaLabel: 'Wash complete — upload after photos',
    icon: 'Droplets',
  },
  {
    id: 'after_uploaded',
    label: 'Post-wash documented',
    description: 'After photos uploaded — run QC.',
    ctaLabel: 'Run QC checklist',
    icon: 'CameraIcon',
  },
  {
    id: 'qc_complete',
    label: 'QC complete',
    description: 'All checklist items confirmed.',
    ctaLabel: 'Mark service completed',
    icon: 'ClipboardCheck',
  },
  {
    id: 'completed',
    label: 'Service completed',
    description: 'Payout will settle to your account.',
    ctaLabel: 'Done — back to dashboard',
    icon: 'Award',
  },
];

export const PHASE_INDEX = JOB_PHASES.reduce((acc, p, i) => {
  acc[p.id] = i;
  return acc;
}, {});

export function findPhase(id) {
  return JOB_PHASES.find((p) => p.id === id) || JOB_PHASES[0];
}

export function getNextPhase(currentId) {
  const idx = PHASE_INDEX[currentId];
  if (idx == null) return JOB_PHASES[1];
  const next = JOB_PHASES[idx + 1];
  return next || JOB_PHASES[JOB_PHASES.length - 1];
}

export function isPhaseAtLeast(currentId, targetId) {
  return (PHASE_INDEX[currentId] ?? 0) >= (PHASE_INDEX[targetId] ?? 0);
}

export const CHECKLIST_TEMPLATE = [
  { id: 'c1', label: 'Pre-wash walkthrough complete', done: false },
  { id: 'c2', label: 'Tire dressing consent confirmed', done: false },
  { id: 'c3', label: 'Trim & badge protection applied', done: false },
  { id: 'c4', label: 'Interior dust + vacuum', done: false },
  { id: 'c5', label: 'Final QC inspection', done: false },
  { id: 'c6', label: 'Service signed off', done: false },
];

export const TIMELINE_TEMPLATE = JOB_PHASES.map((p) => ({
  id: p.id,
  label: p.label,
}));

const MIN = 60 * 1000;

export function buildInitialTimelineEvents(phaseId, anchor = Date.now()) {
  const idx = PHASE_INDEX[phaseId] ?? 0;
  return JOB_PHASES.slice(0, idx + 1).map((p, i) => ({
    id: `evt-${p.id}`,
    phase: p.id,
    at: anchor - (idx - i) * 4 * MIN,
  }));
}

export function relativeTime(ts, now = Date.now()) {
  if (!ts) return '';
  const delta = Math.max(0, now - ts);
  if (delta < 45 * 1000) return 'just now';
  const mins = Math.round(delta / MIN);
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours} hr ago`;
  const days = Math.round(hours / 24);
  return `${days} d ago`;
}

export function formatScheduledTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
}
