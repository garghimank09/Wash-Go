import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Sticky bottom bar for stack flows (new-wash, booking actions).
 * Presentation only — children hold the actual buttons.
 */
export default function CustomerFooterBar({ children }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.outer,
        {
          paddingBottom: Math.max(insets.bottom, 12),
          borderTopColor: theme.customer.outlineVariant,
          backgroundColor: isDark ? 'rgba(13,18,36,0.92)' : 'rgba(255,255,255,0.94)',
        },
      ]}
    >
      {Platform.OS === 'ios' ? (
        <BlurView
          intensity={isDark ? 34 : 40}
          tint={isDark ? 'dark' : 'light'}
          style={StyleSheet.absoluteFill}
        />
      ) : null}
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    borderTopWidth: 1,
    paddingTop: 12,
    paddingHorizontal: 20,
  },
  inner: {
    gap: 10,
  },
});
