import { Pressable, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

export default function SizeChip({ label, selected, onPress }) {
  const { theme } = useTheme();
  const c = theme.customer;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        {
          backgroundColor: selected ? theme.accent.primary : c.surfaceContainerLowest,
          borderColor: selected ? theme.accent.primary : c.outlineVariant,
          opacity: pressed ? 0.88 : 1,
        },
      ]}
    >
      <Text
        style={[
          styles.label,
          { color: selected ? theme.button.primary.text : theme.text.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1.5,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
  },
  label: { fontSize: 13, fontWeight: '700', letterSpacing: 0.2 },
});
