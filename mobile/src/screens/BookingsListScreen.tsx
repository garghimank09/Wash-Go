import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { BookingsTabNavigation } from '../navigation/types';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Loader } from '../components/Loader';
import { bookingsApi } from '../services/bookingsApi';
import { getApiErrorMessage } from '../services/api';
import { formatCents } from '../utils/format';
import type { Booking } from '../types/api';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function BookingsListScreen() {
  const navigation = useNavigation<BookingsTabNavigation>();
  const [items, setItems] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const { data } = await bookingsApi.list();
      setItems(data.items);
    } catch (e) {
      setErr(getApiErrorMessage(e));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      void load();
    }, [load]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    void load();
  };

  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right']}>
      <View style={styles.toolbar}>
        <Button title="New booking" onPress={() => navigation.navigate('Booking')} />
      </View>
      {loading ? (
        <Loader />
      ) : err ? (
        <Text style={styles.error}>{err}</Text>
      ) : (
        <FlatList
          style={{ flex: 1 }}
          data={items}
          keyExtractor={(b) => b.id}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
          ListEmptyComponent={<Text style={styles.empty}>No bookings yet.</Text>}
          renderItem={({ item }) => (
            <Pressable onPress={() => navigation.navigate('BookingDetail', { bookingId: item.id })}>
              <Card style={styles.card}>
                <View style={styles.row}>
                  <Text style={styles.status}>{item.status.replace('_', ' ')}</Text>
                  <Text style={styles.price}>{formatCents(item.price_cents, item.currency)}</Text>
                </View>
                <Text style={styles.addr} numberOfLines={2}>
                  {item.service_address}
                </Text>
                <Text style={styles.date}>{new Date(item.scheduled_at).toLocaleString()}</Text>
              </Card>
            </Pressable>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  toolbar: { paddingHorizontal: spacing.lg, paddingBottom: spacing.md },
  list: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxl },
  card: { marginBottom: spacing.md },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  status: { textTransform: 'capitalize', color: colors.primary, fontWeight: '700' },
  price: { fontWeight: '800', color: colors.text },
  addr: { marginTop: spacing.sm, color: colors.text, fontWeight: '600', fontSize: 15 },
  date: { marginTop: 4, color: colors.textMuted, fontSize: 13 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  error: { color: colors.danger, padding: spacing.lg },
});
