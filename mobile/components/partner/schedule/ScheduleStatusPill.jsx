import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getScheduleStatus } from '../../../constants/scheduleTheme';

export default function ScheduleStatusPill({ status, size = 'sm' }) {
  const { isDark } = useTheme();
  const tokens = getScheduleStatus(status, isDark);
  const small = size === 'sm';

  return (
    <View
      style={[
        styles.pill,
        {
          backgroundColor: tokens.bg,
          paddingVertical: small ? 3 : 4,
          paddingHorizontal: small ? 8 : 10,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: tokens.dot }]} />
      <Text
        style={[
          styles.text,
          { color: tokens.fg, fontSize: small ? 10 : 11 },
        ]}
      >
        {tokens.label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: 999,
    alignSelf: 'flex-start',
  },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontWeight: '800', letterSpacing: 0.3 },
});
