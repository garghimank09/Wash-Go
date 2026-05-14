import { useMemo, useState } from 'react';

import { adminBookingsRows, adminComplaintsRows } from '../mock/adminMock';

function norm(s) {
  return String(s || '')
    .toLowerCase()
    .trim();
}

export function useAdminOperations() {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [complaintStatus, setComplaintStatus] = useState('all');

  const bookings = useMemo(() => {
    let rows = [...adminBookingsRows];
    const q = norm(query);
    if (q) {
      rows = rows.filter(
        (r) =>
          norm(r.customer).includes(q) ||
          norm(r.washer).includes(q) ||
          norm(r.city).includes(q) ||
          norm(r.id).includes(q),
      );
    }
    if (statusFilter !== 'all') {
      rows = rows.filter((r) => r.status === statusFilter);
    }
    return rows;
  }, [query, statusFilter]);

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
    loading: false,
    error: null,
  };
}
