import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { usePartnerSchedule } from '../../../context/PartnerScheduleContext';
import TimelineBookingCard from './TimelineBookingCard';

export default function ScheduleTimeline({ dateKey, isToday }) {
  const { theme } = useTheme();
  const { getBookingsForDate } = usePartnerSchedule();
  const bookings = getBookingsForDate(dateKey);

  return (
    <View style={styles.outer}>
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.eyebrow, { color: theme.text.muted }]}>
            Timeline
          </Text>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            {isToday ? 'Today' : new Date(dateKey).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
          </Text>
        </View>
        <Text style={[styles.count, { color: theme.text.secondary }]}>
          {bookings.length} {bookings.length === 1 ? 'job' : 'jobs'}
        </Text>
      </View>

      {bookings.length === 0 ? (
        <View
          style={[
            styles.emptyCard,
            {
              backgroundColor: theme.customer.surfaceContainerLowest,
              borderColor: theme.customer.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
            No bookings yet
          </Text>
          <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
            New offers near you will land here once accepted.
          </Text>
        </View>
      ) : (
        <View style={styles.list}>
          {bookings.map((b, i) => (
            <TimelineBookingCard key={b.id} booking={b} index={i} />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginTop: 18,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 14,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3, marginTop: 2 },
  count: { fontSize: 12, fontWeight: '700' },
  list: {},
  emptyCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 22,
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  emptyBody: { fontSize: 12, fontWeight: '500', textAlign: 'center', lineHeight: 16 },
});
