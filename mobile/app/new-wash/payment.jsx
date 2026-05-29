import { useEffect, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNewBooking } from '../../context/NewBookingContext';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { formatCents } from '../../lib/formatCurrency';
import { getPackage, getVehicleSize } from '../../services/pricingService';
import { garageService } from '../../services/garageService';
import { emitBookingsSync } from '../../lib/bookingSyncEvents';
import { emitNotificationsSync } from '../../lib/notificationSyncEvents';
import PaymentMethodPicker from '../../components/booking/PaymentMethodPicker';
import StepHeader from '../../components/customer/StepHeader';
import CustomerStepProgress from '../../components/customer/CustomerStepProgress';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import CustomerGhostButton from '../../components/customer/ui/CustomerGhostButton';
import { formatScheduledLabel } from '../../components/customer/DateTimeField';

export default function NewWashPayment() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const { form, setField, setLastStep } = useNewBooking();
  const [vehicleLabel, setVehicleLabel] = useState('—');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const s = styles(theme);
  const c = theme.customer;

  useEffect(() => {
    setLastStep('payment');
  }, [setLastStep]);

  useEffect(() => {
    if (!form.carId) return;
    garageService
      .getVehicles()
      .then((list) => {
        const v = list.find((x) => x.id === form.carId);
        if (v) setVehicleLabel(`${v.make} ${v.model}`);
      })
      .catch(() => {});
  }, [form.carId]);

  const pkg = getPackage(form.packageId);
  const size = getVehicleSize(form.vehicleSize);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/new-wash/review');
  };

  const handlePay = async () => {
    if (form.paymentMethod === 'upi' && form.upiId?.trim()) {
      const upi = form.upiId.trim();
      if (!/^[\w.-]+@[\w.-]+$/.test(upi) && !/^[\d]{10}@[\w]+$/.test(upi)) {
        setError('Enter a valid UPI ID (e.g. name@bank)');
        return;
      }
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
        instructions: form.instructions,
        currency: form.currency || 'INR',
      });
      emitBookingsSync({ source: 'create' });
      emitNotificationsSync({ source: 'booking_paid' });
      toast.success('Payment complete — finding your washer');
      router.replace({
        pathname: '/new-wash/success',
        params: {
          id: booking.id,
          paymentMethod: form.paymentMethod || 'wallet',
        },
      });
    } catch (err) {
      setError(err.message || 'Could not complete booking');
      toast.error(err.message || 'Payment failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <LinearGradient
        colors={[c.surface, '#ecfeff', c.surface]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <StepHeader title="Pay & confirm" step="Step 5 of 5" onBack={handleBack} />
      <CustomerStepProgress currentStep="payment" />

      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 200 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={s.heroRow}>
          <View style={[s.iconWrap, { backgroundColor: `${theme.accent.primary}18` }]}>
            <ShieldCheck size={24} color={theme.accent.primary} strokeWidth={1.75} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={s.heroTitle}>Secure checkout</Text>
            <Text style={s.heroSub}>Demo payment — same flow as WashGo web</Text>
          </View>
        </View>

        <View style={s.summaryCard}>
          <SummaryRow label="Vehicle" value={vehicleLabel} theme={theme} />
          <SummaryRow label="Package" value={pkg.label} theme={theme} />
          <SummaryRow label="Size" value={size.label} theme={theme} />
          <SummaryRow label="When" value={formatScheduledLabel(form.scheduledAt)} theme={theme} />
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total due</Text>
            <Text style={s.totalValue}>
              {formatCents(form.priceCents, form.currency || 'INR')}
            </Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>Payment method</Text>
        <PaymentMethodPicker
          value={form.paymentMethod}
          onChange={(id) => setField('paymentMethod', id)}
          upiId={form.upiId}
          onUpiIdChange={(v) => setField('upiId', v)}
          theme={theme}
          accentColor={theme.accent.primary}
        />

        {error ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{error}</Text>
          </View>
        ) : null}
      </ScrollView>

      <CustomerFooterBar>
        <CustomerPrimaryButton
          label="Pay & book (demo)"
          onPress={handlePay}
          loading={submitting}
          disabled={submitting || form.priceCents == null}
        />
        <CustomerGhostButton label="Back to review" onPress={handleBack} />
      </CustomerFooterBar>
    </SafeAreaView>
  );
}

function SummaryRow({ label, value, theme }) {
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, gap: 12 }}>
      <Text style={{ fontSize: 13, color: theme.text.muted }}>{label}</Text>
      <Text style={{ fontSize: 14, fontWeight: '700', color: theme.text.primary, flexShrink: 1, textAlign: 'right' }}>
        {value}
      </Text>
    </View>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    scroll: { paddingHorizontal: 20, paddingTop: 4 },
    heroRow: { flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 16 },
    iconWrap: {
      width: 48,
      height: 48,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroTitle: { fontSize: 18, fontWeight: '800', color: theme.text.primary, letterSpacing: -0.3 },
    heroSub: { fontSize: 13, color: theme.text.muted, marginTop: 2 },
    summaryCard: {
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: c.outlineVariant + '80',
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginBottom: 20,
    },
    totalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: c.outlineVariant,
      marginTop: 8,
      paddingTop: 12,
      paddingBottom: 8,
    },
    totalLabel: { fontSize: 12, fontWeight: '700', color: theme.text.muted, textTransform: 'uppercase' },
    totalValue: { fontSize: 24, fontWeight: '800', color: theme.accent.dark, letterSpacing: -0.5 },
    sectionTitle: {
      fontSize: 11,
      fontWeight: '700',
      color: theme.text.muted,
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      marginBottom: 12,
    },
    errorBox: {
      marginTop: 12,
      padding: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(220,38,38,0.08)',
    },
    errorText: { fontSize: 13, color: c.error, fontWeight: '600' },
  });
};
