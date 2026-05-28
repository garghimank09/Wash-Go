import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '../../ui/button';
import { cn } from '../../lib/cn';

export function ListPagination({
  page,
  totalPages,
  onPageChange,
  rangeStart,
  rangeEnd,
  totalCount,
  className,
}) {
  if (totalCount <= 0) return null;

  return (
    <div
      className={cn(
        'flex flex-col gap-3 border-t border-wg-border/60 pt-4 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      <p className="text-sm text-wg-muted">
        Showing <span className="font-semibold text-wg-text">{rangeStart}</span>–
        <span className="font-semibold text-wg-text">{rangeEnd}</span> of{' '}
        <span className="font-semibold text-wg-text">{totalCount}</span>
      </p>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4" aria-hidden />
          Previous
        </Button>
        <span className="min-w-[5.5rem] text-center text-sm font-semibold tabular-nums text-wg-text">
          Page {page} / {totalPages}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="gap-1"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          Next
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
