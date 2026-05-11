import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { HomeTabNavigation } from '../navigation/types';
import React, { useCallback, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { GradientCard } from '../components/GradientCard';
import { Loader } from '../components/Loader';
import { useAuth } from '../context/AuthContext';
import { bookingsApi } from '../services/bookingsApi';
import { getApiErrorMessage } from '../services/api';
import { formatCents } from '../utils/format';
import type { Booking, BookingStatus } from '../types/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

const ACTIVE: BookingStatus[] = ['pending', 'confirmed', 'in_progress'];

export function HomeScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<HomeTabNavigation>();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    setLoading(true);
    try {
      const { data } = await bookingsApi.list();
      setBookings(data.items);
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load]),
  );

  const active = bookings.find((b) => ACTIVE.includes(b.status));

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <GradientCard
          title={`Hi, ${user?.full_name?.split(' ')[0] ?? 'there'}`}
          subtitle="Your car deserves a spotless finish — book in seconds, track live soon."
        >
          <View style={styles.heroActions}>
            <Pressable style={styles.aiShortcut} onPress={() => navigation.navigate('AiAssistant')}>
              <Ionicons name="sparkles" size={18} color="#fff" style={{ marginRight: 8 }} />
              <Text style={styles.aiShortcutText}>AI assistant</Text>
              <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.8)" style={{ marginLeft: 4 }} />
            </Pressable>
          </View>
        </GradientCard>

        <Text style={styles.section}>Membership</Text>
        <Card style={styles.card}>
          <Text style={styles.cardTitle}>WashGo Plus</Text>
          <Text style={styles.cardBody}>No active plan yet. Coming soon: unlimited rinses & priority scheduling.</Text>
          <Pressable style={styles.chipMuted}>
            <Text style={styles.chipMutedText}>Preview benefits</Text>
          </Pressable>
        </Card>

        <Text style={styles.section}>Active booking</Text>
        {loading ? (
          <Loader />
        ) : err ? (
          <Text style={styles.error}>{err}</Text>
        ) : active ? (
          <Pressable onPress={() => navigation.navigate('BookingDetail', { bookingId: active.id })}>
            <Card style={styles.card}>
              <View style={styles.rowBetween}>
                <Text style={styles.statusPill}>{active.status.replace('_', ' ')}</Text>
                <Text style={styles.price}>{formatCents(active.price_cents, active.currency)}</Text>
              </View>
              <Text style={styles.cardTitle} numberOfLines={2}>
                {active.service_address}
              </Text>
              <Text style={styles.cardBody}>
                {new Date(active.scheduled_at).toLocaleString()} · Tap for details & ETA
              </Text>
            </Card>
          </Pressable>
        ) : (
          <Card style={styles.card}>
            <Text style={styles.cardBody}>No active wash. Book your next sparkle below.</Text>
          </Card>
        )}

        <View style={styles.cta}>
          <Button title="Book a wash" onPress={() => navigation.navigate('Booking')} />
        </View>

        <Text style={styles.footerNote}>
          Real-time tracking & payments are stubbed for MVP — architecture is ready to plug in WebSockets and Stripe.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { padding: spacing.lg, paddingBottom: spacing.xxl },
  heroActions: { marginTop: spacing.lg },
  aiShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardOverlay,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 999,
  },
  aiShortcutText: { color: '#fff', fontWeight: '700', fontSize: 14, marginRight: 4 },
  section: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  card: { marginBottom: spacing.sm },
  cardTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginTop: spacing.sm },
  cardBody: { marginTop: spacing.xs, color: colors.textMuted, lineHeight: 21, fontSize: 14 },
  chipMuted: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.border,
  },
  chipMutedText: { color: colors.primary, fontWeight: '600', fontSize: 13 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  statusPill: {
    textTransform: 'capitalize',
    color: colors.primary,
    fontWeight: '700',
    fontSize: 13,
  },
  price: { fontWeight: '800', color: colors.text, fontSize: 16 },
  cta: { marginTop: spacing.lg },
  error: { color: colors.danger, marginVertical: spacing.md },
  footerNote: { marginTop: spacing.xl, color: colors.textSubtle, fontSize: 12, lineHeight: 18 },
});
