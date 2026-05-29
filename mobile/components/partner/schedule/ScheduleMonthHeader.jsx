import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { usePartnerSchedule } from '../../../context/PartnerScheduleContext';
import { useHoldRepeat } from '../../../hooks/useHoldRepeat';
import ScheduleMonthPickerSheet from './ScheduleMonthPickerSheet';

export default function ScheduleMonthHeader() {
  const { theme } = useTheme();
  const {
    monthLabel,
    monthJobCount,
    goPrevMonth,
    goNextMonth,
    goToMonth,
    goToToday,
    canGoPrevMonth,
    canGoNextMonth,
    selectedKey,
    todayKey: todayKeyValue,
    viewYear,
    viewMonth,
  } = usePartnerSchedule();

  const [pickerOpen, setPickerOpen] = useState(false);

  const now = new Date();
  const isCurrentMonth =
    viewYear === now.getFullYear() && viewMonth === now.getMonth();
  const showToday = selectedKey !== todayKeyValue || !isCurrentMonth;

  const jobSubtitle =
    monthJobCount === 0
      ? 'No jobs this month'
      : `${monthJobCount} ${monthJobCount === 1 ? 'job' : 'jobs'} this month`;

  const holdPrev = useHoldRepeat(
    () => {
      if (!canGoPrevMonth) return;
      Haptics.selectionAsync().catch(() => {});
      goPrevMonth();
    },
    { enabled: canGoPrevMonth },
  );

  const holdNext = useHoldRepeat(
    () => {
      if (!canGoNextMonth) return;
      Haptics.selectionAsync().catch(() => {});
      goNextMonth();
    },
    { enabled: canGoNextMonth },
  );

  const openPicker = () => {
    Haptics.selectionAsync().catch(() => {});
    setPickerOpen(true);
  };

  return (
    <>
      <View
        style={[
          styles.outer,
          {
            backgroundColor: theme.customer.surface,
            borderBottomColor: theme.customer.outlineVariant,
          },
        ]}
      >
        <View style={styles.row}>
          <Pressable
            onPressIn={holdPrev.onPressIn}
            onPressOut={holdPrev.onPressOut}
            disabled={!canGoPrevMonth}
            hitSlop={10}
            style={({ pressed }) => [
              styles.chevron,
              {
                backgroundColor: theme.customer.surfaceContainerLowest,
                borderColor: theme.customer.outlineVariant,
              },
              !canGoPrevMonth && styles.chevronDisabled,
              pressed && canGoPrevMonth && { opacity: 0.88 },
            ]}
            accessibilityLabel="Previous month. Hold to scroll faster."
          >
            <ChevronLeft
              size={20}
              color={canGoPrevMonth ? theme.text.primary : theme.text.muted}
              strokeWidth={2.4}
            />
          </Pressable>

          <Pressable
            onPress={openPicker}
            style={({ pressed }) => [styles.center, pressed && { opacity: 0.92 }]}
            accessibilityLabel="Choose month and year"
            accessibilityRole="button"
          >
            <View style={styles.monthTitleRow}>
              <Text style={[styles.month, { color: theme.text.primary }]}>{monthLabel}</Text>
              <ChevronDown size={16} color={theme.text.muted} strokeWidth={2.4} />
            </View>
            <Text style={[styles.sub, { color: theme.text.secondary }]}>{jobSubtitle}</Text>
            <Text style={[styles.hint, { color: theme.text.muted }]}>Tap to pick · hold arrows</Text>
          </Pressable>

          <Pressable
            onPressIn={holdNext.onPressIn}
            onPressOut={holdNext.onPressOut}
            disabled={!canGoNextMonth}
            hitSlop={10}
            style={({ pressed }) => [
              styles.chevron,
              {
                backgroundColor: theme.customer.surfaceContainerLowest,
                borderColor: theme.customer.outlineVariant,
              },
              !canGoNextMonth && styles.chevronDisabled,
              pressed && canGoNextMonth && { opacity: 0.88 },
            ]}
            accessibilityLabel="Next month. Hold to scroll faster."
          >
            <ChevronRight
              size={20}
              color={canGoNextMonth ? theme.text.primary : theme.text.muted}
              strokeWidth={2.4}
            />
          </Pressable>
        </View>

        {showToday ? (
          <Pressable
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              goToToday();
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.todayBtn,
              { backgroundColor: theme.customer.primaryBg },
              pressed && { opacity: 0.9 },
            ]}
            accessibilityLabel="Jump to today"
          >
            <Text style={[styles.todayText, { color: theme.accent.primary }]}>Today</Text>
          </Pressable>
        ) : null}
      </View>

      <ScheduleMonthPickerSheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        viewYear={viewYear}
        viewMonth={viewMonth}
        onApply={goToMonth}
      />
    </>
  );
}

const styles = StyleSheet.create({
  outer: {
    paddingTop: 8,
    paddingBottom: 6,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    gap: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
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
  monthTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  month: {
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
    textTransform: 'capitalize',
  },
  sub: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  hint: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.2,
    marginTop: 1,
  },
  todayBtn: {
    alignSelf: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 999,
  },
  todayText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
});
