import { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { MotiView } from 'moti';
import { useTheme } from '../../context/ThemeContext';
import { useNewBooking } from '../../context/NewBookingContext';
import { formatCents } from '../../lib/formatCurrency';
import { pricingService, getPackage, getVehicleSize } from '../../services/pricingService';
import { garageService } from '../../services/garageService';
import AppIcon from '../../components/customer/AppIcon';
import StepHeader from '../../components/customer/StepHeader';
import CustomerStepProgress from '../../components/customer/CustomerStepProgress';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerGhostButton from '../../components/customer/ui/CustomerGhostButton';
import CustomerSkeleton from '../../components/customer/ui/CustomerSkeleton';
import SlideToConfirm from '../../components/booking/SlideToConfirm';
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
        setVehicle(data.find((v) => v.id === form.carId) || null);
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

  const validateAndContinue = () => {
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
    router.push('/new-wash/payment');
  };

  const pkg = getPackage(form.packageId);
  const size = getVehicleSize(form.vehicleSize);
  const bodyColor = resolveBodyColor(vehicle?.color, '#a5d4e6');

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader title="Review & confirm" step="Step 4 of 5" onBack={handleBack} />
      <CustomerStepProgress currentStep="review" />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 200 }]}
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
          <MotiView
            from={{ opacity: 0, translateY: 12 }}
            animate={{ opacity: 1, translateY: 0 }}
            transition={{ type: 'timing', duration: 400 }}
            style={s.hero}
          >
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
                </View>
              </>
            ) : null}
          </MotiView>
        )}

        <CollapsibleSection title="Service" theme={theme} defaultOpen>
          <ReviewRow label="Package" value={pkg.label} onEdit={() => router.push('/new-wash/package')} theme={theme} />
          <ReviewRow label="Vehicle size" value={size.label} onEdit={() => router.push('/new-wash/package')} theme={theme} />
        </CollapsibleSection>

        <CollapsibleSection title="When & where" theme={theme} defaultOpen>
          <ReviewRow
            label="Scheduled"
            value={formatScheduledLabel(form.scheduledAt)}
            onEdit={() => router.push('/new-wash/schedule')}
            theme={theme}
          />
          <ReviewRow
            label="Address"
            value={form.address}
            multiline
            onEdit={() => router.push('/new-wash/schedule')}
            theme={theme}
          />
        </CollapsibleSection>

        <View style={s.totalCard}>
          <View>
            <Text style={s.totalLabel}>Total estimate</Text>
            <Text style={s.totalSub}>Demo payment on the next step — no real charge</Text>
          </View>
          <Text style={s.totalValue}>
            {pricingLoading || form.priceCents == null
              ? '…'
              : formatCents(form.priceCents, form.currency || 'INR')}
          </Text>
        </View>
      </ScrollView>

      <CustomerFooterBar>
        <SlideToConfirm
          label="Slide to pay & book"
          onConfirm={validateAndContinue}
          disabled={loading || pricingLoading || form.priceCents == null}
          accentColor={theme.accent.primary}
        />
        <CustomerGhostButton
          label="Edit details"
          onPress={() => router.push('/new-wash/schedule')}
        />
      </CustomerFooterBar>
    </SafeAreaView>
  );
}

function CollapsibleSection({ title, children, theme, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const c = theme.customer;
  return (
    <View style={{ marginTop: 14 }}>
      <Pressable onPress={() => setOpen((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Text style={{ flex: 1, fontSize: 11, fontWeight: '700', color: theme.text.muted, letterSpacing: 0.6, textTransform: 'uppercase' }}>
          {title}
        </Text>
        <AppIcon name={open ? 'expand-less' : 'expand-more'} size={20} color={theme.text.muted} />
      </Pressable>
      {open ? (
        <View
          style={{
            backgroundColor: c.surfaceContainerLowest,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: c.outlineVariant + '80',
            paddingHorizontal: 14,
          }}
        >
          {children}
        </View>
      ) : null}
    </View>
  );
}

function ReviewRow({ label, value, onEdit, theme, multiline }) {
  const c = theme.customer;
  return (
    <Pressable
      onPress={onEdit}
      style={{
        flexDirection: 'row',
        alignItems: multiline ? 'flex-start' : 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: c.outlineVariant + '60',
        gap: 12,
      }}
    >
      <Text style={{ fontSize: 13, color: theme.text.secondary }}>{label}</Text>
      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', gap: 8 }}>
        <Text
          style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary, textAlign: 'right', flexShrink: 1 }}
          numberOfLines={multiline ? 3 : 1}
        >
          {value || '—'}
        </Text>
        <AppIcon name="edit" size={14} color={theme.text.muted} />
      </View>
    </Pressable>
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
    hero: {
      alignItems: 'center',
      backgroundColor: c.surfaceContainerLow,
      borderRadius: CUSTOMER_LAYOUT.card.radius,
      paddingVertical: 18,
      paddingHorizontal: 16,
      marginBottom: 8,
    },
    heroName: {
      fontSize: 18,
      fontWeight: '700',
      color: theme.text.primary,
      marginTop: 6,
    },
    heroChips: { flexDirection: 'row', gap: 8, marginTop: 8 },
    chip: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: c.surfaceContainerLowest,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
    },
    chipText: { fontSize: 11, fontWeight: '700', color: theme.text.secondary },
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
    totalSub: { fontSize: 11, color: theme.text.secondary, marginTop: 4, maxWidth: 200 },
    totalValue: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.4,
    },
  });
};
