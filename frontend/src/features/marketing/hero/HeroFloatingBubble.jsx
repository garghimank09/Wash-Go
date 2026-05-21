/**
 * Single glass-style bubble — animated via CSS transforms only (see .wg-hero-bubble).
 */
export function HeroFloatingBubble({ size, left, bottom, delay, duration, drift, animate = true }) {
  return (
    <span
      className={`wg-hero-bubble absolute rounded-full ${animate ? '' : 'wg-hero-bubble--static'}`}
      style={{
        width: size,
        height: size,
        left: `${left}%`,
        bottom: `${bottom}%`,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        '--wg-bubble-drift': `${drift}px`,
      }}
      aria-hidden
    />
  );
}
