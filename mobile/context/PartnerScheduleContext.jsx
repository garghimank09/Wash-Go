import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import usePartnerBookings from '../hooks/usePartnerBookings';
import { mapBookingToCard, numberOrNull } from '../lib/partnerMappers';
import {
  isPartnerEarningBooking,
  partnerEarningsCents,
} from '../lib/partnerEarnings';
import {
  addMonths,
  buildMonthScheduleDays,
  canGoNextMonth,
  canGoPrevMonth,
  clampViewMonth,
  countJobsInMonth,
  defaultSelectedKeyForMonth,
  formatMonthLabel,
  todayKey,
} from '../lib/scheduleCalendar';

const PartnerScheduleContext = createContext(null);

function toScheduleRow(b) {
  if (!b) return null;
  const card = mapBookingToCard(b);
  return {
    id: card.id,
    customer: card.customer,
    address: card.address,
    coords: card.coords,
    time: card.scheduledAt,
    durationMins: null,
    packageLabel: card.packageLabel,
    vehicleLabel: card.vehicleLabel,
    priceCents: card.priceCents,
    partnerPayoutCents: card.partnerPayoutCents,
    currency: card.currency,
    status: card.status,
    etaMins: null,
    distanceKm: null,
  };
}

function summarizeDayBookings(bookings = []) {
  const earning = bookings.filter(isPartnerEarningBooking);
  const completed = earning.filter((b) => b.status === 'completed');
  const projectedCents = earning.reduce(
    (sum, b) => sum + partnerEarningsCents(b.price_cents),
    0,
  );
  const earnedCents = completed.reduce(
    (sum, b) => sum + partnerEarningsCents(b.price_cents),
    0,
  );
  return {
    projectedCents,
    earnedCents,
    completedCount: completed.length,
    totalCount: earning.length,
  };
}

