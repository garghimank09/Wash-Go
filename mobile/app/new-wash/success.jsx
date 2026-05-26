import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Check, CreditCard } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useNewBooking } from '../../context/NewBookingContext';
import { formatCents } from '../../lib/formatCurrency';
import { getPackage } from '../../services/pricingService';
import { PAYMENT_METHOD_LABELS } from '../../components/booking/PaymentMethodPicker';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import CustomerGhostButton from '../../components/customer/ui/CustomerGhostButton';
import { formatScheduledLabel } from '../../components/customer/DateTimeField';

export default function NewWashSuccess() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id, paymentMethod } = useLocalSearchParams();
  const { form, reset } = useNewBooking();
  const snapshot = useRef({ ...form, paymentMethod: paymentMethod || form.paymentMethod });
  const checkOpacity = useRef(new Animated.Value(0)).current;
  const s = styles(theme);
  const c = theme.customer;

  useEffect(() => {
    Animated.timing(checkOpacity, {
      toValue: 1,
      duration: 420,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [checkOpacity]);

  const data = snapshot.current;
  const pkg = getPackage(data.packageId);
  const payLabel = PAYMENT_METHOD_LABELS[data.paymentMethod] || 'Demo payment';

  const handleTrack = () => {
    reset();
    if (id) router.replace(`/booking/${id}`);
    else router.replace('/(customer)/bookings');
  };

  const handleHome = () => {
    reset();
    router.replace('/(customer)/dashboard');
  };

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <LinearGradient
        colors={['#ecfdf5', '#ecfeff', c.surface]}
        style={StyleSheet.absoluteFill}
        pointerEvents="none"
      />
      <View style={s.center}>
        <Animated.View style={[s.checkCircle, { opacity: checkOpacity }]}>
          <Check size={48} color="#fff" strokeWidth={2.5} />
        </Animated.View>

        <MotiView
          from={{ opacity: 0, translateY: 16 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{ type: 'timing', duration: 480, delay: 120 }}
          style={s.content}
        >
          <Text style={s.title}>Payment successful</Text>
          <Text style={s.subtitle}>
            Your booking is live. We are matching you with a verified washer.
          </Text>

          <View style={s.receipt}>
            <View style={s.receiptHeader}>
              <CreditCard size={18} color={theme.accent.primary} strokeWidth={1.75} />
              <Text style={s.receiptTitle}>Booking receipt</Text>
            </View>
            <Row label="Package" value={pkg?.label || 'Wash'} theme={theme} />
            <Row label="When" value={formatScheduledLabel(data.scheduledAt)} theme={theme} />
            <Row label="Payment" value={payLabel} theme={theme} />
            {data.paymentMethod === 'upi' && data.upiId ? (
              <Row label="UPI ID" value={data.upiId} theme={theme} />
            ) : null}
            <Row
              label="Amount paid"
              value={formatCents(data.priceCents, data.currency || 'INR')}
              theme={theme}
              accent
              last
            />
            <Text style={s.receiptFoot}>
              Demo capture · Provider demo · Ref {id ? String(id).slice(0, 8) : '—'}
            </Text>
          </View>
        </MotiView>
      </View>

      <CustomerFooterBar>
        <CustomerPrimaryButton label="Track booking" onPress={handleTrack} />
        <CustomerGhostButton label="Back to home" onPress={handleHome} />
      </CustomerFooterBar>
    </SafeAreaView>
  );
}

function Row({ label, value, theme, accent, last }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 12,
        borderBottomWidth: last ? 0 : StyleSheet.hairlineWidth,
        borderBottomColor: theme.customer.outlineVariant + '80',
      }}
    >
      <Text style={{ fontSize: 13, color: theme.text.secondary }}>{label}</Text>
      <Text
        style={{
          fontSize: accent ? 18 : 14,
          fontWeight: accent ? '800' : '700',
          color: accent ? theme.accent.dark : theme.text.primary,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    center: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 24,
    },
    checkCircle: {
      width: 96,
      height: 96,
      borderRadius: 48,
      backgroundColor: '#10b981',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#10b981',
      shadowOpacity: 0.35,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
      elevation: 8,
    },
    content: { alignItems: 'center', marginTop: 24, width: '100%' },
    title: {
      fontSize: 26,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.5,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 14,
      color: theme.text.secondary,
      marginTop: 8,
      marginBottom: 22,
      textAlign: 'center',
      maxWidth: 300,
      lineHeight: 20,
    },
    receipt: {
      width: '100%',
      backgroundColor: c.surfaceContainerLowest,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: c.outlineVariant + '60',
      paddingHorizontal: 18,
      paddingTop: 16,
      paddingBottom: 12,
      ...theme.shadow.md,
    },
    receiptHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: 8,
    },
    receiptTitle: {
      fontSize: 13,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: 0.3,
      textTransform: 'uppercase',
    },
    receiptFoot: {
      fontSize: 10,
      color: theme.text.muted,
      marginTop: 10,
      textAlign: 'center',
    },
  });
};
