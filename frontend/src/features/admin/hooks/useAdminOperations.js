import { useMemo, useState } from 'react';

import { useAdminBookings } from '../../../hooks/useAdminBookings';
import { toAdminTableRow } from '../../../lib/adminBookingsMap';
import { adminComplaintsRows } from '../mock/adminMock';

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .trim();
}

export function useAdminOperations() {
  const { items, loading, error, reload } = useAdminBookings();
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complaintStatus, setComplaintStatus] = useState('all');

  const bookings = useMemo(() => {
    let rows = items.map(toAdminTableRow);
    const q = norm(query);
    if (q) {
      rows = rows.filter(
        (r) =>
          norm(r.customer).includes(q) ||
          norm(r.washer).includes(q) ||
          norm(r.city).includes(q) ||
          norm(r.id).includes(q) ||
          norm(r.rawId).includes(q),
      );
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    return rows;
  }, [items, query, statusFilter]);

  const complaints = useMemo(() => {
    let rows = [...adminComplaintsRows];
    const q = norm(query);
    if (q) {
      rows = rows.filter(
        (r) => norm(r.customer).includes(q) || norm(r.subject).includes(q) || norm(r.id).includes(q),
      );
    }
    if (complaintStatus !== 'all') {
      rows = rows.filter((r) => r.status === complaintStatus);
    }
    return rows;
  }, [query, complaintStatus]);

  return {
    bookings,
    complaints,
    query,
    setQuery,
    statusFilter,
    setStatusFilter,
    complaintStatus,
    setComplaintStatus,
    loading,
    error,
    reload,
  };
}
