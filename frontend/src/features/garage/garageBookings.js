const ACTIVE = new Set(['pending', 'confirmed', 'in_progress']);

/**
 * Derive wash stats for a vehicle from booking list items (same shape as GET /bookings).
 */
export function garageStatsForCar(carId, items) {
  const id = String(carId);
  const mine = (items || []).filter((b) => String(b.car_id) === id);

  const completed = mine.filter((b) => b.status === 'completed');
  const washCount = completed.length;

  let lastWash = null;
  if (completed.length) {
    lastWash = completed.reduce((best, b) =>
      new Date(b.scheduled_at) > new Date(best.scheduled_at) ? b : best,
    completed[0]);
  }

  const upcoming = [...mine]
    .filter((b) => ACTIVE.has(b.status))
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];

  return { washCount, lastWash, upcoming, totalBookings: mine.length };
}
