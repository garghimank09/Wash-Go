import { useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Inbox } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import OfferCard from '../../components/partner/OfferCard';
import PartnerNotifPanel from '../../components/partner/PartnerNotifPanel';
import usePartnerOffers from '../../hooks/usePartnerOffers';
import { partnerBookingsService } from '../../services/partnerBookingsService';
import { emitPartnerBookingsSync } from '../../lib/partnerSyncEvents';
import { emitNotificationsSync } from '../../lib/notificationSyncEvents';
import { mapOfferCard } from '../../lib/partnerMappers';
import { usePartnerScrollEndPadding } from '../../hooks/usePartnerContentPadding';

export default function PartnerOffers() {
  const { theme } = useTheme();
  const router = useRouter();
  const toast = useToast();
  const scrollEndPadding = usePartnerScrollEndPadding();
  const { items, loading, refreshing, error, reload, reloadSilent } = usePartnerOffers();

  const handleAccept = useCallback(
    async (offer) => {
      try {
        await partnerBookingsService.accept(offer.id);
        emitPartnerBookingsSync({ source: 'offer_accepted' });
        emitNotificationsSync({ source: 'offer_accepted' });
        toast.success('Job accepted');
        router.push(`/(partner)/job/${offer.id}`);
        reloadSilent();
      } catch (err) {
        toast.error(
          err?.message ||
            'Another washer may have accepted this booking. Try another.',
        );
        reloadSilent();
      }
    },
    [router, reloadSilent, toast],
  );

  const cards = items.map(mapOfferCard).filter(Boolean);

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.customer.surface }]}
      edges={['top']}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text.primary }]}>Open offers</Text>
        <Text style={[styles.subtitle, { color: theme.text.secondary }]}>
          Live requests from customers nearby. Accept to claim the job.
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: scrollEndPadding }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={reload}
            tintColor={theme.accent.primary}
          />
        }
      >
        {loading ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.customer.surfaceContainerLowest,
                borderColor: theme.customer.outlineVariant,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
              Loading offers…
            </Text>
          </View>
        ) : error ? (
          <View
            style={[
              styles.emptyCard,
              {
                backgroundColor: theme.customer.surfaceContainerLowest,
                borderColor: theme.customer.outlineVariant,
              },
            ]}
          >
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
              Could not load offers
            </Text>
            <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
              {error}
            </Text>
          </View>
        ) : cards.length === 0 ? (
          <View style={styles.empty}>
            <View
              style={[
                styles.iconBubble,
                { backgroundColor: theme.customer.primaryBg },
              ]}
            >
              <Inbox size={28} color={theme.accent.primary} strokeWidth={2} />
            </View>
            <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
              No open offers right now
            </Text>
            <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
              Make sure you’re online and accepting jobs. New requests will appear here automatically.
            </Text>
          </View>
        ) : (
          cards.map((offer, i) => (
            <OfferCard
              key={offer.id}
              offer={offer}
              index={i}
              onAccept={handleAccept}
            />
          ))
        )}
      </ScrollView>

      <PartnerNotifPanel />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', letterSpacing: -0.4 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 4 },
  scroll: { paddingTop: 8 },
  empty: {
    alignItems: 'center',
    paddingHorizontal: 28,
    paddingTop: 60,
    gap: 10,
  },
  iconBubble: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  emptyCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    gap: 4,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  emptyBody: {
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
    maxWidth: 280,
  },
});
