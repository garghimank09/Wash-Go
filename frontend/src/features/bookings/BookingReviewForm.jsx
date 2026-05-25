import { useState } from 'react';
import toast from 'react-hot-toast';
import { Star } from 'lucide-react';

import { bookingsService } from '../../services/bookingsService';
import { getErrorMessage } from '../../services/api';
import { Button } from '../../ui/button';
import { Card } from '../../ui/card';
import { cn } from '../../lib/cn';

function StarRating({ value, onChange, disabled }) {
  return (
    <div className="flex gap-1" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={disabled}
          aria-label={`${n} star${n === 1 ? '' : 's'}`}
          aria-pressed={value === n}
          onClick={() => onChange(n)}
          className={cn(
            'wg-focus-ring rounded-lg p-1 transition',
            disabled && 'cursor-not-allowed opacity-50',
          )}
        >
          <Star
            className={cn(
              'size-8',
              n <= value ? 'fill-amber-400 text-amber-500' : 'text-wg-border dark:text-slate-600',
            )}
            strokeWidth={1.75}
          />
        </button>
      ))}
    </div>
  );
}

export function BookingReviewSubmitted({ review, washerName }) {
  return (
    <Card variant="glass" className="border-amber-500/25 bg-gradient-to-br from-amber-500/8 to-transparent">
      <h2 className="wg-heading-section">Your feedback</h2>
      <p className="mt-1 text-sm text-wg-muted">
        Thanks — your review for {washerName || 'your washer'} helps us keep quality high.
      </p>
      <div className="mt-4 flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <Star
            key={n}
            className={cn(
              'size-5',
              n <= review.rating ? 'fill-amber-400 text-amber-500' : 'text-wg-border',
            )}
            strokeWidth={1.75}
            aria-hidden
          />
        ))}
        <span className="ml-2 text-sm font-bold text-wg-text">{review.rating}/5</span>
      </div>
      {review.comment ? (
        <p className="mt-3 rounded-xl border border-wg-border/80 bg-wg-surface-elevated/80 px-4 py-3 text-sm text-wg-text dark:border-white/10">
          {review.comment}
        </p>
      ) : null}
    </Card>
  );
}

export function BookingReviewForm({ bookingId, washerName, onSubmitted }) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating < 1) {
      toast.error('Tap a star rating first.');
      return;
    }
    if (rating <= 2 && comment.trim().length < 8) {
      toast.error('Please add a few words about what went wrong (8+ characters).');
      return;
    }
    setSubmitting(true);
    try {
      const review = await bookingsService.submitReview(bookingId, {
        rating,
        comment: comment.trim() || null,
      });
      toast.success('Thanks for your feedback!');
      onSubmitted?.(review);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card variant="glass" className="border-amber-500/20">
      <h2 className="wg-heading-section">Rate your wash</h2>
      <p className="mt-1 text-sm text-wg-muted">
        How was {washerName ? `${washerName}'s` : 'your'} service? Your rating updates their profile for future
        bookings.
      </p>
      <form className="mt-5 space-y-4" onSubmit={(e) => void handleSubmit(e)}>
        <StarRating value={rating} onChange={setRating} disabled={submitting} />
        <div>
          <label htmlFor="review-comment" className="text-xs font-bold uppercase tracking-wide text-wg-muted">
            Comments {rating <= 2 && rating > 0 ? '(required for low ratings)' : '(optional)'}
          </label>
          <textarea
            id="review-comment"
            rows={3}
            maxLength={2000}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            disabled={submitting}
            placeholder="What went well, or what could be better?"
            className="mt-2 w-full resize-y rounded-xl border border-wg-border bg-wg-surface-elevated px-4 py-3 text-sm text-wg-text placeholder:text-wg-muted wg-focus-ring dark:border-white/15 dark:bg-white/[0.04]"
          />
        </div>
        <Button type="submit" variant="primary" loading={submitting} disabled={rating < 1}>
          Submit feedback
        </Button>
      </form>
    </Card>
  );
}
