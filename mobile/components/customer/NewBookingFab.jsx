import { Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../../context/ThemeContext';
import AppIcon from './AppIcon';

export default function NewBookingFab({ onPress, size = 44 }) {
  const { theme } = useTheme();
  const c = theme.customer;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        theme.shadow.md,
        pressed && { opacity: 0.9, transform: [{ scale: 0.96 }] },
      ]}
      accessibilityLabel="New booking"
      accessibilityRole="button"
    >
      <LinearGradient
        colors={[c.gradientStart, c.gradientEnd]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.gradient, { borderRadius: size / 2 }]}
      >
        <AppIcon name="add" size={22} color={theme.button.primary.text} />
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
});
