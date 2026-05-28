import { useEffect, useMemo, useState } from 'react';

import { DEFAULT_PAGE_SIZE, paginateSlice, totalPagesFor } from '../lib/paginatedList';

/**
 * Client-side filter → sort → paginate for booking-style lists.
 */
export function usePaginatedList(items, options = {}) {
  const {
    pageSize = DEFAULT_PAGE_SIZE,
    statusFilter = 'all',
    query = '',
    sort = 'newest',
    matchStatus,
    matchSearch,
    compare,
  } = options;

  const [page, setPage] = useState(1);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, query, sort]);

  const filtered = useMemo(() => {
    let rows = [...(items || [])];
    if (matchStatus) {
      rows = rows.filter((item) => matchStatus(item, statusFilter));
    }
    const q = String(query || '').trim().toLowerCase();
    if (q && matchSearch) {
      rows = rows.filter((item) => matchSearch(item, q));
    }
    if (compare) {
      rows.sort((a, b) => compare(a, b, sort));
    }
    return rows;
  }, [items, statusFilter, query, sort, matchStatus, matchSearch, compare]);

  const totalPages = totalPagesFor(filtered.length, pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => paginateSlice(filtered, page, pageSize),
    [filtered, page, pageSize],
  );

  const filteredCount = filtered.length;
  const rangeStart = filteredCount ? (page - 1) * pageSize + 1 : 0;
  const rangeEnd = Math.min(page * pageSize, filteredCount);

  return {
    pageItems,
    filteredCount,
    page,
    setPage,
    totalPages,
    rangeStart,
    rangeEnd,
    pageSize,
  };
}
