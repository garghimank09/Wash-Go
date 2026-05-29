/**
 * Month navigation + day list builders for the partner Schedule tab.
 */

import { groupBookingsByDate } from './partnerMappers';

const LOCALE = 'en-IN';
const MONTHS_BACK = 12;
const MONTHS_AHEAD = 3;

function isoDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function monthIndex(year, month) {
  return year * 12 + month;
}

/** Allowed calendar month window relative to `now`. */
export function getMonthBounds(now = new Date()) {
  const anchor = new Date(now.getFullYear(), now.getMonth(), 1);
  const min = new Date(anchor);
  min.setMonth(min.getMonth() - MONTHS_BACK);
  const max = new Date(anchor);
  max.setMonth(max.getMonth() + MONTHS_AHEAD);
  return {
    minYear: min.getFullYear(),
    minMonth: min.getMonth(),
    maxYear: max.getFullYear(),
    maxMonth: max.getMonth(),
  };
}

export function clampViewMonth(year, month, now = new Date()) {
  const bounds = getMonthBounds(now);
  let y = year;
  let m = month;
  const idx = monthIndex(y, m);
  const minIdx = monthIndex(bounds.minYear, bounds.minMonth);
  const maxIdx = monthIndex(bounds.maxYear, bounds.maxMonth);
  if (idx < minIdx) {
    y = bounds.minYear;
    m = bounds.minMonth;
  } else if (idx > maxIdx) {
    y = bounds.maxYear;
    m = bounds.maxMonth;
  }
  return { year: y, month: m };
}

export function isSameMonth(dateKey, year, month) {
  if (!dateKey || dateKey.length < 7) return false;
  const [y, mo] = dateKey.split('-').map(Number);
  return y === year && mo - 1 === month;
}

export function firstDayKeyOfMonth(year, month) {
  const d = new Date(year, month, 1);
  return isoDateKey(d);
}

export function todayKey(now = new Date()) {
  const t = new Date(now);
  t.setHours(0, 0, 0, 0);
  return isoDateKey(t);
}

export function formatMonthLabel(year, month) {
  const d = new Date(year, month, 1);
  return d.toLocaleDateString(LOCALE, { month: 'long', year: 'numeric' });
}

export function canGoPrevMonth(year, month, now = new Date()) {
  const bounds = getMonthBounds(now);
  return monthIndex(year, month) > monthIndex(bounds.minYear, bounds.minMonth);
}

export function canGoNextMonth(year, month, now = new Date()) {
  const bounds = getMonthBounds(now);
  return monthIndex(year, month) < monthIndex(bounds.maxYear, bounds.maxMonth);
}

export function addMonths(year, month, delta) {
  const d = new Date(year, month + delta, 1);
  return clampViewMonth(d.getFullYear(), d.getMonth());
}

/** Pick default selected day when entering a month. */
export function defaultSelectedKeyForMonth(year, month, previousKey, now = new Date()) {
  if (isSameMonth(previousKey, year, month)) return previousKey;
  const t = new Date(now);
  if (t.getFullYear() === year && t.getMonth() === month) {
    return isoDateKey(t);
  }
  return firstDayKeyOfMonth(year, month);
}

/**
 * All days in a calendar month with bookings attached.
 * @returns {Array<{ key: string, date: string, weekday: string, day: number, month: string, isToday: boolean, bookings: object[] }>}
 */
export function buildMonthScheduleDays(items = [], year, month, now = new Date()) {
  const grouped = groupBookingsByDate(items);
  const today = todayKey(now);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const result = [];

  for (let dayNum = 1; dayNum <= daysInMonth; dayNum += 1) {
    const d = new Date(year, month, dayNum);
    d.setHours(0, 0, 0, 0);
    const key = isoDateKey(d);
    result.push({
      key,
      date: d.toISOString(),
      weekday: d.toLocaleDateString(LOCALE, { weekday: 'short' }),
      day: dayNum,
      month: d.toLocaleDateString(LOCALE, { month: 'short' }),
      isToday: key === today,
      bookings: grouped.get(key) || [],
    });
  }
  return result;
}

export function countJobsInMonth(days = []) {
  return days.reduce((sum, d) => sum + (d.bookings?.length || 0), 0);
}

const MONTH_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

export function monthShortLabel(monthIndex) {
  return MONTH_SHORT[monthIndex] ?? '';
}

export function isMonthInRange(year, month, now = new Date()) {
  const bounds = getMonthBounds(now);
  const idx = monthIndex(year, month);
  return (
    idx >= monthIndex(bounds.minYear, bounds.minMonth) &&
    idx <= monthIndex(bounds.maxYear, bounds.maxMonth)
  );
}

/** Distinct years available within the navigation window. */
export function yearsInRange(now = new Date()) {
  const bounds = getMonthBounds(now);
  const years = [];
  for (let y = bounds.minYear; y <= bounds.maxYear; y += 1) {
    years.push(y);
  }
  return years;
}
