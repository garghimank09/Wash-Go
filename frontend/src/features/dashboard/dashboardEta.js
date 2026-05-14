/**
 * Customer-safe copy for next wash / arrival (no absurd minute counts).
 * Uses booking scheduled time; optional API `eta_minutes` when in a sensible range.
 */
export function formatCustomerWashTiming(booking, detail) {
  const scheduled = booking?.scheduled_at ? new Date(booking.scheduled_at) : null;
  if (!scheduled || Number.isNaN(scheduled.getTime())) {
    if (booking?.status === 'in_progress') {
      return { headline: 'Wash in progress', sub: 'Track each step below — updates appear live.' };
    }
    return { headline: 'Schedule pending', sub: 'We will confirm your window soon.' };
  }

  const now = Date.now();
  const diffMs = scheduled.getTime() - now;
  const diffMin = Math.round(diffMs / 60000);
  const timeOpts = { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' };
  const timeStr = scheduled.toLocaleString(undefined, timeOpts);

  const rawEta = detail?.eta_minutes;
  const apiEta = rawEta == null || !Number.isFinite(Number(rawEta)) ? null : Math.round(Number(rawEta));

  if (booking?.status === 'in_progress') {
    return {
      headline: 'Wash in progress',
      sub:
        apiEta != null && apiEta > 0 && apiEta <= 120
          ? `About ${apiEta} min left on the visit`
          : `Window started near ${timeStr}`,
    };
  }

  if (diffMs > 0) {
    if (apiEta != null && apiEta > 0 && apiEta <= 120) {
      return {
        headline: `Washer arriving in about ${apiEta} min`,
        sub: `Scheduled ${timeStr}`,
      };
    }
    if (diffMin > 0 && diffMin <= 90) {
      return {
        headline: `Starts in about ${diffMin} min`,
        sub: timeStr,
      };
    }
    if (diffMin > 90 && diffMin < 36 * 60) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);
      const schedDay = new Date(scheduled);
      schedDay.setHours(0, 0, 0, 0);
      if (schedDay.getTime() === tomorrow.getTime()) {
        const timeOnly = scheduled.toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' });
        return {
          headline: `Tomorrow at ${timeOnly}`,
          sub: 'We will notify you when your washer is on the way.',
        };
      }
      const hours = Math.round(diffMin / 60);
      if (hours < 24) {
        return {
          headline: `Next wash in about ${hours}h`,
          sub: timeStr,
        };
      }
      return {
        headline: timeStr,
        sub: 'Add to your calendar from booking detail.',
      };
    }
    if (diffMin >= 36 * 60) {
      return {
        headline: timeStr,
        sub: 'Your next wash is on the calendar.',
      };
    }
  }

  if (diffMs <= 0) {
    return {
      headline: 'Wash window',
      sub: timeStr,
    };
  }

  return { headline: timeStr, sub: 'View details for live updates.' };
}
