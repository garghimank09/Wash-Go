import { useEffect, useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
  Circle,
} from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Route, Clock4, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getScheduleTokens, getTrafficTokens } from '../../../constants/scheduleTheme';
import { formatPayoutCurrency, formatBookingTime } from '../../../lib/partnerFormatters';
import { usePartnerSchedule } from '../../../context/PartnerScheduleContext';
import { buildSmoothChartPath } from '../earnings/chartPath';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CHART_HEIGHT = 84;

export default function RouteSummaryCard() {
  const { theme, isDark } = useTheme();
  const tokens = getScheduleTokens(isDark);
  const { routePlan } = usePartnerSchedule();
  const traffic = getTrafficTokens(routePlan.traffic, isDark);
  const shadows = getPartnerShadow(isDark);

  const [chartWidth, setChartWidth] = useState(0);

  // Build a soft waveform across N stops so the route line looks natural.
  const values = useMemo(() => {
    const n = Math.max(2, routePlan.stops.length);
    const center = (n - 1) / 2;
    return routePlan.stops.map((_, i) => {
      const dist = Math.abs(i - center);
      // dome shape, slightly offset so it doesn't look like a perfect smile
      return Math.cos(dist / center) * 60 + (i % 2 === 0 ? 6 : -4);
    });
  }, [routePlan.stops]);

  const { line, points, pathLength } = useMemo(() => {
    if (!chartWidth) {
      return { line: '', points: [], pathLength: 1 };
    }
    const built = buildSmoothChartPath(values, {
      width: chartWidth - 24,
      height: CHART_HEIGHT - 16,
      padY: 12,
    });
    const length = built.points.reduce((acc, p, i) => {
      if (i === 0) return 0;
      const prev = built.points[i - 1];
      return acc + Math.hypot(p.x - prev.x, p.y - prev.y);
    }, 0);
    return {
      ...built,
      pathLength: Math.max(length * 1.2, 1),
    };
  }, [chartWidth, values]);

  const reveal = useSharedValue(0);

  useEffect(() => {
    if (!chartWidth || !points.length) return;
    reveal.value = 0;
    reveal.value = withTiming(1, { duration: 720, easing: Easing.out(Easing.cubic) });
  }, [chartWidth, points.length, reveal]);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDasharray: [pathLength, pathLength],
    strokeDashoffset: pathLength * (1 - reveal.value),
  }));

  const handlePress = () => {
    Haptics.selectionAsync().catch(() => {});
  };

  const stopColors = (status) => {
    if (status === 'completed') return tokens.route.stopDone;
    if (status === 'in_progress' || status === 'en_route') return tokens.route.stopActive;
    return tokens.route.stopUpcoming;
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 280, delay: 60 }}
      style={styles.outer}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: theme.customer.surfaceContainerLowest,
            borderColor: theme.customer.outlineVariant,
          },
          shadows.rim,
          pressed && { opacity: 0.94 },
        ]}
      >
        <LinearGradient
          pointerEvents="none"
          colors={tokens.route.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconWrap, { backgroundColor: theme.customer.primaryBg }]}>
              <Route size={16} color={theme.accent.primary} strokeWidth={2.4} />
            </View>
            <View>
              <Text style={[styles.eyebrow, { color: theme.text.muted }]}>
                Optimized route
              </Text>
              <Text style={[styles.title, { color: theme.text.primary }]}>
                {routePlan.stops.length} stops{routePlan.distanceKm != null ? ` · ${routePlan.distanceKm} km` : ''}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={theme.text.muted} strokeWidth={2} />
        </View>

        <View
          style={[styles.chartArea, { height: CHART_HEIGHT }]}
          onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
        >
          {chartWidth > 0 && points.length > 0 ? (
            <Svg width={chartWidth} height={CHART_HEIGHT}>
              <Defs>
                <SvgLinearGradient id="route-line" x1="0" y1="0" x2="1" y2="0">
                  <Stop offset="0" stopColor={tokens.route.stroke} stopOpacity={0.85} />
                  <Stop offset="1" stopColor={tokens.route.stroke} stopOpacity={1} />
                </SvgLinearGradient>
              </Defs>
              <AnimatedPath
                d={line}
                stroke={tokens.route.strokeGlow}
                strokeWidth={6}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                animatedProps={animatedLineProps}
                transform="translate(12, 8)"
              />
              <AnimatedPath
                d={line}
                stroke="url(#route-line)"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                animatedProps={animatedLineProps}
                transform="translate(12, 8)"
              />
              {routePlan.stops.map((stop, i) => {
                const p = points[i];
                if (!p) return null;
                return (
                  <Circle
                    key={stop.id}
                    cx={p.x + 12}
                    cy={p.y + 8}
                    r={5}
                    fill={stopColors(stop.status)}
                    stroke={theme.customer.surfaceContainerLowest}
                    strokeWidth={2}
                  />
                );
              })}
            </Svg>
          ) : null}
        </View>

        <View style={styles.stopsRow}>
          {routePlan.stops.slice(0, 4).map((stop) => (
            <View key={stop.id} style={styles.stopCell}>
              <Text
                style={[styles.stopTime, { color: theme.text.muted }]}
                numberOfLines={1}
              >
                {formatBookingTime(stop.time)}
              </Text>
              <Text
                style={[styles.stopLabel, { color: theme.text.secondary }]}
                numberOfLines={1}
              >
                {stop.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={[styles.footer, { borderTopColor: theme.customer.outlineVariant }]}>
          <View style={styles.footerCell}>
            <Text style={[styles.footerLabel, { color: theme.text.muted }]}>
              Drive time
            </Text>
            <View style={styles.footerInline}>
              <Clock4 size={12} color={theme.text.secondary} strokeWidth={2.4} />
              <Text style={[styles.footerValue, { color: theme.text.primary }]}>
                {routePlan.driveMins != null ? `${routePlan.driveMins}m` : '—'}
              </Text>
            </View>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerCell}>
            <Text style={[styles.footerLabel, { color: theme.text.muted }]}>
              Traffic
            </Text>
            <View style={[styles.trafficPill, { backgroundColor: traffic.bg }]}>
              <View style={[styles.trafficDot, { backgroundColor: traffic.fg }]} />
              <Text style={[styles.trafficText, { color: traffic.fg }]}>
                {traffic.label}
              </Text>
            </View>
          </View>
          <View style={styles.footerDivider} />
          <View style={styles.footerCell}>
            <Text style={[styles.footerLabel, { color: theme.text.muted }]}>
              Projected
            </Text>
            <Text style={[styles.footerValueStrong, { color: theme.text.primary }]}>
              {formatPayoutCurrency(routePlan.projectedPayoutCents)}
            </Text>
          </View>
        </View>
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  title: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2, marginTop: 1 },
  chartArea: {
    width: '100%',
    overflow: 'hidden',
  },
  stopsRow: {
    flexDirection: 'row',
    paddingHorizontal: 6,
  },
  stopCell: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  stopTime: { fontSize: 10, fontWeight: '700', letterSpacing: 0.4 },
  stopLabel: { fontSize: 10, fontWeight: '600', maxWidth: 80 },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    paddingTop: 12,
    gap: 10,
  },
  footerCell: { flex: 1, gap: 4 },
  footerLabel: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  footerInline: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerValue: { fontSize: 13, fontWeight: '800', letterSpacing: -0.2 },
  footerValueStrong: { fontSize: 14, fontWeight: '800', letterSpacing: -0.3 },
  footerDivider: { width: 1, height: 24, backgroundColor: 'rgba(15,23,42,0.06)' },
  trafficPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  trafficDot: { width: 5, height: 5, borderRadius: 3 },
  trafficText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.2 },
});
