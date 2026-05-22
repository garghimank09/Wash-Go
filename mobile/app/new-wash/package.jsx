import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Animated,
  Easing,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useNewBooking } from '../../context/NewBookingContext';
import { pricingService, PACKAGES, VEHICLE_SIZES } from '../../services/pricingService';
import { formatCents } from '../../lib/formatCurrency';
import { getPackage } from '../../services/pricingService';
import { garageService } from '../../services/garageService';
import StepHeader from '../../components/customer/StepHeader';
import CustomerStepProgress from '../../components/customer/CustomerStepProgress';
import CustomerFooterBar from '../../components/customer/ui/CustomerFooterBar';
import CustomerPrimaryButton from '../../components/customer/ui/CustomerPrimaryButton';
import PackageCard from '../../components/customer/PackageCard';
import SizeChip from '../../components/customer/SizeChip';
import BookingLiveSummary from '../../components/customer/BookingLiveSummary';

export default function NewWashPackage() {
  const { theme } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { form, setField, setFields, setLastStep } = useNewBooking();
  const [estimating, setEstimating] = useState(false);
  const [estimateError, setEstimateError] = useState('');
  const [estimatePerPackage, setEstimatePerPackage] = useState({});
  const [expandedId, setExpandedId] = useState('super_deluxe');
  const [vehicleLabel, setVehicleLabel] = useState('—');
  const priceAnim = useRef(new Animated.Value(0)).current;
  const s = styles(theme);

  useEffect(() => {
    setLastStep('package');
  }, [setLastStep]);

  useEffect(() => {
    if (!form.carId) {
      setVehicleLabel('—');
      return;
    }
    garageService
      .getVehicles()
      .then((list) => {
        const v = list.find((c) => c.id === form.carId);
        setVehicleLabel(v ? `${v.make} ${v.model}` : '—');
      })
      .catch(() => setVehicleLabel('—'));
  }, [form.carId]);

  useEffect(() => {
    let cancelled = false;
    setEstimating(true);
    setEstimateError('');

    const run = async () => {
      try {
        const results = await Promise.all(
          PACKAGES.map((p) => pricingService.calculate(p.id, form.vehicleSize)),
        );
        if (cancelled) return;
        const map = {};
        results.forEach((r, idx) => {
          map[PACKAGES[idx].id] = r.estimated_price_cents;
        });
        setEstimatePerPackage(map);
        const selectedCents = map[form.packageId];
        if (selectedCents != null) {
          setFields({
            priceCents: selectedCents,
            currency: results[0]?.currency || 'INR',
          });
        }

        Animated.timing(priceAnim, {
          toValue: 1,
          duration: 240,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }).start(() => priceAnim.setValue(0));
      } catch (err) {
        if (!cancelled) setEstimateError(err.message || 'Pricing unavailable');
      } finally {
        if (!cancelled) setEstimating(false);
      }
    };

    const timeout = setTimeout(run, 240);
    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.vehicleSize]);

  useEffect(() => {
    const cents = estimatePerPackage[form.packageId];
    if (cents != null) {
      setField('priceCents', cents);
      Animated.timing(priceAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }).start(() => priceAnim.setValue(0));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.packageId, estimatePerPackage]);

  const handleBack = () => {
    if (router.canGoBack()) router.back();
    else router.replace('/new-wash/vehicle');
  };

  const handleSelectPackage = (id) => {
    setField('packageId', id);
    setExpandedId(id);
  };

  const totalLabel =
    form.priceCents != null
      ? formatCents(form.priceCents, form.currency || 'INR')
      : estimating
        ? '…'
        : '—';

  const pkg = getPackage(form.packageId);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StepHeader title="Package & price" step="Step 2 of 4" onBack={handleBack} />
      <CustomerStepProgress currentStep="package" />
      <ScrollView
        contentContainerStyle={[s.scroll, { paddingBottom: insets.bottom + 200 }]}
        showsVerticalScrollIndicator={false}
      >
        <BookingLiveSummary
          stepIndex={1}
          vehicleLabel={vehicleLabel}
          packageLabel={pkg.label}
          priceCents={form.priceCents}
          currency={form.currency || 'INR'}
          pricingLoading={estimating}
        />

        <Text style={[s.sectionLabel, { marginTop: 18 }]}>Vehicle size</Text>
        <View style={s.sizeRow}>
          {VEHICLE_SIZES.map((sz) => (
            <SizeChip
              key={sz.id}
              label={sz.label}
              selected={form.vehicleSize === sz.id}
              onPress={() => setField('vehicleSize', sz.id)}
            />
          ))}
        </View>

        <Text style={[s.sectionLabel, { marginTop: 22 }]}>Wash package</Text>
        <View style={{ gap: 12 }}>
          {PACKAGES.map((p) => (
            <PackageCard
              key={p.id}
              pkg={p}
              selected={form.packageId === p.id}
              expanded={expandedId === p.id}
              priceLabel={
                estimatePerPackage[p.id] != null
                  ? formatCents(estimatePerPackage[p.id])
                  : '—'
              }
              onPress={() => handleSelectPackage(p.id)}
              onToggleExpand={() =>
                setExpandedId((prev) => (prev === p.id ? null : p.id))
              }
            />
          ))}
        </View>

        {estimateError ? (
          <View style={s.errorBox}>
            <Text style={s.errorText}>{estimateError}</Text>
          </View>
        ) : null}
      </ScrollView>

      <CustomerFooterBar>
        <View style={s.totalRow}>
          <View>
            <Text style={s.totalLabel}>Estimated price</Text>
            <Animated.Text
              style={[
                s.totalValue,
                {
                  transform: [
                    {
                      translateY: priceAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, -2],
                      }),
                    },
                  ],
                  opacity: priceAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [1, 0.6],
                  }),
                },
              ]}
            >
              {totalLabel}
            </Animated.Text>
          </View>
          {estimating ? <ActivityIndicator color={theme.accent.primary} /> : null}
        </View>
        <CustomerPrimaryButton
          label="Continue"
          onPress={() => router.push('/new-wash/schedule')}
          disabled={form.priceCents == null}
        />
      </CustomerFooterBar>
    </SafeAreaView>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    safe: { flex: 1, backgroundColor: c.surface },
    scroll: { paddingHorizontal: 20, paddingTop: 4 },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: theme.text.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.6,
      marginBottom: 10,
    },
    sizeRow: { flexDirection: 'row', gap: 10 },
    errorBox: {
      marginTop: 16,
      padding: 12,
      borderRadius: 12,
      backgroundColor: 'rgba(220,38,38,0.08)',
    },
    errorText: { fontSize: 13, color: c.error, fontWeight: '600' },
    totalRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 10,
    },
    totalLabel: {
      fontSize: 11,
      color: theme.text.muted,
      fontWeight: '700',
      textTransform: 'uppercase',
      letterSpacing: 0.4,
    },
    totalValue: {
      fontSize: 22,
      fontWeight: '800',
      color: theme.text.primary,
      letterSpacing: -0.4,
      marginTop: 2,
    },
  });
};
