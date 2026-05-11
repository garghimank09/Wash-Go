import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Chip } from '../components/Chip';
import { Input } from '../components/Input';
import { Loader } from '../components/Loader';
import { bookingsApi } from '../services/bookingsApi';
import { carsApi } from '../services/carsApi';
import { getApiErrorMessage } from '../services/api';
import { pricingApi, type PackageId, type VehicleSize } from '../services/pricingApi';
import { formatCents, toIsoUtc } from '../utils/format';
import type { Car } from '../types/api';
import type { MainStackParamList } from '../navigation/types';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const PACKAGES: PackageId[] = ['basic', 'deluxe', 'premium'];
const SIZES: VehicleSize[] = ['compact', 'sedan', 'suv'];
const HOUR_PRESETS = [3, 24, 48] as const;

export function BookingScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();
  const [cars, setCars] = useState<Car[]>([]);
  const [carsLoading, setCarsLoading] = useState(true);
  const [carId, setCarId] = useState<string | null>(null);
  const [packageId, setPackageId] = useState<PackageId>('deluxe');
  const [vehicleSize, setVehicleSize] = useState<VehicleSize>('sedan');
  const [address, setAddress] = useState('');
  const [hoursFromNow, setHoursFromNow] = useState(24);
  const [priceCents, setPriceCents] = useState<number | null>(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data } = await carsApi.list();
        if (!cancelled) {
          setCars(data);
          if (data.length) setCarId((prev) => prev ?? data[0].id);
        }
      } catch {
        if (!cancelled) setCars([]);
      } finally {
        if (!cancelled) setCarsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setPricingLoading(true);
      try {
        const { data } = await pricingApi.calculate(packageId, vehicleSize);
        if (!cancelled) setPriceCents(data.estimated_price_cents);
      } catch {
        if (!cancelled) setPriceCents(null);
      } finally {
        if (!cancelled) setPricingLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [packageId, vehicleSize]);

  const scheduledIso = useMemo(() => {
    const d = new Date();
    d.setTime(d.getTime() + Math.max(1, hoursFromNow) * 3600 * 1000);
    return toIsoUtc(d);
  }, [hoursFromNow]);

  const onSubmit = async () => {
    if (!carId) {
      Alert.alert('Add a car first', 'You need at least one vehicle on your profile.');
      return;
    }
    if (address.trim().length < 5) {
      setErr('Please enter a full service address (at least 5 characters).');
      return;
    }
    if (priceCents == null) {
      setErr('Price estimate unavailable. Check your connection and try again.');
      return;
    }
    setErr(null);
    setSubmitting(true);
    try {
      const notes = `WashGo|package:${packageId}|vehicle:${vehicleSize}`;
      const { data } = await bookingsApi.create({
        car_id: carId,
        washer_id: null,
        scheduled_at: scheduledIso,
        service_address: address.trim(),
        price_cents: priceCents,
        currency: 'USD',
        notes,
      });
      navigation.replace('BookingDetail', { bookingId: data.id });
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  if (carsLoading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Loader />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.section}>Vehicle</Text>
        {cars.length === 0 ? (
          <Text style={styles.warn}>Add a car under the Cars tab before booking.</Text>
        ) : (
          <View style={styles.wrapRow}>
            {cars.map((c) => (
              <Chip
                key={c.id}
                label={`${c.make} ${c.model}`}
                selected={carId === c.id}
                onPress={() => setCarId(c.id)}
              />
            ))}
          </View>
        )}

        <Text style={styles.section}>Wash package</Text>
        <View style={styles.wrapRow}>
          {PACKAGES.map((p) => (
            <Chip key={p} label={p} selected={packageId === p} onPress={() => setPackageId(p)} />
          ))}
        </View>

        <Text style={styles.section}>Vehicle size (pricing)</Text>
        <View style={styles.wrapRow}>
          {SIZES.map((s) => (
            <Chip key={s} label={s} selected={vehicleSize === s} onPress={() => setVehicleSize(s)} />
          ))}
        </View>

        <Text style={styles.section}>Estimated price</Text>
        <Card>
          {pricingLoading ? (
            <Loader size="small" />
          ) : priceCents != null ? (
            <Text style={styles.priceBig}>{formatCents(priceCents)}</Text>
          ) : (
            <Text style={styles.warn}>Could not load estimate.</Text>
          )}
          <Text style={styles.hint}>Final price is confirmed when your washer accepts the job.</Text>
        </Card>

        <Text style={styles.section}>Service location</Text>
        <Input
          label="Address"
          placeholder="Street, city, pin / landmark"
          value={address}
          onChangeText={setAddress}
          multiline
        />

        <Text style={styles.section}>Schedule</Text>
        <Text style={styles.hint}>Choose how soon you want the wash (must be in the future).</Text>
        <View style={styles.wrapRow}>
          {HOUR_PRESETS.map((h) => (
            <Chip key={h} label={`+${h}h`} selected={hoursFromNow === h} onPress={() => setHoursFromNow(h)} />
          ))}
        </View>
        <Input
          label="Hours from now (custom)"
          keyboardType="number-pad"
          value={String(hoursFromNow)}
          onChangeText={(t) => {
            const n = parseInt(t.replace(/[^0-9]/g, ''), 10);
            if (!Number.isNaN(n)) setHoursFromNow(Math.min(720, Math.max(1, n)));
            else if (t === '') setHoursFromNow(1);
          }}
        />
        <Text style={styles.schedPreview}>Scheduled (UTC): {new Date(scheduledIso).toLocaleString()}</Text>

        {err ? <Text style={styles.error}>{err}</Text> : null}
        <View style={styles.cta}>
          <Button title="Confirm booking" onPress={onSubmit} loading={submitting} disabled={cars.length === 0} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  section: {
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap' },
  priceBig: { fontSize: 28, fontWeight: '900', color: colors.text },
  hint: { marginTop: spacing.sm, color: colors.textMuted, fontSize: 13, lineHeight: 18 },
  schedPreview: { marginTop: spacing.sm, color: colors.textSubtle, fontSize: 12 },
  cta: { marginTop: spacing.xl },
  error: { color: colors.danger, marginTop: spacing.md },
  warn: { color: colors.warning, marginBottom: spacing.sm },
});
