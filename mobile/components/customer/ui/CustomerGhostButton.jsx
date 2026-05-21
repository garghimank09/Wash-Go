import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';

export default function CustomerGhostButton({ label, onPress, disabled, style }) {
  const { theme } = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: theme.customer.surfaceContainerLowest,
          borderColor: theme.customer.outlineVariant,
        },
        disabled && { opacity: 0.55 },
        pressed && !disabled && { opacity: 0.92 },
        style,
      ]}
    >
      <Text style={[styles.label, { color: theme.text.primary }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    minHeight: 48,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
