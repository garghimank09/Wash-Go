import { useEffect, useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { buildSmoothChartPath } from './chartPath';

const AnimatedPath = Animated.createAnimatedComponent(Path);

/**
 * Small inline sparkline used in the hero card. No labels, no dots — purely
 * a soft accent stroke + gradient area. Animated stroke reveal on mount.
 */
export default function MiniSparkline({
  values,
  width = 96,
  height = 32,
  stroke = '#ffffff',
  fillTop = 'rgba(255,255,255,0.45)',
  fillBottom = 'rgba(255,255,255,0)',
  strokeWidth = 1.6,
  duration = 720,
  gradientId = 'mini-sparkline-grad',
}) {
  const progress = useSharedValue(0);

  const { line, area, length } = useMemo(() => {
    const built = buildSmoothChartPath(values, { width, height, padY: 4 });
    const approxLength = built.points.reduce((acc, p, i) => {
      if (i === 0) return 0;
      const prev = built.points[i - 1];
      return acc + Math.hypot(p.x - prev.x, p.y - prev.y);
    }, 0);
    return {
      line: built.line,
      area: built.area,
      length: Math.max(approxLength * 1.15, 1),
    };
  }, [values, width, height]);

  useEffect(() => {
    progress.value = 0;
    progress.value = withTiming(1, {
      duration,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, duration, line]);

  const animatedLineProps = useAnimatedProps(() => ({
    strokeDasharray: [length, length],
    strokeDashoffset: length * (1 - progress.value),
  }));

  const animatedAreaProps = useAnimatedProps(() => ({
    opacity: progress.value,
  }));

  return (
    <View style={[styles.wrap, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height}>
        <Defs>
          <LinearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={fillTop} stopOpacity={1} />
            <Stop offset="1" stopColor={fillBottom} stopOpacity={1} />
          </LinearGradient>
        </Defs>
        <AnimatedPath
          d={area}
          fill={`url(#${gradientId})`}
          animatedProps={animatedAreaProps}
        />
        <AnimatedPath
          d={line}
          stroke={stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
          animatedProps={animatedLineProps}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
});
