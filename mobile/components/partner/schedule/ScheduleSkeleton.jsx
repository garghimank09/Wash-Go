import { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../../context/ThemeContext';
import { getScheduleTokens } from '../../../constants/scheduleTheme';

function Shimmer({ width, height, radius = 12, style }) {
  const { isDark } = useTheme();
  const tokens = getScheduleTokens(isDark);
  const opacity = useSharedValue(0.45);

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(0.85, { duration: 850, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: tokens.skeleton.base,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export default function ScheduleSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Shimmer width="42%" height={12} />
        <Shimmer width="60%" height={30} style={{ marginTop: 14 }} />
        <View style={styles.heroPills}>
          <Shimmer width={120} height={22} radius={11} />
          <Shimmer width={140} height={22} radius={11} />
        </View>
      </View>

      <View style={styles.daysRow}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Shimmer key={i} width={60} height={72} radius={18} />
        ))}
      </View>

      <View style={styles.timeline}>
        {Array.from({ length: 3 }).map((_, i) => (
          <View key={i} style={styles.timelineRow}>
            <View style={styles.timelineCol}>
              <Shimmer width={18} height={18} radius={9} />
              <Shimmer width={32} height={10} style={{ marginTop: 8 }} />
            </View>
            <Shimmer width="100%" height={100} radius={18} style={{ flex: 1 }} />
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8 },
  hero: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 20,
    borderRadius: 28,
    backgroundColor: 'rgba(15,23,42,0.04)',
    minHeight: 168,
  },
  heroPills: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  daysRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginTop: 14,
    gap: 8,
  },
  timeline: {
    marginTop: 18,
    paddingHorizontal: 20,
    gap: 10,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
  },
  timelineCol: {
    width: 50,
    alignItems: 'center',
    paddingTop: 8,
  },
});
