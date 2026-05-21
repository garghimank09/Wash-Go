import { Pressable, Text, StyleSheet, ActivityIndicator, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../../context/ThemeContext';
import { getCustomerGradients, getCustomerShadow } from '../../../constants/customerTheme';

export default function CustomerPrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  style,
}) {
  const { isDark } = useTheme();
  const gradients = getCustomerGradients(isDark);
  const shadows = getCustomerShadow(isDark);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.wrap,
        shadows.glow(gradients.ctaGlow),
        (disabled || loading) && styles.disabled,
        pressed && !disabled && { opacity: 0.94 },
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#cbd5e1', '#94a3b8'] : gradients.hero}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        <LinearGradient
          pointerEvents="none"
          colors={gradients.heroHighlight}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {loading ? (
          <ActivityIndicator color="#ffffff" />
        ) : (
          <Text style={styles.label}>{label}</Text>
        )}
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: 999,
    overflow: 'hidden',
  },
  gradient: {
    minHeight: 48,
    paddingHorizontal: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  disabled: {
    opacity: 0.65,
  },
});