function haversineKm(a, b) {
  if (!a || !b) return 0;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

function buildRoutePlanForBookings(bookings = []) {
  const earning = bookings.filter(isPartnerEarningBooking);
  const stops = earning.slice(0, 6).map((b) => ({
    id: b.id,
    label: (b.service_address || '').split('·')[0].trim() || 'Stop',
    time: b.scheduled_at,
    status: b.status,
    lat: numberOrNull(b.latitude),
    lng: numberOrNull(b.longitude),
    address: b.service_address || '',
    distanceKm: null,
  }));

  const geoStops = stops.filter((s) => s.lat != null && s.lng != null);
  let distanceKm = null;
  if (geoStops.length >= 2) {
    distanceKm = Math.round(
      geoStops.reduce((sum, stop, i) => {
        if (i === 0) return 0;
        const prev = geoStops[i - 1];
        return sum + haversineKm(prev, stop);
      }, 0) * 10,
    ) / 10;
  } else if (geoStops.length === 1) {
    distanceKm = 0;
  }

  const driveMins =
    distanceKm != null ? Math.max(1, Math.round((distanceKm / 28) * 60)) : null;

  return {
    stops,
    driveMins,
    distanceKm,
    traffic: 'medium',
    projectedPayoutCents: earning.reduce(
      (sum, b) => sum + partnerEarningsCents(b.price_cents),
      0,
    ),
  };
}

export function PartnerScheduleProvider({ children }) {
  const { items, loading, refreshing, reload } = usePartnerBookings();

  const now = useMemo(() => new Date(), []);
  const initialClamp = useMemo(
    () => clampViewMonth(now.getFullYear(), now.getMonth(), now),
    [now],
  );

  const [viewYear, setViewYear] = useState(initialClamp.year);
  const [viewMonth, setViewMonth] = useState(initialClamp.month);
  const [selectedKey, setSelectedKey] = useState(() => todayKey(now));

  const days = useMemo(
    () => buildMonthScheduleDays(items, viewYear, viewMonth, now),
    [items, viewYear, viewMonth, now],
  );

  const todaySummary = useMemo(() => {
    const monthDays = buildMonthScheduleDays(
      items,
      now.getFullYear(),
      now.getMonth(),
      now,
    );
    const todayDay = monthDays.find((d) => d.isToday);
    return summarizeDayBookings(todayDay?.bookings || []);
  }, [items, now]);

  const monthLabel = useMemo(
    () => formatMonthLabel(viewYear, viewMonth),
    [viewYear, viewMonth],
  );

  const monthJobCount = useMemo(() => countJobsInMonth(days), [days]);

  const applyViewMonth = useCallback(
    (year, month, keepSelectedKey) => {
      const clamped = clampViewMonth(year, month, now);
      setViewYear(clamped.year);
      setViewMonth(clamped.month);
      setSelectedKey((prev) =>
        defaultSelectedKeyForMonth(
          clamped.year,
          clamped.month,
          keepSelectedKey ?? prev,
          now,
        ),
      );
    },
    [now],
  );

  const goPrevMonth = useCallback(() => {
    const next = addMonths(viewYear, viewMonth, -1);
    applyViewMonth(next.year, next.month);
  }, [viewYear, viewMonth, applyViewMonth]);

  const goNextMonth = useCallback(() => {
    const next = addMonths(viewYear, viewMonth, 1);
    applyViewMonth(next.year, next.month);
  }, [viewYear, viewMonth, applyViewMonth]);

  const goToToday = useCallback(() => {
    const t = new Date(now);
    applyViewMonth(t.getFullYear(), t.getMonth(), todayKey(now));
  }, [now, applyViewMonth]);

  const goToMonth = useCallback(
    (year, month) => {
      applyViewMonth(year, month);
    },
    [applyViewMonth],
  );

  const getBookingsForDate = useCallback(
    (key) => {
      const day = days.find((d) => d.key === key);
      if (!day) return [];
      return day.bookings.map(toScheduleRow).filter(Boolean);
    },
    [days],
  );

  const countBookingsForDate = useCallback(
    (key) => {
      const day = days.find((d) => d.key === key);
      return day ? day.bookings.length : 0;
    },
    [days],
  );

  const getDaySummary = useCallback(
    (key) => {
      const day = days.find((d) => d.key === key);
      return summarizeDayBookings(day?.bookings || []);
    },
    [days],
  );

  const getRoutePlanForDate = useCallback(
    (key) => {
      const day = days.find((d) => d.key === key);
      return buildRoutePlanForBookings(day?.bookings || []);
    },
    [days],
  );

  const routePlan = useMemo(
    () => getRoutePlanForDate(selectedKey),
    [getRoutePlanForDate, selectedKey],
  );

  const value = useMemo(
    () => ({
      days,
      viewYear,
      viewMonth,
      selectedKey,
      setSelectedKey,
      monthLabel,
      monthJobCount,
      goPrevMonth,
      goNextMonth,
      goToMonth,
      goToToday,
      canGoPrevMonth: canGoPrevMonth(viewYear, viewMonth, now),
      canGoNextMonth: canGoNextMonth(viewYear, viewMonth, now),
      getBookingsForDate,
      countBookingsForDate,
      getDaySummary,
      getRoutePlanForDate,
      todaySummary,
      routePlan,
      loading,
      refreshing,
      reload,
      todayKey: todayKey(now),
    }),
    [
      days,
      viewYear,
      viewMonth,
      selectedKey,
      monthLabel,
      monthJobCount,
      goPrevMonth,
      goNextMonth,
      goToMonth,
      goToToday,
      now,
      getBookingsForDate,
      countBookingsForDate,
      getDaySummary,
      getRoutePlanForDate,
      todaySummary,
      routePlan,
      loading,
      refreshing,
      reload,
    ],
  );

  return (
    <PartnerScheduleContext.Provider value={value}>
      {children}
    </PartnerScheduleContext.Provider>
  );
}

export function usePartnerSchedule() {
  const ctx = useContext(PartnerScheduleContext);
  if (!ctx) {
    throw new Error('usePartnerSchedule must be used within PartnerScheduleProvider');
  }
  return ctx;
}
