import { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { Banknote, CheckCircle2, ListChecks } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getScheduleTokens } from '../../../constants/scheduleTheme';
import { formatPayoutCurrency } from '../../../lib/partnerFormatters';
import { usePartnerSchedule } from '../../../context/PartnerScheduleContext';
import { PARTNER_EARNINGS_PERCENT } from '../../../lib/partnerEarnings';
import AnimatedCounter from '../AnimatedCounter';

export default function EarningsPreviewCard({ dateKey, isToday = true }) {
  const { isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);
  const tokens = getScheduleTokens(isDark);
  const { getDaySummary } = usePartnerSchedule();
  const summary = getDaySummary(dateKey);

  const total = Math.max(1, summary.totalCount);
  const targetPct = Math.max(0, Math.min(1, summary.completedCount / total));
  const remaining = Math.max(0, summary.totalCount - summary.completedCount);

  const progress = useSharedValue(0);
  const [trackWidth, setTrackWidth] = useState(0);

  useEffect(() => {
    if (!trackWidth) return;
    progress.value = 0;
    progress.value = withTiming(targetPct, {
      duration: 620,
      easing: Easing.out(Easing.cubic),
    });
  }, [targetPct, progress, trackWidth]);

  const fillStyle = useAnimatedStyle(() => ({
    width: progress.value * trackWidth,
  }));

  const title = isToday ? 'Earned today' : 'Earned this day';
  const empty = summary.totalCount === 0;

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 280, delay: 80 }}
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
                <Banknote size={12} color="#ffffff" strokeWidth={2.6} />
              </View>
              <Text style={styles.eyebrow}>{title}</Text>
            </View>
            <Text style={styles.percent}>
              {empty ? '—' : `${Math.round(targetPct * 100)}%`}
            </Text>
          </View>

          {empty ? (
            <View style={styles.emptyBlock}>
              <Text style={styles.amount}>₹0.00</Text>
              <Text style={styles.emptyHint}>
                Complete accepted jobs to see your {PARTNER_EARNINGS_PERCENT}% share here.
              </Text>
            </View>
          ) : (
            <>
              <AnimatedCounter
                value={summary.earnedCents}
                duration={700}
                format={(n) => formatPayoutCurrency(n)}
                style={styles.amount}
              />
              <Text style={styles.shareHint}>
                Your {PARTNER_EARNINGS_PERCENT}% share from completed washes
              </Text>
            </>
          )}

          <View
            style={[styles.track, { backgroundColor: tokens.hero.progressTrack }]}
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          >
            <Animated.View
              style={[styles.fill, fillStyle, { backgroundColor: tokens.hero.progressFill }]}
            />
          </View>

          <View style={styles.metricsRow}>
            <View style={styles.metric}>
              <View style={styles.metricIcon}>
                <CheckCircle2 size={12} color="#ffffff" strokeWidth={2.6} />
              </View>
              <Text style={styles.metricValue}>{summary.completedCount}</Text>
              <Text style={styles.metricLabel}>Done</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <View style={styles.metricIcon}>
                <ListChecks size={12} color="#ffffff" strokeWidth={2.6} />
              </View>
              <Text style={styles.metricValue}>{remaining}</Text>
              <Text style={styles.metricLabel}>Remaining</Text>
            </View>
            <View style={styles.metricDivider} />
            <View style={styles.metric}>
              <View style={styles.metricIcon}>
                <Banknote size={12} color="#ffffff" strokeWidth={2.6} />
              </View>
              <Text style={styles.metricValue}>{summary.totalCount}</Text>
              <Text style={styles.metricLabel}>Accepted</Text>
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
    marginTop: 18,
  },
  card: {
    borderRadius: 24,
    overflow: 'hidden',
  },
  inner: {
    padding: 18,
    gap: 10,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eyebrowRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  percent: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  amount: {
    color: '#ffffff',
    fontSize: 30,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  shareHint: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 11,
    fontWeight: '600',
    marginTop: -4,
  },
  emptyBlock: { gap: 6 },
  emptyHint: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    fontWeight: '600',
    lineHeight: 17,
  },
  track: {
    height: 8,
    borderRadius: 999,
    overflow: 'hidden',
    marginTop: 4,
  },
  fill: {
    height: '100%',
    borderRadius: 999,
  },
  metricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 8,
  },
  metric: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  metricIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
  },
  metricValue: { color: '#ffffff', fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  metricLabel: {
    color: 'rgba(255,255,255,0.78)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
});
