import { useCallback, useEffect, useMemo, useState } from 'react';

import { useAdminBookings } from '../../../hooks/useAdminBookings';
import { dispatchBookingsSync, onBookingsSync } from '../../../lib/bookingSyncEvents';
import { toDispatchQueueItem, washerToSuggestion } from '../../../lib/adminBookingsMap';
import { getErrorMessage } from '../../../services/api';
import { adminService } from '../../../services/adminService';

function sortQueue(rows) {
  return [...rows].sort((a, b) => (a.priorityRank ?? 99) - (b.priorityRank ?? 99));
}

export function useAdminDispatch() {
  const { items, reload, fleetWashers } = useAdminBookings();
  const [washers, setWashers] = useState([]);
  const [preferredId, setPreferredId] = useState(null);
  const [assigning, setAssigning] = useState(false);

  const queue = useMemo(() => {
    const pending = items.filter((b) => b.status === 'pending' && !b.washer_id);
    return sortQueue(pending.map((b, i) => toDispatchQueueItem(b, i)));
  }, [items]);

  const loadWashers = useCallback(async () => {
    try {
      const data = await adminService.listDispatchWashers();
      setWashers(data.items || []);
    } catch {
      setWashers([]);
    }
  }, []);

  useEffect(() => {
    void loadWashers();
  }, [loadWashers]);

  useEffect(() => onBookingsSync(() => void loadWashers()), [loadWashers]);

  const selectedId = useMemo(() => {
    if (!queue.length) return null;
    if (preferredId && queue.some((q) => q.id === preferredId)) return preferredId;
    return queue[0].id;
  }, [queue, preferredId]);

  const selected = useMemo(() => queue.find((q) => q.id === selectedId) ?? null, [queue, selectedId]);

  const suggestions = useMemo(
    () => washers.map((w, i) => washerToSuggestion(w, i)),
    [washers],
  );

  const assignWasher = useCallback(
    async (bookingId, washerId) => {
      setAssigning(true);
      try {
        await adminService.assignBooking(bookingId, washerId);
        dispatchBookingsSync();
        await reload();
        setPreferredId((p) => (p === bookingId ? null : p));
      } catch (e) {
        const err = new Error(getErrorMessage(e));
        throw err;
      } finally {
        setAssigning(false);
      }
    },
    [reload],
  );

  const selectBooking = useCallback((id) => {
    setPreferredId(id);
  }, []);

  return {
    queue,
    selected,
    selectedId,
    selectBooking,
    suggestions,
    assignWasher,
    assigning,
    assignError: null,
    getAssignErrorMessage: getErrorMessage,
    fleetWashers,
  };
}
