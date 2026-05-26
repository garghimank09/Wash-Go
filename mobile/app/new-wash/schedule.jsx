import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
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
import AddressSearchField from '../../components/customer/AddressSearchField';
import DateTimeField, { formatScheduledLabel } from '../../components/customer/DateTimeField';
import BookingLiveSummary from '../../components/customer/BookingLiveSummary';
import { getPackage } from '../../services/pricingService';
import { garageService } from '../../services/garageService';

function defaultScheduleIso(hoursAhead = 24) {
  const d = new Date();
  d.setTime(d.getTime() + hoursAhead * 3600 * 1000);
  return d.toISOString();
}

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
  const [vehicleLabel, setVehicleLabel] = useState('—');
  const [geocoding, setGeocoding] = useState(false);
  const s = styles(theme);
  const pkg = getPackage(form.packageId);

  useEffect(() => {
    setLastStep('schedule');
    if (!form.scheduledAt) {
      setField('scheduledAt', defaultScheduleIso(24));
    }
  }, [setLastStep, setField, form.scheduledAt]);

  useEffect(() => {
    if (!form.carId) return;
    garageService
      .getVehicles()
      .then((list) => {
        const v = list.find((c) => c.id === form.carId);
        setVehicleLabel(v ? `${v.make} ${v.model}` : '—');
      })
      .catch(() => setVehicleLabel('—'));
  }, [form.carId]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/new-wash/package');
  };

  const validate = () => {
    const next = {};
    if (!form.address || form.address.trim().length < 5) {
      next.address = 'Enter a complete service address (at least 5 characters)';
    }
    if (form.latitude == null || form.longitude == null) {
      next.pin = 'Set your location on the map';
    }
    if (!form.scheduledAt) {
      next.scheduledAt = 'Pick a date and time';
    } else {
      const t = new Date(form.scheduledAt).getTime();
      if (Number.isNaN(t) || t <= Date.now() + 60_000) {
        next.scheduledAt = 'Choose a date and time in the future';
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
      <StepHeader title="Where & when" step="Step 3 of 5" onBack={handleBack} />
      <CustomerStepProgress currentStep="schedule" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 160 }]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <BookingLiveSummary
            stepIndex={2}
            vehicleLabel={vehicleLabel}
            packageLabel={pkg.label}
            priceCents={form.priceCents}
            currency={form.currency || 'INR'}
          />

          <View style={s.introRow}>
            <View style={s.introIcon}>
              <AppIcon name="place" size={20} color={theme.accent.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.introTitle}>Where & when</Text>
              <Text style={s.introSub}>
                Search your address, refine the pin, then pick a future slot.
              </Text>
            </View>
          </View>

          <View style={s.card}>
            <Text style={s.cardTitle}>Service address</Text>
            <View style={{ height: 12 }} />
            <AddressSearchField
              value={form.address}
              onChangeText={(v) => setField('address', v)}
              error={errors.address}
              onGeocodeStatusChange={({ geocoding: g }) => setGeocoding(!!g)}
              onLocationResolved={({ latitude, longitude }) =>
                setFields({ latitude, longitude })
              }
            />
            {errors.pin ? <Text style={s.errorText}>{errors.pin}</Text> : null}

            <View style={{ height: 14 }} />
            <MapPicker
              height={248}
              autoLocateOnMount
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={({ latitude, longitude }) =>
                setFields({ latitude, longitude })
              }
              onResolveAddress={(addr) => setField('address', addr)}
            />
          </View>

          <View style={s.card}>
            <View style={s.scheduleHeader}>
              <AppIcon name="schedule" size={18} color={theme.accent.primary} />
              <View style={{ flex: 1 }}>
                <Text style={s.cardTitle}>Schedule</Text>
                <Text style={s.cardSub}>Must be in the future (validated on the server).</Text>
              </View>
            </View>

            <View style={{ height: 12 }} />
            <DateTimeField
              value={form.scheduledAt}
              onChange={(iso) => setField('scheduledAt', iso)}
              minimumDate={new Date()}
              label="Date & time"
              hint={formatScheduledLabel(form.scheduledAt)}
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
                  Math.abs(new Date(iso).getTime() - new Date(form.scheduledAt).getTime()) <
                    60_000;
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
          <CustomerPrimaryButton
            label="Continue"
            onPress={handleContinue}
            disabled={geocoding}
          />
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
    introRow: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', marginTop: 4 },
    introIcon: {
      width: 40,
      height: 40,
      borderRadius: 12,
      backgroundColor: c.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
    },
    introTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: theme.text.primary,
    },
    introSub: { fontSize: 12, color: theme.text.secondary, marginTop: 4, lineHeight: 18 },
    card: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: c.outlineVariant,
      padding: 16,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: theme.text.primary,
    },
    cardSub: { fontSize: 11, color: theme.text.secondary, marginTop: 2 },
    scheduleHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
    errorText: {
      marginTop: 8,
      fontSize: 12,
      color: c.error,
      fontWeight: '600',
    },
    quickLabel: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
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
  });
};
