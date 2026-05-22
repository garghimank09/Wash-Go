import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useNewBooking } from '../../context/NewBookingContext';
import { bookingService } from '../../services/bookingService';
import { formatCents } from '../../lib/formatCurrency';
import { pricingService, getPackage, getVehicleSize } from '../../services/pricingService';
import { garageService } from '../../services/garageService';
import AppIcon from '../../components/customer/AppIcon';
import StepHeader from '../../components/customer/StepHeader';
import CustomerStepProgress from '../../components/customer/CustomerStepProgress';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import CustomerGhostButton from '../../components/customer/ui/CustomerGhostButton';
import CustomerSkeleton from '../../components/customer/ui/CustomerSkeleton';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';
import VehicleArt, { resolveBodyColor } from '../../components/customer/VehicleArt';
import { formatScheduledLabel } from '../../components/customer/DateTimeField';
import BookingLiveSummary from '../../components/customer/BookingLiveSummary';

export default function NewWashReview() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form, setField, setLastStep } = useNewBooking();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);

  useEffect(() => {
    setLastStep('review');
  }, [setLastStep]);

  useEffect(() => {
    let cancelled = false;
    garageService
      .getVehicles()
      .then((data) => {
        if (cancelled) return;
        const found = data.find((v) => v.id === form.carId);
        setVehicle(found || null);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.carId]);

  useEffect(() => {
    let cancelled = false;
    setPricingLoading(true);
    pricingService
      .calculate(form.packageId, form.vehicleSize)
      .then((r) => {
        if (!cancelled) {
          setField('priceCents', r.estimated_price_cents);
          if (r.currency) setField('currency', r.currency);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setPricingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [form.packageId, form.vehicleSize, setField]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/new-wash/schedule');
  };

  const handleConfirm = async () => {
    if (!form.carId) {
      setError('Select a vehicle first');
      return;
    }
    if (!form.address?.trim() || form.address.trim().length < 5) {
      setError('Enter a valid service address');
      return;
    }
    if (form.latitude == null || form.longitude == null) {
      setError('Set your location on the map');
      return;
    }
    if (!form.scheduledAt || new Date(form.scheduledAt).getTime() <= Date.now() + 60_000) {
      setError('Choose a future date and time');
      return;
    }
    if (form.priceCents == null) {
      setError('Price estimate unavailable — go back to package step');
      return;
    }

    setError('');
    setSubmitting(true);
    try {
      const booking = await bookingService.create({
        carId: form.carId,
        scheduledAt: form.scheduledAt,
        serviceAddress: form.address.trim(),
        latitude: form.latitude,
        longitude: form.longitude,
        priceCents: form.priceCents,
        packageId: form.packageId,
        vehicleSize: form.vehicleSize,
        currency: form.currency || 'INR',
      });
      router.replace({
        pathname: '/new-wash/success',
        params: { id: booking.id },
      });
    } catch (err) {
      setError(err.message || 'Could not place booking');
    } finally {
      setSubmitting(false);
    }
  };

  const pkg = getPackage(form.packageId);
  const size = getVehicleSize(form.vehicleSize);
  const bodyColor = resolveBodyColor(vehicle?.color, '#a5d4e6');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader title="Review & confirm" step="Step 4 of 4" onBack={handleBack} />
      <CustomerStepProgress currentStep="review" />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 180 }]}
        showsVerticalScrollIndicator={false}
      >
        <BookingLiveSummary
          stepIndex={3}
          vehicleLabel={
            vehicle ? `${vehicle.make} ${vehicle.model}` : loading ? '…' : '—'
          }
          packageLabel={pkg.label}
          priceCents={form.priceCents}
          currency={form.currency || 'INR'}
          pricingLoading={pricingLoading}
        />

        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}

        {loading ? (
          <CustomerSkeleton />
        ) : (
          <View style={s.hero}>
            <VehicleArt
              width={220}
              height={120}
              bodyColor={bodyColor}
              accentColor={theme.accent.primary}
            />
            {vehicle ? (
              <>
                <Text style={s.heroName}>
                  {vehicle.make} {vehicle.model}
                </Text>
                <View style={s.heroChips}>
                  <View style={s.chip}>
                    <Text style={s.chipText}>{vehicle.license_plate}</Text>
                  </View>
                  {vehicle.year ? (
                    <View style={s.chip}>
                      <Text style={s.chipText}>{vehicle.year}</Text>
                    </View>
                  ) : null}
                </View>
              </>
            ) : null}
          </View>
        )}

        <Section
          title="Service"
          rows={[
            { label: 'Package', value: pkg.label, onEdit: () => router.push('/new-wash/package') },
            { label: 'Vehicle size', value: size.label, onEdit: () => router.push('/new-wash/package') },
          ]}
          theme={theme}
        />

        <Section
          title="When & where"
          rows={[
            {
              label: 'Scheduled',
              value: formatScheduledLabel(form.scheduledAt),
              onEdit: () => router.push('/new-wash/schedule'),
            },
            {
              label: 'Address',
              value: form.address,
              multiline: true,
              onEdit: () => router.push('/new-wash/schedule'),
            },
          ]}
          theme={theme}
        />

        <View style={s.totalCard}>
          <View>
            <Text style={s.totalLabel}>Total estimate</Text>
            <Text style={s.totalSub}>
              Final price may vary based on conditions on arrival.
            </Text>
          </View>
          <Text style={s.totalValue}>
            {formatCents(form.priceCents, form.currency || 'INR')}
          </Text>
        </View>
      </ScrollView>

      <CustomerFooterBar>
        <CustomerPrimaryButton
          label="Confirm Booking"
          onPress={handleConfirm}
          loading={submitting}
          disabled={loading || pricingLoading || form.priceCents == null}
        />
        <CustomerGhostButton
          label="Edit details"
          onPress={() => router.push('/new-wash/schedule')}
        />
      </CustomerFooterBar>
    </SafeAreaView>
  );
}

