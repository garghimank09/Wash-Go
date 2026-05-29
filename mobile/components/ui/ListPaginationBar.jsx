import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';

export default function ListPaginationBar({
  rangeLabel,
  pageLabel,
  canPrev,
  canNext,
  onPrev,
  onNext,
  itemNoun = 'items',
}) {
  const { theme } = useTheme();
  const c = theme.customer;

  const handlePrev = () => {
    if (!canPrev) return;
    Haptics.selectionAsync().catch(() => {});
    onPrev?.();
  };

  const handleNext = () => {
    if (!canNext) return;
    Haptics.selectionAsync().catch(() => {});
    onNext?.();
  };

  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: c.surfaceContainerLowest,
          borderColor: c.outlineVariant,
        },
      ]}
      accessibilityRole="adjustable"
      accessibilityLabel={`Pagination, ${rangeLabel} ${itemNoun}${pageLabel ? `, ${pageLabel}` : ''}`}
    >
      <Pressable
        onPress={handlePrev}
        disabled={!canPrev}
        hitSlop={10}
        style={({ pressed }) => [
          styles.chevron,
          {
            backgroundColor: c.surface,
            borderColor: c.outlineVariant,
          },
          !canPrev && styles.chevronDisabled,
          pressed && canPrev && { opacity: 0.88 },
        ]}
        accessibilityLabel="Previous page"
        accessibilityRole="button"
      >
        <ChevronLeft
          size={20}
          color={canPrev ? theme.text.primary : theme.text.muted}
          strokeWidth={2.4}
        />
      </Pressable>

      <View style={styles.center}>
        <Text style={[styles.range, { color: theme.text.primary }]}>{rangeLabel}</Text>
        {pageLabel ? (
          <Text style={[styles.pageMeta, { color: theme.text.secondary }]}>{pageLabel}</Text>
        ) : null}
      </View>

      <Pressable
        onPress={handleNext}
        disabled={!canNext}
        hitSlop={10}
        style={({ pressed }) => [
          styles.chevron,
          {
            backgroundColor: c.surface,
            borderColor: c.outlineVariant,
          },
          !canNext && styles.chevronDisabled,
          pressed && canNext && { opacity: 0.88 },
        ]}
        accessibilityLabel="Next page"
        accessibilityRole="button"
      >
        <ChevronRight
          size={20}
          color={canNext ? theme.text.primary : theme.text.muted}
          strokeWidth={2.4}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  chevron: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chevronDisabled: {
    opacity: 0.45,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  range: {
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  pageMeta: {
    fontSize: 11,
    fontWeight: '600',
  },
});
