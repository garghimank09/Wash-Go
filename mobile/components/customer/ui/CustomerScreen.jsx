import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';

/**
 * Base screen wrapper — safe area + customer surface background.
 */
export default function CustomerScreen({
  children,
  edges = ['top'],
  style,
  contentStyle,
}) {
  const { theme } = useTheme();

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.customer.surface }, style]}
      edges={edges}
    >
      <View style={[styles.inner, contentStyle]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  inner: { flex: 1 },
});
