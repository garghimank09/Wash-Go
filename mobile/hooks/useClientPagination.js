import { useCallback, useEffect, useMemo, useState } from 'react';

function clampPage(page, totalPages) {
  if (totalPages < 1) return 1;
  return Math.min(Math.max(1, page), totalPages);
}

/**
 * Client-side page slicing for in-memory lists.
 */
export function useClientPagination(items = [], options = {}) {
  const { pageSize = 8, initialPage = 1, resetKey } = options;
  const [pageState, setPageState] = useState(initialPage);

  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize) || 1);

  useEffect(() => {
    setPageState(1);
  }, [resetKey, totalItems]);

  useEffect(() => {
    setPageState((prev) => clampPage(prev, totalPages));
  }, [totalPages]);

  const page = clampPage(pageState, totalPages);

  const pageItems = useMemo(() => {
    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize]);

  const rangeStart = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const rangeEnd = Math.min(page * pageSize, totalItems);

  const rangeLabel =
    totalItems === 0 ? '0 of 0' : `${rangeStart}–${rangeEnd} of ${totalItems}`;

  const pageLabel = totalPages > 1 ? `Page ${page} of ${totalPages}` : null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  const setPage = useCallback(
    (next) => {
      setPageState((prev) => {
        const value = typeof next === 'function' ? next(prev) : next;
        return clampPage(value, totalPages);
      });
    },
    [totalPages],
  );

  const goToPage = useCallback(
    (n) => {
      setPageState(clampPage(n, totalPages));
    },
    [totalPages],
  );

  const goPrev = useCallback(() => {
    setPageState((prev) => clampPage(prev - 1, totalPages));
  }, [totalPages]);

  const goNext = useCallback(() => {
    setPageState((prev) => clampPage(prev + 1, totalPages));
  }, [totalPages]);

  const showPagination = totalItems > pageSize;

  return {
    page,
    setPage,
    totalPages,
    totalItems,
    pageItems,
    rangeLabel,
    pageLabel,
    canPrev,
    canNext,
    goPrev,
    goNext,
    goToPage,
    showPagination,
    pageSize,
    rangeStart,
    rangeEnd,
  };
}
