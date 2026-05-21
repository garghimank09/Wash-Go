import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Pressable,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useNewBooking } from '../../context/NewBookingContext';
import AppIcon from '../../components/customer/AppIcon';
import StepHeader from '../../components/customer/StepHeader';
import CustomerStepProgress from '../../components/customer/CustomerStepProgress';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import MapPicker from '../../components/customer/MapPicker';
import DateTimeField, { formatScheduledLabel } from '../../components/customer/DateTimeField';

function quickPickDate(offsetHours, hour = 9, minute = 0) {
  const d = new Date();
  d.setTime(d.getTime() + offsetHours * 3600 * 1000);
  if (offsetHours >= 24) {
    d.setHours(hour, minute, 0, 0);
  }
  return d.toISOString();
}

const QUICK_PICKS = [
  { id: 'in_3h', label: 'In 3 hours', build: () => quickPickDate(3) },
  { id: 'tomorrow', label: 'Tomorrow 9 AM', build: () => quickPickDate(24, 9, 0) },
  { id: 'weekend', label: 'This weekend', build: () => buildWeekend() },
];

function buildWeekend() {
  const d = new Date();
  const day = d.getDay();
  // Saturday = 6
  const daysUntilSaturday = (6 - day + 7) % 7 || 7;
  d.setDate(d.getDate() + daysUntilSaturday);
  d.setHours(10, 0, 0, 0);
  return d.toISOString();
}

export default function NewWashSchedule() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form, setField, setFields, setLastStep } = useNewBooking();
  const [errors, setErrors] = useState({});
  const s = styles(theme);

  useEffect(() => {
    setLastStep('schedule');
  }, [setLastStep]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/new-wash/package');
  };

  const validate = () => {
    const next = {};
    if (!form.address || form.address.trim().length < 5) {
      next.address = 'Enter an address (at least 5 characters)';
    }
    if (form.latitude == null || form.longitude == null) {
      next.pin = 'Drop a pin on the map for your exact location';
    }
    if (!form.scheduledAt) {
      next.scheduledAt = 'Pick a date and time';
    } else {
      const t = new Date(form.scheduledAt).getTime();
      if (Number.isNaN(t) || t <= Date.now()) {
        next.scheduledAt = 'Scheduled time must be in the future';
      }
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleContinue = () => {
    if (validate()) router.push('/new-wash/review');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader title="Where & when" step="Step 3 of 4" onBack={handleBack} />
      <CustomerStepProgress currentStep="schedule" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 140 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={s.card}>
            <Text style={s.cardTitle}>Service location</Text>
            <Text style={s.cardSub}>Where should the washer come?</Text>

            <View style={{ height: 12 }} />
            <Text style={s.label}>Address</Text>
            <TextInput
              style={[s.input, errors.address && s.inputError]}
              placeholder="e.g. 12, Park View Apartments, Sector 22"
              placeholderTextColor={theme.text.muted}
              value={form.address}
              onChangeText={(v) => setField('address', v)}
              multiline
              numberOfLines={2}
            />
            {errors.address ? (
              <Text style={s.errorText}>{errors.address}</Text>
            ) : null}

            <View style={{ height: 14 }} />
            <Text style={s.label}>Pin your exact location</Text>
            <View style={{ height: 8 }} />
            <MapPicker
              height={220}
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={({ latitude, longitude }) =>
                setFields({ latitude, longitude })
              }
              onResolveAddress={(addr) => {
                if (!form.address || form.address.length < 5) {
                  setField('address', addr);
                }
              }}
            />
            {errors.pin ? (
              <Text style={s.errorText}>{errors.pin}</Text>
            ) : null}
            {form.latitude != null ? (
              <View style={s.pinChip}>
                <AppIcon name="place" size={12} color={theme.accent.primary} />
                <Text style={s.pinChipText}>
                  {form.latitude.toFixed(4)}, {form.longitude.toFixed(4)}
                </Text>
              </View>
            ) : null}
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Schedule</Text>
            <Text style={s.cardSub}>When should we wash it?</Text>

            <View style={{ height: 12 }} />
            <DateTimeField
              value={form.scheduledAt}
              onChange={(iso) => setField('scheduledAt', iso)}
              minimumDate={new Date()}
            />
            {errors.scheduledAt ? (
              <Text style={s.errorText}>{errors.scheduledAt}</Text>
            ) : null}

            <View style={{ height: 12 }} />
            <Text style={s.quickLabel}>Quick picks</Text>
            <View style={s.quickRow}>
              {QUICK_PICKS.map((q) => {
                const iso = q.build();
                const selected =
                  form.scheduledAt &&
                  Math.abs(new Date(iso).getTime() - new Date(form.scheduledAt).getTime()) < 60_000;
                return (
                  <Pressable
                    key={q.id}
                    onPress={() => setField('scheduledAt', iso)}
                    style={({ pressed }) => [
                      s.quickChip,
                      selected && s.quickChipActive,
                      pressed && { opacity: 0.9 },
                    ]}
                  >
                    <Text
                      style={[
                        s.quickChipText,
                        selected && { color: theme.button.primary.text },
                      ]}
                    >
                      {q.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </ScrollView>

        <CustomerFooterBar>
          <CustomerPrimaryButton label="Continue" onPress={handleContinue} />
        </CustomerFooterBar>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    scroll: { paddingHorizontal: 20, paddingTop: 4, gap: 14 },
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 16,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
      letterSpacing: -0.2,
    },
    cardSub: { fontSize: 12, color: theme.text.secondary, marginTop: 4 },
    label: { fontSize: 13, fontWeight: '600', color: theme.text.secondary, marginBottom: 8 },
    input: {
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      borderRadius: theme.radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      color: theme.text.primary,
      minHeight: 64,
      textAlignVertical: 'top',
    },
    inputError: { borderColor: c.error },
    errorText: {
      marginTop: 6,
      fontSize: 12,
      color: c.error,
      fontWeight: '600',
    },
    pinChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 10,
      alignSelf: 'flex-start',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 999,
      backgroundColor: c.primaryBg,
    },
    pinChipText: { fontSize: 11, fontWeight: '700', color: theme.accent.dark, letterSpacing: 0.4 },
    quickLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginTop: 4,
      marginBottom: 8,
    },
    quickRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    quickChip: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      backgroundColor: c.surface,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    quickChipActive: {
      backgroundColor: theme.accent.primary,
      borderColor: theme.accent.primary,
    },
    quickChipText: { fontSize: 12, fontWeight: '700', color: theme.text.primary },
    footer: {
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
    },
    primaryBtn: {
      flexDirection: 'row',
      gap: 8,
      backgroundColor: theme.accent.primary,
      paddingVertical: 16,
      borderRadius: theme.radius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryBtnText: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.button.primary.text,
    },
  });
};
