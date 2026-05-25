import { Link } from 'react-router-dom';
import { MessageSquare, Star } from 'lucide-react';

import { Card } from '../../../ui/card';
import { EmptyState } from '../../../ui/empty-state';
import { cn } from '../../../lib/cn';
import { formatDateTime } from '../../../utils/format';

function RatingStars({ rating }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          className={cn('size-3.5', n <= rating ? 'fill-amber-400 text-amber-500' : 'text-wg-border')}
          strokeWidth={1.75}
          aria-hidden
        />
      ))}
    </span>
  );
}

export function AdminReviewsTable({ rows, loading }) {
  if (loading) {
    return (
      <Card variant="enterprise" className="min-w-0 p-8">
        <p className="text-center text-sm text-wg-muted">Loading customer feedback…</p>
      </Card>
    );
  }

  if (!rows?.length) {
    return (
      <Card variant="enterprise" className="min-w-0 p-8">
        <EmptyState
          icon={MessageSquare}
          title="No washer feedback yet"
          description="When customers rate completed washes, reviews appear here with ratings and comments."
        />
      </Card>
    );
  }

  return (
    <Card variant="enterprise" className="wg-admin-accent-revenue min-w-0 overflow-hidden p-0">
      <div className="border-b border-wg-border px-4 py-3">
        <h2 className="wg-heading-section">Washer feedback</h2>
        <p className="mt-0.5 text-xs text-wg-muted">Post-wash ratings from customers — updates partner profiles.</p>
      </div>
      <div className="wg-admin-table-wrap max-h-[min(420px,50vh)] overflow-y-auto">
        <table className="wg-admin-table min-w-[720px]">
          <thead className="wg-admin-table-head">
            <tr>
              <th className="wg-admin-table-th">Rating</th>
              <th className="wg-admin-table-th">Customer</th>
              <th className="wg-admin-table-th">Washer</th>
              <th className="wg-admin-table-th">Comment</th>
              <th className="wg-admin-table-th">When</th>
              <th className="wg-admin-table-th">Booking</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="wg-admin-table-row">
                <td className="wg-admin-table-td whitespace-nowrap">
                  <RatingStars rating={r.rating} />
                  <span className="ml-1 text-xs font-bold tabular-nums text-wg-text">{r.rating}/5</span>
                </td>
                <td className="wg-admin-table-td font-semibold">{r.reviewer_name || '—'}</td>
                <td className="wg-admin-table-td">{r.reviewee_name || '—'}</td>
                <td className="wg-admin-table-td max-w-xs">
                  <p className="line-clamp-2 text-wg-muted">{r.comment || '—'}</p>
                </td>
                <td className="wg-admin-table-td whitespace-nowrap text-xs text-wg-muted">
                  {formatDateTime(r.created_at)}
                </td>
                <td className="wg-admin-table-td whitespace-nowrap">
                  <Link
                    to={`/admin/bookings`}
                    className="font-mono text-[11px] font-bold text-cyan-700 hover:underline dark:text-cyan-300"
                    title={r.service_address || undefined}
                  >
                    {String(r.booking_id).slice(0, 8)}…
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
