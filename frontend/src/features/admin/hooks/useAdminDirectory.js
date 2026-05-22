import { useEffect, useMemo, useState } from 'react';

import { useAuth } from '../../../context/AuthContext';
import { useAdminBookings } from '../../../hooks/useAdminBookings';
import {
  buildDirectoryCustomers,
  buildDirectoryPartners,
  buildDirectoryStaff,
} from '../../../lib/adminAnalytics';

/** @typedef {'customers' | 'partners' | 'staff'} DirectorySegment */

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .trim();
}

function matchesSearch(row, q) {
  if (!q) return true;
  const n = norm(q);
  return (
    norm(row.fullName).includes(n) ||
    norm(row.email).includes(n) ||
    norm(row.id).includes(n)
  );
}

function filterCustomers(rows, chip) {
  if (chip === 'active') return rows.filter((r) => r.active);
  if (chip === 'suspended') return rows.filter((r) => !r.active);
  if (chip === 'at_risk') return rows.filter((r) => r.complaintsStatus === 'open' || !r.active);
  return rows;
}

function filterPartners(rows, chip) {
  if (chip === 'online') return rows.filter((r) => r.online);
  if (chip === 'offline') return rows.filter((r) => !r.online);
  if (chip === 'busy') return rows.filter((r) => r.operationalState === 'busy');
  return rows;
}

function filterStaff(rows, chip) {
  if (chip === 'active') return rows.filter((r) => r.activityState === 'active');
  if (chip === 'away') return rows.filter((r) => r.activityState === 'away');
  return rows;
}

/**
 * @param {DirectorySegment} segment
 */
export function useAdminDirectory(segment) {
  const { user } = useAuth();
  const { items, fleetWashers } = useAdminBookings();
  const [search, setSearch] = useState('');
  const [chip, setChip] = useState('all');
  const [tickVersion, setTickVersion] = useState(0);

  useEffect(() => {
    if (segment !== 'partners') return undefined;
    const id = window.setInterval(() => setTickVersion((v) => v + 1), 30000);
    return () => window.clearInterval(id);
  }, [segment]);

  const baseRows = useMemo(() => {
    if (segment === 'customers') return buildDirectoryCustomers(items);
    if (segment === 'partners') return buildDirectoryPartners(fleetWashers);
    return buildDirectoryStaff(user);
  }, [segment, items, fleetWashers, user, tickVersion]);

  const chipFiltered = useMemo(() => {
    if (segment === 'customers') return filterCustomers(baseRows, chip);
    if (segment === 'partners') return filterPartners(baseRows, chip);
    return filterStaff(baseRows, chip);
  }, [segment, chip, baseRows]);

  const metrics = useMemo(() => {
    const rows = chipFiltered;
    if (segment === 'customers') {
      const totalLtv = rows.reduce((s, r) => s + (Number(r.lifetimeValueCents) || 0), 0);
      const bookings = rows.reduce((s, r) => s + (Number(r.bookingsCount) || 0), 0);
      const openComplaints = rows.filter((r) => r.complaintsStatus === 'open').length;
      return {
        count: rows.length,
        totalLtvCents: totalLtv,
        totalBookings: bookings,
        openComplaints,
      };
    }
    if (segment === 'partners') {
      const online = rows.filter((r) => r.online).length;
      const busy = rows.filter((r) => r.operationalState === 'busy').length;
      const earnings = rows.reduce((s, r) => s + (Number(r.earningsYtdCents) || 0), 0);
      const avgTrust =
        rows.length > 0 ? Math.round(rows.reduce((s, r) => s + (r.trustScore || 0), 0) / rows.length) : 0;
      return { count: rows.length, online, busy, earningsYtdCents: earnings, avgTrust };
    }
    const prod = rows.filter((r) => r.operationalAccess === 'production').length;
    const superAdmin = rows.filter((r) => r.staffRole === 'super_admin').length;
    return {
      count: rows.length,
      productionAccess: prod,
      superAdmin,
      activeNow: rows.filter((r) => r.activityState === 'active').length,
    };
  }, [segment, chipFiltered]);

  const rows = useMemo(() => {
    const q = norm(search);
    return chipFiltered.filter((r) => matchesSearch(r, q));
  }, [chipFiltered, search]);

  return {
    rows,
    metrics,
    search,
    setSearch,
    chip,
    setChip,
    tickVersion,
  };
}
