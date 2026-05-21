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
import { getJobTokens } from '../../../constants/jobTheme';

function Shimmer({ width, height, radius = 12, style }) {
  const { isDark } = useTheme();
  const tokens = getJobTokens(isDark);
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

export default function JobSkeleton() {
  return (
    <View style={styles.wrap}>
      <Shimmer width="100%" height={220} radius={24} style={styles.map} />

      <View style={styles.insightRow}>
        <Shimmer width={240} height={68} radius={18} />
        <Shimmer width={240} height={68} radius={18} />
      </View>

      <View style={styles.customer}>
        <Shimmer width={46} height={46} radius={23} />
        <View style={{ flex: 1, gap: 6 }}>
          <Shimmer width="60%" height={14} />
          <Shimmer width="40%" height={10} />
        </View>
        <Shimmer width={70} height={36} radius={10} />
      </View>

      <Shimmer width="100%" height={134} radius={20} style={styles.section} />
      <Shimmer width="100%" height={184} radius={20} style={styles.section} />
      <Shimmer width="100%" height={234} radius={20} style={styles.section} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8 },
  map: { marginHorizontal: 20, marginTop: 12 },
  insightRow: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  customer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(15,23,42,0.04)',
  },
  section: {
    marginHorizontal: 20,
    marginTop: 14,
  },
});
