import { useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { Star } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';

function Stars({ value, onChange, disabled, theme }) {
  return (
    <View style={styles.starsRow}>
      {[1, 2, 3, 4, 5].map((n) => {
        const active = n <= value;
        return (
          <Pressable
            key={n}
            disabled={disabled}
            onPress={() => onChange(n)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.starBtn,
              pressed && !disabled && { opacity: 0.85 },
              disabled && { opacity: 0.6 },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${n} star${n === 1 ? '' : 's'}`}
          >
            <Star
              size={28}
              color={active ? '#f59e0b' : theme.customer.outline}
              fill={active ? '#fbbf24' : 'transparent'}
              strokeWidth={1.9}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function BookingReviewCard({
  bookingId,
  washerName,
  review,
  onSubmitted,
}) {
  const { theme } = useTheme();
  const toast = useToast();
  const c = theme.customer;
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const s = useMemo(() => stylesFor(theme), [theme]);

  if (review?.rating != null) {
    return (
      <View style={[s.card, { borderColor: '#f59e0b33' }]}>
        <Text style={s.title}>Your feedback</Text>
        <Text style={s.subtitle}>
          Thanks - your review for {washerName || 'your washer'} helps us keep quality high.
        </Text>
        <View style={styles.submittedStars}>
          {[1, 2, 3, 4, 5].map((n) => (
            <Star
              key={n}
              size={18}
              color={n <= review.rating ? '#f59e0b' : c.outline}
              fill={n <= review.rating ? '#fbbf24' : 'transparent'}
              strokeWidth={1.9}
            />
          ))}
          <Text style={[s.ratingText, { marginLeft: 8 }]}>{review.rating}/5</Text>
        </View>
        {review.comment ? (
          <View style={s.submittedComment}>
            <Text style={s.commentText}>{review.comment}</Text>
          </View>
        ) : null}
      </View>
    );
  }

  const needsComment = rating > 0 && rating <= 2;

  const handleSubmit = async () => {
    if (rating < 1) {
      toast.error('Tap a star rating first.');
      return;
    }
    if (needsComment && comment.trim().length < 8) {
      toast.error('Please add a few words about what went wrong (8+ characters).');
      return;
    }
    setSubmitting(true);
    try {
      await bookingService.submitReview(bookingId, {
        rating,
        comment: comment.trim() || null,
      });
      toast.success('Thanks for your feedback!');
      onSubmitted?.();
    } catch (err) {
      toast.error(err?.message || 'Could not submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={s.card}>
      <Text style={s.title}>Rate your wash</Text>
      <Text style={s.subtitle}>
        How was {washerName ? `${washerName}'s` : 'your'} service? Your rating updates their
        profile for future bookings.
      </Text>
      <Stars value={rating} onChange={setRating} disabled={submitting} theme={theme} />
      <Text style={s.commentLabel}>
        Comments {needsComment ? '(required for low ratings)' : '(optional)'}
      </Text>
      <TextInput
        value={comment}
        onChangeText={setComment}
        editable={!submitting}
        multiline
        numberOfLines={3}
        maxLength={2000}
        placeholder="What went well, or what could be better?"
        placeholderTextColor={theme.text.muted}
        style={s.input}
      />
      <Pressable
        onPress={handleSubmit}
        disabled={submitting || rating < 1}
        style={({ pressed }) => [
          s.submitBtn,
          (submitting || rating < 1) && s.submitBtnDisabled,
          pressed && !(submitting || rating < 1) && { opacity: 0.9 },
        ]}
      >
        {submitting ? (
          <ActivityIndicator color={theme.button.primary.text} />
        ) : (
          <Text style={s.submitText}>Submit feedback</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  starsRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 4,
  },
  starBtn: {
    padding: 2,
  },
  submittedStars: {
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const stylesFor = (theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.customer.surfaceContainerLowest,
      borderRadius: 16,
      borderWidth: 1,
      borderColor: theme.customer.outlineVariant + '80',
      padding: 16,
      marginTop: 4,
    },
    title: {
      fontSize: 18,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.2,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 13,
      color: theme.text.secondary,
      lineHeight: 19,
    },
    commentLabel: {
      marginTop: 12,
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 0.6,
      color: theme.text.muted,
      textTransform: 'uppercase',
    },
    input: {
      marginTop: 8,
      borderWidth: 1,
      borderColor: theme.customer.outlineVariant,
      borderRadius: 12,
      paddingHorizontal: 12,
      paddingVertical: 10,
      minHeight: 88,
      fontSize: 14,
      color: theme.text.primary,
      textAlignVertical: 'top',
      backgroundColor: theme.customer.surface,
    },
    submitBtn: {
      marginTop: 12,
      borderRadius: theme.radius.full,
      backgroundColor: theme.accent.primary,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 13,
    },
    submitBtnDisabled: {
      opacity: 0.55,
    },
    submitText: {
      fontSize: 14,
      fontWeight: '800',
      color: theme.button.primary.text,
    },
    ratingText: {
      fontSize: 13,
      fontWeight: '700',
      color: theme.text.primary,
    },
    submittedComment: {
      marginTop: 10,
      borderWidth: 1,
      borderColor: theme.customer.outlineVariant,
      borderRadius: 12,
      backgroundColor: theme.customer.surface,
      padding: 10,
    },
    commentText: {
      fontSize: 13,
      color: theme.text.primary,
      lineHeight: 18,
    },
  });
