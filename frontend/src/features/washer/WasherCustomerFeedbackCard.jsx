import { Link } from 'react-router-dom';
import { MessageSquare, Star } from 'lucide-react';

import { cn } from '../../lib/cn';
import { Card } from '../../ui/card';
import { formatDateTime } from '../../utils/format';

function RatingStars({ rating, size = 'md' }) {
  const iconClass = size === 'lg' ? 'size-6' : 'size-4';
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn(iconClass, n <= rating ? 'fill-amber-400 text-amber-500' : 'text-wg-border dark:text-slate-600')}
          strokeWidth={1.75}
          aria-hidden
        />
      ))}
    </span>
  );
}

/** Customer feedback on a completed job — read-only for partners. */
export function WasherCustomerFeedbackCard({ review, customerName, bookingId, compact = false }) {
  if (!review) {
    return (
      <Card variant="glass" className={cn('border-dashed border-amber-500/25', compact ? '!p-4' : '!p-5')}>
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-200">
            <MessageSquare className="size-5" strokeWidth={1.75} aria-hidden />
          </span>
          <div>
            <h2 className={compact ? 'text-sm font-bold text-wg-text' : 'wg-heading-section'}>Customer feedback</h2>
            <p className="mt-1 text-xs text-wg-muted">
              No rating yet for {customerName ? `${customerName}'s` : 'this'} wash. It will appear here after they submit a
              review.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card
      variant="glass"
      className={cn(
        'border-amber-500/25 bg-gradient-to-br from-amber-500/8 to-transparent',
        compact ? '!p-4' : '!p-5',
      )}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className={compact ? 'text-sm font-bold text-wg-text' : 'wg-heading-section'}>Customer feedback</h2>
          <p className="mt-0.5 text-xs text-wg-muted">
            From <span className="font-semibold text-wg-text">{review.reviewer_name || customerName || 'Customer'}</span>
            {review.created_at ? ` · ${formatDateTime(review.created_at)}` : null}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <RatingStars rating={review.rating} size={compact ? 'md' : 'lg'} />
          <span className="text-sm font-black tabular-nums text-wg-text">{review.rating}/5</span>
        </div>
      </div>
      {review.comment ? (
        <p className="mt-4 rounded-xl border border-wg-border/80 bg-wg-surface-elevated/90 px-4 py-3 text-sm leading-relaxed text-wg-text dark:border-white/10">
          {review.comment}
        </p>
      ) : (
        <p className="mt-3 text-sm italic text-wg-muted">No written comment — stars only.</p>
      )}
      {bookingId && !compact ? (
        <p className="mt-3 text-[10px] font-mono text-wg-muted">Booking {String(bookingId).slice(0, 8)}…</p>
      ) : null}
    </Card>
  );
}

/** Dashboard list item linking to the job. */
export function WasherFeedbackListItem({ review }) {
  const customer = review.reviewer_name || 'Customer';
  return (
    <li>
      <Link to={`/partner/jobs/${review.booking_id}`} className="block">
        <Card variant="glass" className="transition hover:ring-1 hover:ring-amber-500/30">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-bold text-wg-text">{customer}</p>
              <p className="mt-0.5 line-clamp-1 text-xs text-wg-muted">{review.service_address || 'Completed wash'}</p>
              {review.comment ? (
                <p className="mt-2 line-clamp-2 text-xs text-wg-muted">&ldquo;{review.comment}&rdquo;</p>
              ) : null}
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <RatingStars rating={review.rating} />
              <span className="text-[10px] font-bold tabular-nums text-wg-muted">{review.rating}/5</span>
            </div>
          </div>
        </Card>
      </Link>
    </li>
  );
}
