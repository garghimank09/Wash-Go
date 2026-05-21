/** Shared motion presets for marketing pages (opacity + y only; reduced-motion safe). */

export const marketingContainer = (reduced) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: reduced ? 0 : 0.07,
      delayChildren: reduced ? 0 : 0.03,
    },
  },
});

export const marketingItem = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0 : 0.38, ease: [0.22, 1, 0.36, 1] },
  },
});

export const marketingReveal = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0 : 0.42, ease: [0.22, 1, 0.36, 1] },
  },
});
