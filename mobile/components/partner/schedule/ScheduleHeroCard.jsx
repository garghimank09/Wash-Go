import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { CalendarDays } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getScheduleTokens, getScheduleStatus } from '../../../constants/scheduleTheme';
import { formatPayoutCurrency, formatBookingTime } from '../../../lib/partnerFormatters';
import { usePartnerSchedule } from '../../../context/PartnerScheduleContext';
import AnimatedCounter from '../AnimatedCounter';

export default function ScheduleHeroCard({ dateKey }) {
  const { isDark } = useTheme();
  const tokens = getScheduleTokens(isDark);
  const shadows = getPartnerShadow(isDark);
  const { getBookingsForDate } = usePartnerSchedule();

  const bookings = getBookingsForDate(dateKey);
  const completed = bookings.filter((b) => b.status === 'completed').length;
  const active = bookings.filter((b) => b.status === 'en_route' || b.status === 'in_progress').length;
  const upcoming = bookings.filter((b) => b.status === 'scheduled');
  const projected = bookings.reduce((sum, b) => sum + b.priceCents, 0);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 280 }}
      style={styles.outer}
    >
      <View style={[styles.card, shadows.soft]}>
        <LinearGradient
          colors={tokens.hero.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[tokens.hero.softTop, 'rgba(255,255,255,0)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.inner}>
          <View style={styles.topRow}>
            <View style={styles.eyebrowRow}>
              <View style={styles.eyebrowIcon}>
                <CalendarDays size={12} color="#ffffff" strokeWidth={2.6} />
              </View>
              <Text style={styles.eyebrow}>Today’s schedule</Text>
            </View>
            <View style={styles.activeChip}>
              <View style={styles.activeDot} />
              <Text style={styles.activeText}>
                {active > 0 ? `${active} active` : 'On standby'}
              </Text>
            </View>
          </View>

          <View style={styles.amountRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.amountLabel}>Projected</Text>
              <AnimatedCounter
                value={projected}
                duration={700}
                format={(n) => formatPayoutCurrency(n)}
                style={styles.amount}
              />
            </View>
            <View style={styles.statBlock}>
              <Text style={styles.statValue}>
                {completed}/{bookings.length}
              </Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
          </View>

          <View style={styles.upcomingRow}>
            <Text style={styles.upcomingLabel}>Next up</Text>
            <View style={styles.upcomingPills}>
              {upcoming.slice(0, 3).map((b) => {
                const statusTokens = getScheduleStatus(b.status, isDark);
                return (
                  <View key={b.id} style={styles.upcomingPill}>
                    <View
                      style={[
                        styles.upcomingDot,
                        { backgroundColor: statusTokens.dot },
                      ]}
                    />
                    <Text style={styles.upcomingText}>
                      {formatBookingTime(b.time)} · {b.packageLabel}
                    </Text>
                  </View>
                );
              })}
              {upcoming.length === 0 ? (
                <Text style={styles.emptyUpcoming}>No upcoming jobs</Text>
              ) : null}
            </View>
          </View>
        </View>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 20,
    marginTop: 14,
  },
  card: {
    borderRadius: 28,
    overflow: 'hidden',
  },
  inner: {
    padding: 20,
    gap: 16,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrowRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  eyebrowIcon: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  eyebrow: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  activeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.30)',
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#ffffff',
  },
  activeText: { color: '#ffffff', fontSize: 11, fontWeight: '800', letterSpacing: 0.2 },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 18,
  },
  amountLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  amount: {
    color: '#ffffff',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1.0,
  },
  statBlock: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.20)',
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  statLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  upcomingRow: {
    gap: 8,
  },
  upcomingLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  upcomingPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  upcomingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.16)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  upcomingDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  upcomingText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
  emptyUpcoming: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 12,
    fontWeight: '600',
  },
});