function Section({ title, rows, theme }) {
  const c = theme.customer;
  return (
    <View style={{ marginTop: 16 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: '700',
          color: theme.text.muted,
          letterSpacing: 0.6,
          textTransform: 'uppercase',
          marginBottom: 8,
        }}
      >
        {title}
      </Text>
      <View
        style={{
          backgroundColor: c.surfaceContainerLowest,
          borderRadius: 16,
          borderWidth: 1,
          borderColor: c.outlineVariant + '80',
          paddingHorizontal: 14,
        }}
      >
        {rows.map((r, idx) => (
          <Pressable
            key={r.label}
            onPress={r.onEdit}
            style={{
              flexDirection: 'row',
              alignItems: r.multiline ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              paddingVertical: 14,
              borderBottomWidth: idx < rows.length - 1 ? StyleSheet.hairlineWidth : 0,
              borderBottomColor: c.outlineVariant + '60',
              gap: 12,
            }}
          >
            <Text style={{ fontSize: 13, color: theme.text.secondary }}>{r.label}</Text>
            <View
              style={{
                flex: 1,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'flex-end',
                gap: 8,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: '700',
                  color: theme.text.primary,
                  textAlign: 'right',
                  flexShrink: 1,
                }}
                numberOfLines={r.multiline ? 2 : 1}
              >
                {r.value || '—'}
              </Text>
              <AppIcon name="edit" size={14} color={theme.text.muted} />
            </View>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    scroll: { paddingHorizontal: 20, paddingTop: 4 },
    errorBox: {
      padding: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(220,38,38,0.08)',
      marginBottom: 12,
    },
    errorText: { fontSize: 13, color: c.error, fontWeight: '600' },
    loading: { padding: 32, alignItems: 'center' },
    hero: {
      alignItems: 'center',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: CUSTOMER_LAYOUT.card.radius,
      paddingVertical: 18,
      paddingHorizontal: 16,
    },
    heroName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      marginTop: 6,
      letterSpacing: -0.2,
    },
    heroChips: {
      flexDirection: 'row',
      gap: 8,
      marginTop: 8,
      flexWrap: 'wrap',
      justifyContent: 'center',
    },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
    },
    chipText: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.secondary,
      letterSpacing: 0.4,
    },
    totalCard: {
      marginTop: 18,
      padding: 16,
      borderRadius: 16,
      backgroundColor: c.primaryBg,
      borderWidth: 1,
      borderColor: theme.accent.primary + '40',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    totalLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.accent.dark,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
    },
    totalSub: {
      fontSize: 11,
      color: theme.text.secondary,
      marginTop: 4,
      maxWidth: 200,
    },
    totalValue: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.4,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 20,
      paddingTop: 12,
      backgroundColor: c.surface,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
      gap: 6,
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
    secondaryBtn: { paddingVertical: 12, alignItems: 'center' },
    secondaryBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.accent.primary,
    },
  });
};
