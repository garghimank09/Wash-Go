/** Framer Motion variants for booking wizard steps (used with custom `direction`). */
export const bookingStepVariants = {
  enter: (direction) => ({
    x: (direction ?? 1) > 0 ? 20 : -20,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.34, ease: [0.16, 1, 0.3, 1] },
  },
  exit: (direction) => ({
    x: (direction ?? 1) < 0 ? 20 : -20,
    opacity: 0,
    transition: { duration: 0.24, ease: [0.16, 1, 0.3, 1] },
  }),
};

export const bookingReducedVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1, transition: { duration: 0 } },
  exit: { opacity: 0, transition: { duration: 0 } },
};
