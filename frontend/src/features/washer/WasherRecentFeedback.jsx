import { useCallback, useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';

import { partnerBookingsService } from '../../services/partnerBookingsService';
import { getErrorMessage } from '../../services/api';
import { Card } from '../../ui/card';
import { WasherFeedbackListItem } from './WasherCustomerFeedbackCard';

export function WasherRecentFeedback({ limit = 5 }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await partnerBookingsService.listMyReviews();
      setItems((data.items || []).slice(0, limit));
    } catch (e) {
      setError(getErrorMessage(e));
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-black uppercase tracking-[0.14em] text-wg-muted">Customer feedback</h2>
        {!loading && items.length > 0 ? (
          <span className="text-xs font-bold tabular-nums text-wg-muted">{items.length} recent</span>
        ) : null}
      </div>
      {error ? <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p> : null}
      {loading ? (
        <div className="h-24 animate-pulse rounded-2xl bg-wg-border/30 dark:bg-white/5" />
      ) : items.length === 0 ? (
        <Card variant="glass" className="border-dashed border-amber-500/20 py-8 text-center">
          <MessageSquare className="mx-auto size-8 text-amber-600/60 dark:text-amber-400/60" strokeWidth={1.5} aria-hidden />
          <p className="mt-2 text-sm font-bold text-wg-text">No feedback yet</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-wg-muted">
            When customers rate completed washes, their comments show up here and on each job.
          </p>
        </Card>
      ) : (
        <ul className="space-y-2">
          {items.map((r) => (
            <WasherFeedbackListItem key={r.id} review={r} />
          ))}
        </ul>
      )}
    </section>
  );
}
