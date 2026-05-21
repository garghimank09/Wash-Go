import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import usePartnerBookings from '../hooks/usePartnerBookings';
import {
  buildScheduleDays,
  mapBookingToCard,
} from '../lib/partnerMappers';
import { dateKeyFromDate } from '../lib/partnerFormatters';

const PartnerScheduleContext = createContext(null);

/** Map a backend booking → the row shape expected by `TimelineBookingCard`. */
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
    currency: card.currency,
    status: card.status,
    etaMins: null,
    distanceKm: null,
  };
}

export function PartnerScheduleProvider({ children }) {
  const { items, loading, refreshing, reload } = usePartnerBookings();

  const days = useMemo(() => buildScheduleDays(items), [items]);

  const todayKey = useMemo(() => {
    const t = new Date();
    return dateKeyFromDate(t);
  }, []);

  const [selectedKey, setSelectedKey] = useState(todayKey);

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

  const todaySummary = useMemo(() => {
    const today = days.find((d) => d.isToday);
    const todays = today ? today.bookings : [];
    return {
      projectedCents: todays.reduce((sum, b) => sum + (b.price_cents || 0), 0),
      completedCount: todays.filter((b) => b.status === 'completed').length,
      totalCount: todays.length,
    };
  }, [days]);

  const routePlan = useMemo(() => {
    const today = days.find((d) => d.isToday);
    const todays = today ? today.bookings : [];
    return {
      stops: todays.slice(0, 6).map((b) => ({
        id: b.id,
        label: (b.service_address || '').split('·')[0].trim() || 'Stop',
        time: b.scheduled_at,
        status: b.status,
        distanceKm: null,
      })),
      driveMins: null,
      distanceKm: null,
      traffic: 'medium',
      projectedPayoutCents: todays.reduce(
        (sum, b) => sum + (b.price_cents || 0),
        0,
      ),
    };
  }, [days]);

  const value = useMemo(
    () => ({
      days,
      selectedKey,
      setSelectedKey,
      getBookingsForDate,
      countBookingsForDate,
      todaySummary,
      routePlan,
      loading,
      refreshing,
      reload,
    }),
    [
      days,
      selectedKey,
      getBookingsForDate,
      countBookingsForDate,
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
