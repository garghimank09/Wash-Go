import { View, Text, ScrollView, StyleSheet, RefreshControl } from 'react-native';
import { useMemo } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerStatus } from '../../context/PartnerStatusContext';
import PartnerHeader from '../../components/partner/PartnerHeader';
import AvailabilityCard from '../../components/partner/AvailabilityCard';
import LiveZoneCard from '../../components/partner/LiveZoneCard';
import StatsGrid from '../../components/partner/StatsGrid';
import ActiveJobCard from '../../components/partner/ActiveJobCard';
import JobTimeline from '../../components/partner/JobTimeline';
import PartnerNotifPanel from '../../components/partner/PartnerNotifPanel';
import usePartnerBookings from '../../hooks/usePartnerBookings';
import usePartnerOffers from '../../hooks/usePartnerOffers';
import {
  mapBookingToCard,
  summarizeBookings,
} from '../../lib/partnerMappers';
import { formatBookingTime } from '../../lib/partnerFormatters';
import { usePartnerScrollEndPadding } from '../../hooks/usePartnerContentPadding';

const TIMELINE_PHASE_BY_STATUS = {
  pending: 'searching',
  confirmed: 'accepted',
  in_progress: 'in_progress',
  completed: 'completed',
  cancelled: 'cancelled',
};

function isTodayIso(iso) {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

export default function PartnerHome() {
  const { theme } = useTheme();
  const router = useRouter();
  const { serviceArea } = usePartnerStatus();
  const scrollEndPadding = usePartnerScrollEndPadding();

  const { items, refreshing, reload } = usePartnerBookings();
  const { items: offers } = usePartnerOffers();

  const stats = useMemo(() => summarizeBookings(items), [items]);

  const activeJobs = useMemo(
    () =>
      items
        .filter((b) => b.status === 'confirmed' || b.status === 'in_progress')
        .map(mapBookingToCard)
        .filter(Boolean),
    [items],
  );

  const todayTimeline = useMemo(
    () =>
      items
        .filter((b) => isTodayIso(b.scheduled_at))
        .sort(
          (a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at),
        )
        .map((b) => ({
          id: b.id,
          time: formatBookingTime(b.scheduled_at),
          phase: TIMELINE_PHASE_BY_STATUS[b.status] || 'searching',
          label: b.notes ? 'Custom wash' : 'Wash booking',
          customer: b.customer_name || 'Customer',
        })),
    [items],
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.customer.surface }]} edges={['top']}>
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
        <PartnerHeader />
        <AvailabilityCard />
        <LiveZoneCard
          onPress={() => router.push('/(partner)/offers')}
          nearbyRequests={offers.length}
          serviceArea={serviceArea}
        />
        <StatsGrid stats={stats} />

        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
            Active jobs
          </Text>
          <Text style={[styles.sectionMeta, { color: theme.text.secondary }]}>
            {activeJobs.length} ongoing
          </Text>
        </View>

        {activeJobs.length === 0 ? (
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
              No active jobs
            </Text>
            <Text style={[styles.emptyBody, { color: theme.text.secondary }]}>
              Accept a nearby request to see it live here.
            </Text>
          </View>
        ) : (
          activeJobs.map((job, i) => (
            <ActiveJobCard
              key={job.id}
              job={job}
              index={i}
              onPress={(j) => router.push(`/(partner)/job/${j.id}`)}
            />
          ))
        )}

        <JobTimeline items={todayTimeline} />
      </ScrollView>

      <PartnerNotifPanel />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingTop: 4 },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 28,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  sectionMeta: { fontSize: 12, fontWeight: '600' },
  emptyCard: {
    marginHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  emptyBody: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
});
