/** Stagger container/items for admin views (LazyMotion domAnimation–safe: opacity + y only). */
export const adminSectionContainer = (reduced) => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren: reduced ? 0 : 0.05,
      delayChildren: reduced ? 0 : 0.02,
    },
  },
});

export const adminSectionItem = (reduced) => ({
  hidden: { opacity: reduced ? 1 : 0, y: reduced ? 0 : 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: reduced ? 0 : 0.32, ease: [0.16, 1, 0.3, 1] },
  },
});
