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
import { getEarningsTokens } from '../../../constants/earningsTheme';

function Shimmer({ width, height, radius = 12, style }) {
  const opacity = useSharedValue(0.45);
  const { isDark } = useTheme();
  const tokens = getEarningsTokens(isDark);

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

export default function EarningsSkeleton() {
  return (
    <View style={styles.wrap}>
      <View style={styles.hero}>
        <Shimmer width="40%" height={12} />
        <Shimmer width="55%" height={36} style={{ marginTop: 14 }} />
        <View style={styles.heroMeta}>
          <Shimmer width={64} height={28} radius={10} />
          <Shimmer width={64} height={28} radius={10} />
          <View style={{ flex: 1 }} />
          <Shimmer width={96} height={28} radius={10} />
        </View>
      </View>

      <Shimmer width="100%" height={232} radius={22} style={styles.section} />

      <View style={styles.grid}>
        <Shimmer width="48%" height={116} radius={20} />
        <Shimmer width="48%" height={116} radius={20} />
        <Shimmer width="48%" height={116} radius={20} />
        <Shimmer width="48%" height={116} radius={20} />
      </View>

      <View style={styles.row}>
        <Shimmer width={220} height={152} radius={22} />
        <Shimmer width={220} height={152} radius={22} />
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
  heroMeta: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginTop: 18,
  },
  section: {
    marginHorizontal: 20,
    marginTop: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    marginTop: 18,
    gap: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 24,
  },
});
