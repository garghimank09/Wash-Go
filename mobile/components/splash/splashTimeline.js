export const SPLASH_DURATION_MS = 4500;

export const PHASE = {
  empty: { start: 0, end: 400 },
  droplets: { start: 400, end: 1200 },
  ringForm: { start: 800, end: 2200 },
  ringComplete: { start: 2200, end: 2800 },
  carReveal: { start: 2600, end: 3800 },
  mist: { start: 3000, end: 4200 },
  logo: { start: 3600, end: 4500 },
};

/** Map global progress 0–1 to a local 0–1 phase envelope. */
export function phaseProgress(globalProgress, phase) {
  'worklet';
  const { start, end } = phase;
  const t = (globalProgress * SPLASH_DURATION_MS - start) / (end - start);
  return Math.min(1, Math.max(0, t));
}

/** Smoothstep easing for worklet use. */
export function smoothstep(t) {
  'worklet';
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
}