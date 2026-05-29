import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../../context/ThemeContext';
import ScheduleMonthHeader from './ScheduleMonthHeader';
import DaySelector from './DaySelector';

/**
 * Sticky month navigation + horizontal day strip for the full calendar month.
 */
export default function ScheduleDatePicker({ selectedKey, onSelect }) {
  const { theme } = useTheme();

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: theme.customer.surface,
          borderBottomColor: theme.customer.outlineVariant,
        },
      ]}
    >
      <ScheduleMonthHeader />
      <DaySelector selectedKey={selectedKey} onSelect={onSelect} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    overflow: 'hidden',
    borderBottomWidth: 1,
  },
});
