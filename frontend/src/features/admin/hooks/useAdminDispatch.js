import { useCallback, useMemo, useState } from 'react';

import { adminDispatchQueue, adminWasherSuggestions } from '../mock/adminMock';

function sortQueue(rows) {
  return [...rows].sort((a, b) => (a.priorityRank ?? 99) - (b.priorityRank ?? 99));
}

/**
 * Dispatch console state — mock assign removes row locally (demo).
 */
export function useAdminDispatch() {
  const [queue, setQueue] = useState(() => sortQueue(adminDispatchQueue));
  const [preferredId, setPreferredId] = useState(null);

  const selectedId = useMemo(() => {
    if (!queue.length) return null;
    if (preferredId && queue.some((q) => q.id === preferredId)) return preferredId;
    return queue[0].id;
  }, [queue, preferredId]);

  const selected = useMemo(() => queue.find((q) => q.id === selectedId) ?? null, [queue, selectedId]);

  const suggestions = useMemo(() => {
    if (!selectedId) return [];
    return adminWasherSuggestions[selectedId] ?? [];
  }, [selectedId]);

  const assignWasher = useCallback((bookingId) => {
    setQueue((prev) => prev.filter((q) => q.id !== bookingId));
    setPreferredId((p) => (p === bookingId ? null : p));
  }, []);

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
  };
}
