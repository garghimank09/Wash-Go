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
import { getCustomerSkeleton, CUSTOMER_LAYOUT } from '../../../constants/customerTheme';

function Shimmer({ width, height, radius = 12, style }) {
  const { isDark } = useTheme();
  const tokens = getCustomerSkeleton(isDark);
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
          backgroundColor: tokens.base,
        },
        animatedStyle,
        style,
      ]}
    />
  );
}

export default function CustomerSkeleton() {
  return (
    <View style={styles.wrap}>
      <Shimmer width="100%" height={168} radius={CUSTOMER_LAYOUT.card.radiusLg} style={styles.hero} />
      <View style={styles.row}>
        <Shimmer width="31%" height={72} radius={16} />
        <Shimmer width="31%" height={72} radius={16} />
        <Shimmer width="31%" height={72} radius={16} />
      </View>
      <Shimmer width="100%" height={120} radius={CUSTOMER_LAYOUT.card.radius} />
      <Shimmer width="100%" height={120} radius={CUSTOMER_LAYOUT.card.radius} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 8, gap: 14 },
  hero: { marginHorizontal: CUSTOMER_LAYOUT.screenPadding },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: CUSTOMER_LAYOUT.screenPadding,
    gap: 10,
  },
});
