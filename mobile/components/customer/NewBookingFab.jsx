import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import { getCustomerGradients, getCustomerShadow } from '../../constants/customerTheme';
import AppIcon from './AppIcon';

export default function NewBookingFab({ onPress, size = 52 }) {
  const { isDark } = useTheme();
  const gradients = getCustomerGradients(isDark);
  const shadows = getCustomerShadow(isDark);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        shadows.glow(gradients.ctaGlow),
        { width: size, height: size, borderRadius: size / 2 },
        pressed && { opacity: 0.94 },
      ]}
      accessibilityLabel="New booking"
      accessibilityRole="button"
    >
      <LinearGradient
        colors={gradients.fab}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: size / 2 }]}
      >
        <AppIcon name="add" size={24} color="#ffffff" />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.28)',
  },
});
