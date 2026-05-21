import { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Frosted header overlay — opacity driven by scrollY shared value.
 */
export default function CustomerStickyHeader({ scrollY, children }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const frostedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 12, 28], [0, 0.55, 1], Extrapolation.CLAMP),
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [12, 36], [0, 1], Extrapolation.CLAMP),
  }));

  const bgColor = useMemo(
    () => (isDark ? 'rgba(13,18,36,0.78)' : 'rgba(255,255,255,0.86)'),
    [isDark]
  );

  return (
    <View style={[styles.outer, { paddingTop: insets.top + 8 }]}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, frostedStyle, { backgroundColor: bgColor }]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={isDark ? 32 : 38}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
      </Animated.View>
      <View style={styles.content}>{children}</View>
      <Animated.View
        pointerEvents="none"
        style={[
          styles.divider,
          dividerStyle,
          { backgroundColor: theme.customer.outlineVariant },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
  },
});
