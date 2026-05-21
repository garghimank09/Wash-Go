import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';

const STEPS = ['vehicle', 'package', 'schedule', 'review'];

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
            <View
              style={[
                styles.dot,
                {
                  backgroundColor: done || active ? theme.accent.primary : theme.customer.outlineVariant,
                  opacity: active ? 1 : done ? 0.85 : 0.45,
                },
              ]}
            />
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
    alignItems: 'center',
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
