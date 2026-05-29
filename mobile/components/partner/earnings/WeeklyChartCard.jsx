import { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
  Line,
} from 'react-native-svg';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../context/ThemeContext';
import { getEarningsTokens } from '../../../constants/earningsTheme';
import { formatPayoutCurrency } from '../../../lib/partnerFormatters';
import { usePartnerEarnings } from '../../../context/PartnerEarningsContext';
import { buildSmoothChartPath } from './chartPath';
import CardSurface from '../../ui/CardSurface';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const CHART_HEIGHT = 168;
const CARD_PADDING_X = 18;
const CARD_PADDING_Y = 18;
const LABEL_HEIGHT = 22;

export default function WeeklyChartCard() {
  const { theme, isDark } = useTheme();
  const tokens = getEarningsTokens(isDark);
  const { weeklySeries, thisWeek } = usePartnerEarnings();

  const [chartWidth, setChartWidth] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState(() => {
    const idx = weeklySeries.findIndex((d) => d.day === thisWeek.bestDay);
    return Math.max(0, idx);
  });

  const seriesValues = useMemo(
    () => weeklySeries.map((d) => d.cents),
    [weeklySeries],
  );

  const { line, area, points, pathLength } = useMemo(() => {
    if (!chartWidth) {
      return { line: '', area: '', points: [], pathLength: 1 };
    }
    const built = buildSmoothChartPath(seriesValues, {
      width: chartWidth,
      height: CHART_HEIGHT,
      padY: 14,
    });
    const approx = built.points.reduce((acc, p, i) => {
      if (i === 0) return 0;
      const prev = built.points[i - 1];
      return acc + Math.hypot(p.x - prev.x, p.y - prev.y);
    }, 0);
    return {
      ...built,
      pathLength: Math.max(approx * 1.2, 1),
    };
  }, [chartWidth, seriesValues]);

  const reveal = useSharedValue(0);
  const fillReveal = useSharedValue(0);
  const dotX = useSharedValue(0);
  const dotY = useSharedValue(0);

  useEffect(() => {
    if (!chartWidth || !points.length) return;
    reveal.value = 0;
    fillReveal.value = 0;
    reveal.value = withTiming(1, { duration: 750, easing: Easing.out(Easing.cubic) });
    fillReveal.value = withTiming(1, { duration: 380, easing: Easing.out(Easing.quad) });
  }, [chartWidth, points.length, reveal, fillReveal]);

  useEffect(() => {
    const sel = points[selectedIndex];
    if (!sel) return;
    dotX.value = withTiming(sel.x, { duration: 240, easing: Easing.out(Easing.cubic) });
    dotY.value = withTiming(sel.y, { duration: 240, easing: Easing.out(Easing.cubic) });
  }, [selectedIndex, points, dotX, dotY]);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDasharray: [pathLength, pathLength],
    strokeDashoffset: pathLength * (1 - reveal.value),
  }));

  const animatedAreaProps = useAnimatedProps(() => ({
    opacity: fillReveal.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: dotX.value - 8 },
      { translateY: dotY.value - 8 },
    ],
    opacity: reveal.value,
  }));

  const guideStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dotX.value }],
    opacity: reveal.value * 0.55,
  }));

  const selected = weeklySeries[selectedIndex];
  const labelStep = chartWidth / Math.max(1, weeklySeries.length);

  const handlePickDay = (i) => {
    if (i === selectedIndex) return;
    Haptics.selectionAsync().catch(() => {});
    setSelectedIndex(i);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 280, delay: 80 }}
      style={styles.outer}
    >
      <CardSurface
        borderRadius={22}
        backgroundColor={theme.customer.surfaceContainerLowest}
        shadow="rim"
        portal="partner"
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={[styles.eyebrow, { color: theme.text.muted }]}>
              Weekly trend
            </Text>
            <Text style={[styles.title, { color: theme.text.primary }]}>
              {selected?.day} · {formatPayoutCurrency(selected?.cents ?? 0)}
            </Text>
          </View>
          <View style={[styles.jobsPill, { backgroundColor: theme.customer.primaryBg }]}>
            <Text style={[styles.jobsPillText, { color: theme.accent.primary }]}>
              {selected?.jobs ?? 0} jobs
            </Text>
          </View>
        </View>

        <View
          style={[styles.chartArea, { height: CHART_HEIGHT }]}
          onLayout={(e) => setChartWidth(e.nativeEvent.layout.width)}
        >
          {chartWidth > 0 && points.length > 0 ? (
            <>
              <Svg width={chartWidth} height={CHART_HEIGHT}>
                <Defs>
                  <SvgLinearGradient id="weekly-area" x1="0" y1="0" x2="0" y2="1">
                    <Stop offset="0" stopColor={tokens.chart.areaTop} stopOpacity={1} />
                    <Stop offset="1" stopColor={tokens.chart.areaBottom} stopOpacity={1} />
                  </SvgLinearGradient>
                </Defs>

                {[0.25, 0.5, 0.75].map((ratio) => {
                  const y = ratio * CHART_HEIGHT;
                  return (
                    <Line
                      key={ratio}
                      x1={0}
                      x2={chartWidth}
                      y1={y}
                      y2={y}
                      stroke={tokens.chart.gridLine}
                      strokeWidth={1}
                    />
                  );
                })}

                <AnimatedPath
                  d={area}
                  fill="url(#weekly-area)"
                  animatedProps={animatedAreaProps}
                />
                <AnimatedPath
                  d={line}
                  stroke={tokens.chart.strokeGlow}
                  strokeWidth={6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  animatedProps={animatedLineProps}
                />
                <AnimatedPath
                  d={line}
                  stroke={tokens.chart.stroke}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                  animatedProps={animatedLineProps}
                />
              </Svg>

              <Animated.View
                pointerEvents="none"
                style={[styles.guide, guideStyle, { backgroundColor: tokens.chart.gridLine }]}
              />
              <Animated.View pointerEvents="none" style={[styles.dotOuter, dotStyle]}>
                <View
                  style={[
                    styles.dotRing,
                    { backgroundColor: tokens.chart.dotRing },
                  ]}
                />
                <View
                  style={[
                    styles.dotInner,
                    {
                      backgroundColor: tokens.chart.dot,
                      borderColor: theme.customer.surfaceContainerLowest,
                    },
                  ]}
                />
              </Animated.View>

              <View pointerEvents="box-none" style={StyleSheet.absoluteFill}>
                {weeklySeries.map((d, i) => (
                  <Pressable
                    key={`${d.day}-${i}`}
                    onPress={() => handlePickDay(i)}
                    accessibilityLabel={`${d.day} earnings`}
                    style={[
                      styles.tapStrip,
                      {
                        left: i * labelStep,
                        width: labelStep,
                      },
                    ]}
                  />
                ))}
              </View>
            </>
          ) : null}
        </View>

        <View style={styles.labelsRow}>
          {weeklySeries.map((d, i) => {
            const isActive = i === selectedIndex;
            return (
              <Pressable
                key={`${d.day}-${i}`}
                onPress={() => handlePickDay(i)}
                style={styles.labelCell}
                accessibilityLabel={`${d.day} earnings`}
              >
                <Text
                  style={[
                    styles.labelText,
                    {
                      color: isActive ? tokens.chart.labelActive : tokens.chart.label,
                      fontWeight: isActive ? '800' : '600',
                    },
                  ]}
                >
                  {d.day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </CardSurface>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  outer: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  card: {
    paddingHorizontal: CARD_PADDING_X,
    paddingVertical: CARD_PADDING_Y,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
    marginTop: 2,
  },
  jobsPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  jobsPillText: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  chartArea: {
    position: 'relative',
    overflow: 'hidden',
  },
  labelsRow: {
    flexDirection: 'row',
    marginTop: 8,
    marginBottom: 2,
    height: LABEL_HEIGHT,
    alignItems: 'center',
  },
  labelCell: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  labelText: {
    fontSize: 11,
    letterSpacing: 0.4,
  },
  guide: {
    position: 'absolute',
    top: 6,
    bottom: 6,
    width: 1,
  },
  dotOuter: {
    position: 'absolute',
    width: 16,
    height: 16,
  },
  dotRing: {
    position: 'absolute',
    top: -4,
    left: -4,
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  dotInner: {
    position: 'absolute',
    top: 3,
    left: 3,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  tapStrip: {
    position: 'absolute',
    top: 0,
    bottom: 0,
  },
});
