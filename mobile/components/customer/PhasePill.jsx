import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { PHASE_LABEL } from '../../lib/customerBookingPhase';

export default function PhasePill({ phase, size = 'md' }) {
  const { theme } = useTheme();
  const palette = theme.phases?.[phase] || {
    fg: theme.text.secondary,
    bg: theme.customer.surfaceContainerLow,
  };

  const small = size === 'sm';

  return (
    <View
      style={[
        styles.pill,
        small && styles.pillSmall,
        { backgroundColor: palette.bg },
      ]}
    >
      <View style={[styles.dot, small && styles.dotSmall, { backgroundColor: palette.fg }]} />
      <Text
        style={[
          styles.text,
          small && styles.textSmall,
          { color: palette.fg },
        ]}
      >
        {PHASE_LABEL[phase] || phase}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    gap: 6,
    alignSelf: 'flex-start',
  },
  pillSmall: { paddingHorizontal: 8, paddingVertical: 3 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  dotSmall: { width: 5, height: 5, borderRadius: 2.5 },
  text: { fontSize: 12, fontWeight: '700', letterSpacing: 0.2 },
  textSmall: { fontSize: 11 },
});
