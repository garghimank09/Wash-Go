import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const STEPS = ['vehicle', 'package', 'schedule', 'review', 'payment'];
const STEP_LABELS = ['Vehicle', 'Package', 'Where & when', 'Review', 'Payment'];

/**
 * Visual step indicator for the new-wash flow (presentation only).
 */
export default function CustomerStepProgress({ currentStep }) {
  const { theme } = useTheme();
  const currentIndex = Math.max(0, STEPS.indexOf(currentStep));

  return (
    <View style={styles.row}>
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <View key={step} style={styles.item}>
            <View style={styles.dotCol}>
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: done || active ? theme.accent.primary : theme.customer.outlineVariant,
                    opacity: active ? 1 : done ? 0.85 : 0.45,
                  },
                ]}
              />
              <Text
                style={[
                  styles.label,
                  {
                    color: active ? theme.accent.primary : theme.text.muted,
                    fontWeight: active ? '700' : '500',
                  },
                ]}
                numberOfLines={1}
              >
                {STEP_LABELS[index]}
              </Text>
            </View>
            {index < STEPS.length - 1 ? (
              <View
                style={[
                  styles.line,
                  {
                    backgroundColor: done ? theme.accent.primary : theme.customer.outlineVariant,
                    opacity: done ? 0.7 : 0.35,
                  },
                ]}
              />
            ) : null}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dotCol: {
    alignItems: 'center',
    minWidth: 52,
  },
  label: {
    fontSize: 9,
    marginTop: 4,
    textAlign: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    flex: 1,
    height: 2,
    marginHorizontal: 4,
    borderRadius: 1,
  },
});
