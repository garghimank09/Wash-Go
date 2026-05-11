import { RouteProp, useRoute } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { Loader } from '../components/Loader';
import { bookingsApi } from '../services/bookingsApi';
import { getApiErrorMessage } from '../services/api';
import { formatCents } from '../utils/format';
import type { BookingDetail } from '../types/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import type { MainStackParamList } from '../navigation/types';

type R = RouteProp<MainStackParamList, 'BookingDetail'>;

export function BookingDetailScreen() {
  const route = useRoute<R>();
  const { bookingId } = route.params;
  const [b, setB] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data } = await bookingsApi.get(bookingId);
        if (!cancelled) setB(data);
      } catch (e) {
        if (!cancelled) setErr(getApiErrorMessage(e));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <Loader />
      </SafeAreaView>
    );
  }
  if (err || !b) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.error}>{err ?? 'Not found'}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <View style={styles.headerRow}>
          <Text style={styles.status}>{b.status.replace('_', ' ')}</Text>
          <Text style={styles.price}>{formatCents(b.price_cents, b.currency)}</Text>
        </View>
        {b.eta_minutes != null ? (
          <Card style={styles.card}>
            <Text style={styles.etaLabel}>Estimated arrival</Text>
            <Text style={styles.etaValue}>~{b.eta_minutes} minutes</Text>
            <Text style={styles.muted}>Live GPS tracking will replace this estimate in a future release.</Text>
          </Card>
        ) : null}

        <Text style={styles.section}>Washer</Text>
        <Card style={styles.card}>
          {b.washer ? (
            <>
              <Text style={styles.washerName}>{b.washer.full_name}</Text>
              <Text style={styles.muted}>
                Rating {b.washer.rating_avg.toFixed(1)}
                {b.washer.service_area ? ` · ${b.washer.service_area}` : ''}
              </Text>
            </>
          ) : (
            <Text style={styles.muted}>Matching you with a nearby washer…</Text>
          )}
        </Card>

        <Text style={styles.section}>Vehicle & place</Text>
        <Card style={styles.card}>
          <Text style={styles.bold}>{b.car_label ?? 'Your vehicle'}</Text>
          <Text style={styles.muted}>{b.service_address}</Text>
          <Text style={styles.muted}>Scheduled: {new Date(b.scheduled_at).toLocaleString()}</Text>
        </Card>

        <Text style={styles.section}>Timeline</Text>
        <Card style={styles.card}>
          {b.timeline.map((step, i) => (
            <View key={step.key} style={[styles.stepRow, i < b.timeline.length - 1 && styles.stepBorder]}>
              <View style={[styles.dot, step.done && styles.dotDone]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.stepTitle}>{step.label}</Text>
                {step.at ? (
                  <Text style={styles.muted}>{new Date(step.at).toLocaleString()}</Text>
                ) : (
                  <Text style={styles.muted}>{step.done ? 'Done' : 'Pending'}</Text>
                )}
              </View>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
  status: { textTransform: 'capitalize', fontSize: 18, fontWeight: '800', color: colors.primary },
  price: { fontSize: 20, fontWeight: '900', color: colors.text },
  card: { marginBottom: spacing.md },
  etaLabel: { color: colors.textMuted, fontSize: 12, fontWeight: '700', textTransform: 'uppercase' },
  etaValue: { fontSize: 26, fontWeight: '900', color: colors.text, marginTop: 4 },
  section: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontSize: 12,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
  },
  washerName: { fontSize: 18, fontWeight: '800', color: colors.text },
  bold: { fontSize: 16, fontWeight: '700', color: colors.text },
  muted: { marginTop: 4, color: colors.textMuted, fontSize: 14, lineHeight: 20 },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', paddingVertical: spacing.md },
  stepBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: spacing.md,
    marginTop: 4,
    backgroundColor: colors.border,
  },
  dotDone: { backgroundColor: colors.success },
  stepTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  error: { color: colors.danger, padding: spacing.lg },
});
