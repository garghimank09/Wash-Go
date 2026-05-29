import { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import {
  clampViewMonth,
  formatMonthLabel,
  isMonthInRange,
  monthShortLabel,
  yearsInRange,
} from '../../../lib/scheduleCalendar';
import { useHoldRepeat } from '../../../hooks/useHoldRepeat';
import { getSelectionFill, getSelectionBorder } from '../../../lib/selectableCardStyle';

export default function ScheduleMonthPickerSheet({ visible, onClose, viewYear, viewMonth, onApply }) {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);
  const c = theme.customer;

  const [draftYear, setDraftYear] = useState(viewYear);
  const [draftMonth, setDraftMonth] = useState(viewMonth);

  const years = useMemo(() => yearsInRange(), []);

  useEffect(() => {
    if (!visible) return;
    setDraftYear(viewYear);
    setDraftMonth(viewMonth);
  }, [visible, viewYear, viewMonth]);

  const canPrevYear = draftYear > years[0];
  const canNextYear = draftYear < years[years.length - 1];

  const stepYear = (delta) => {
    const next = clampViewMonth(draftYear + delta, draftMonth);
    setDraftYear(next.year);
    setDraftMonth(next.month);
    Haptics.selectionAsync().catch(() => {});
  };

  const holdPrevYear = useHoldRepeat(() => {
    if (canPrevYear) stepYear(-1);
  }, { enabled: visible && canPrevYear });

  const holdNextYear = useHoldRepeat(() => {
    if (canNextYear) stepYear(1);
  }, { enabled: visible && canNextYear });

  const apply = () => {
    const clamped = clampViewMonth(draftYear, draftMonth);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
    onApply(clamped.year, clamped.month);
    onClose();
  };

  if (!visible) return null;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={styles.backdrop} onPress={onClose}>
        {Platform.OS === 'ios' ? (
          <BlurView intensity={28} tint={isDark ? 'dark' : 'light'} style={StyleSheet.absoluteFill} />
        ) : (
          <View style={[StyleSheet.absoluteFill, styles.androidDim]} />
        )}
      </Pressable>

      <MotiView
        from={{ opacity: 0, translateY: 24 }}
        animate={{ opacity: 1, translateY: 0 }}
        transition={{ type: 'timing', duration: 260 }}
        style={[
          styles.sheet,
          {
            backgroundColor: c.surfaceContainerLowest,
            borderColor: c.outlineVariant,
          },
          shadows.rim,
        ]}
      >
        <View style={[styles.handle, { backgroundColor: c.outlineVariant }]} />

        <View style={styles.sheetHeader}>
          <View style={[styles.iconWrap, { backgroundColor: theme.customer.primaryBg }]}>
            <Calendar size={18} color={theme.accent.primary} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.title, { color: theme.text.primary }]}>Jump to month</Text>
            <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
              Hold ‹ › to move quickly through years
            </Text>
          </View>
        </View>

        <View style={styles.yearRow}>
          <Pressable
            onPressIn={holdPrevYear.onPressIn}
            onPressOut={holdPrevYear.onPressOut}
            disabled={!canPrevYear}
            style={({ pressed }) => [
              styles.yearChevron,
              { borderColor: c.outlineVariant, backgroundColor: c.surface },
              !canPrevYear && styles.disabled,
              pressed && canPrevYear && { opacity: 0.88 },
            ]}
          >
            <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2.4} />
          </Pressable>

          <Text style={[styles.yearValue, { color: theme.text.primary }]}>{draftYear}</Text>

          <Pressable
            onPressIn={holdNextYear.onPressIn}
            onPressOut={holdNextYear.onPressOut}
            disabled={!canNextYear}
            style={({ pressed }) => [
              styles.yearChevron,
              { borderColor: c.outlineVariant, backgroundColor: c.surface },
              !canNextYear && styles.disabled,
              pressed && canNextYear && { opacity: 0.88 },
            ]}
          >
            <ChevronRight size={20} color={theme.text.primary} strokeWidth={2.4} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.yearChips}
        >
          {years.map((y) => {
            const active = y === draftYear;
            return (
              <Pressable
                key={y}
                onPress={() => {
                  const next = clampViewMonth(y, draftMonth);
                  setDraftYear(next.year);
                  setDraftMonth(next.month);
                  Haptics.selectionAsync().catch(() => {});
                }}
                style={({ pressed }) => [
                  styles.yearChip,
                  {
                    backgroundColor: active ? getSelectionFill(theme) : c.surface,
                    borderColor: active ? getSelectionBorder(theme) : c.outlineVariant,
                    borderWidth: active ? 2 : 1,
                  },
                  pressed && { opacity: 0.92 },
                ]}
              >
                <Text
                  style={[
                    styles.yearChipText,
                    { color: active ? theme.accent.primary : theme.text.secondary },
                  ]}
                >
                  {y}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={styles.monthGrid}>
          {MONTH_INDICES.map((m) => {
            const inRange = isMonthInRange(draftYear, m);
            const active = m === draftMonth;
            return (
              <Pressable
                key={m}
                disabled={!inRange}
                onPress={() => {
                  if (!inRange) return;
                  setDraftMonth(m);
                  Haptics.selectionAsync().catch(() => {});
                }}
                style={({ pressed }) => [
                  styles.monthCell,
                  {
                    backgroundColor: active
                      ? theme.accent.primary
                      : c.surface,
                    borderColor: active
                      ? theme.accent.primary
                      : c.outlineVariant,
                  },
                  !inRange && styles.monthDisabled,
                  pressed && inRange && !active && { opacity: 0.9 },
                ]}
              >
                <Text
                  style={[
                    styles.monthCellText,
                    {
                      color: active
                        ? '#ffffff'
                        : inRange
                          ? theme.text.primary
                          : theme.text.muted,
                    },
                  ]}
                >
                  {monthShortLabel(m)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={[styles.preview, { color: theme.text.secondary }]}>
          {formatMonthLabel(draftYear, draftMonth)}
        </Text>

        <View style={styles.actions}>
          <Pressable
            onPress={onClose}
            style={({ pressed }) => [
              styles.secondaryBtn,
              { borderColor: c.outlineVariant },
              pressed && { opacity: 0.9 },
            ]}
          >
            <Text style={[styles.secondaryText, { color: theme.text.primary }]}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={apply}
            style={({ pressed }) => [
              styles.primaryBtn,
              { backgroundColor: theme.accent.primary },
              pressed && { opacity: 0.92 },
            ]}
          >
            <Text style={[styles.primaryText, { color: theme.button.primary.text }]}>Apply</Text>
          </Pressable>
        </View>
      </MotiView>
    </Modal>
  );
}

const MONTH_INDICES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end' },
  androidDim: { backgroundColor: 'rgba(15,23,42,0.45)' },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 20,
    paddingBottom: Platform.OS === 'ios' ? 28 : 20,
    paddingTop: 10,
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginBottom: 14,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  subtitle: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  yearRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 12,
  },
  yearChevron: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  yearValue: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
    minWidth: 88,
    textAlign: 'center',
  },
  disabled: { opacity: 0.4 },
  yearChips: {
    gap: 8,
    paddingBottom: 14,
  },
  yearChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    overflow: 'hidden',
  },
  yearChipText: { fontSize: 13, fontWeight: '700' },
  monthGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  monthCell: {
    width: '23%',
    flexGrow: 1,
    maxWidth: '24%',
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  monthDisabled: { opacity: 0.35 },
  monthCellText: { fontSize: 13, fontWeight: '800' },
  preview: {
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 14,
    textTransform: 'capitalize',
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryText: { fontSize: 15, fontWeight: '700' },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryText: { fontSize: 15, fontWeight: '800' },
});
