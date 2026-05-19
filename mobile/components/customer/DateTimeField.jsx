import { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../context/ThemeContext';
import AppIcon from './AppIcon';

export function formatScheduledLabel(iso) {
  if (!iso) return 'Select date & time';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Select date & time';

  const now = new Date();
  const sameDay =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow =
    d.getFullYear() === tomorrow.getFullYear() &&
    d.getMonth() === tomorrow.getMonth() &&
    d.getDate() === tomorrow.getDate();

  const timeStr = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });

  if (sameDay) return `Today, ${timeStr}`;
  if (isTomorrow) return `Tomorrow, ${timeStr}`;

  const dateStr = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  return `${dateStr}, ${timeStr}`;
}

export default function DateTimeField({ value, onChange, minimumDate, label, hint }) {
  const { theme } = useTheme();
  const [pickerMode, setPickerMode] = useState(null);
  const [tempDate, setTempDate] = useState(value ? new Date(value) : null);
  const c = theme.customer;
  const s = styles(theme);

  const openPicker = () => {
    const seed = value
      ? new Date(value)
      : new Date(Date.now() + 24 * 60 * 60 * 1000); // tomorrow default
    setTempDate(seed);
    setPickerMode('date');
  };

  const onAndroidChange = (event, selected) => {
    if (event.type === 'dismissed') {
      setPickerMode(null);
      return;
    }
    if (pickerMode === 'date' && selected) {
      // Preserve time if present
      const next = new Date(selected);
      if (value) {
        const cur = new Date(value);
        next.setHours(cur.getHours(), cur.getMinutes(), 0, 0);
      } else {
        next.setHours(9, 0, 0, 0); // default 9am
      }
      setTempDate(next);
      setPickerMode('time');
    } else if (pickerMode === 'time' && selected) {
      const next = new Date(tempDate || selected);
      next.setHours(selected.getHours(), selected.getMinutes(), 0, 0);
      onChange?.(next.toISOString());
      setPickerMode(null);
    }
  };

  const onIosChange = (_event, selected) => {
    if (selected) setTempDate(selected);
  };

  const closeIosPicker = () => {
    if (pickerMode === 'date') {
      setPickerMode('time');
    } else {
      if (tempDate) onChange?.(tempDate.toISOString());
      setPickerMode(null);
    }
  };

  return (
    <View>
      {label ? (
        <View style={s.labelRow}>
          <Text style={s.label}>{label}</Text>
          {hint ? <Text style={s.hint}>{hint}</Text> : null}
        </View>
      ) : null}

      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [s.field, pressed && { opacity: 0.94 }]}
      >
        <AppIcon name="event" size={20} color={theme.accent.primary} />
        <Text style={[s.valueText, !value && s.placeholder]}>
          {formatScheduledLabel(value)}
        </Text>
        <AppIcon name="chevron-right" size={20} color={theme.text.muted} />
      </Pressable>

      {Platform.OS === 'android' && pickerMode ? (
        <DateTimePicker
          value={tempDate || new Date()}
          mode={pickerMode}
          display="default"
          minimumDate={pickerMode === 'date' ? minimumDate || new Date() : undefined}
          onChange={onAndroidChange}
        />
      ) : null}

      {Platform.OS === 'ios' && pickerMode ? (
        <Modal transparent animationType="fade" onRequestClose={() => setPickerMode(null)}>
          <Pressable style={s.iosBackdrop} onPress={() => setPickerMode(null)} />
          <View style={[s.iosSheet, { backgroundColor: c.surfaceContainerLowest }]}>
            <View style={s.iosHeader}>
              <Text style={s.iosTitle}>
                {pickerMode === 'date' ? 'Pick a date' : 'Pick a time'}
              </Text>
              <Pressable onPress={closeIosPicker} style={s.iosDoneBtn}>
                <Text style={[s.iosDone, { color: theme.accent.primary }]}>
                  {pickerMode === 'date' ? 'Next' : 'Done'}
                </Text>
              </Pressable>
            </View>
            <DateTimePicker
              value={tempDate || new Date()}
              mode={pickerMode}
              display="spinner"
              minimumDate={pickerMode === 'date' ? minimumDate || new Date() : undefined}
              onChange={onIosChange}
              themeVariant={theme.dark ? 'dark' : 'light'}
              style={{ alignSelf: 'stretch' }}
            />
          </View>
        </Modal>
      ) : null}
    </View>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    labelRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    label: { fontSize: 13, fontWeight: '600', color: theme.text.secondary },
    hint: { fontSize: 11, color: theme.text.muted },
    field: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
      paddingHorizontal: 14,
      paddingVertical: 14,
      borderRadius: theme.radius.md,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      backgroundColor: c.surfaceContainerLowest,
      minHeight: 52,
    },
    valueText: {
      flex: 1,
      fontSize: 15,
      fontWeight: '600',
      color: theme.text.primary,
    },
    placeholder: { color: theme.text.muted, fontWeight: '500' },
    iosBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
    },
    iosSheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 12,
      paddingHorizontal: 12,
      paddingBottom: 28,
    },
    iosHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 8,
      paddingBottom: 6,
    },
    iosTitle: { fontSize: 16, fontWeight: '700', color: theme.text.primary },
    iosDoneBtn: { paddingHorizontal: 10, paddingVertical: 6 },
    iosDone: { fontSize: 15, fontWeight: '700' },
  });
};
