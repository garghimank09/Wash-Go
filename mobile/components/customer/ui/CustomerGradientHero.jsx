import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { CUSTOMER_LAYOUT, getCustomerGradients, getCustomerShadow } from '../../../constants/customerTheme';

export default function CustomerGradientHero({ children, style }) {
  const { isDark } = useTheme();
  const gradients = getCustomerGradients(isDark);
  const shadows = getCustomerShadow(isDark);

  return (
    <View style={[styles.outer, shadows.soft, style]}>
      <LinearGradient
        colors={gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={gradients.heroHighlight}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.inner}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    borderRadius: CUSTOMER_LAYOUT.card.radiusLg,
    overflow: 'hidden',
    marginHorizontal: CUSTOMER_LAYOUT.screenPadding,
  },
  inner: {
    padding: 20,
    gap: 12,
  },
});
