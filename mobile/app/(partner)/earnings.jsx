import { useCallback, useState } from 'react';
import { View, Text, StyleSheet, RefreshControl } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerScrollEndPadding } from '../../hooks/usePartnerContentPadding';
import { usePartnerEarnings } from '../../context/PartnerEarningsContext';
import EarningsHeader from '../../components/partner/earnings/EarningsHeader';
import EarningsHeroCard from '../../components/partner/earnings/EarningsHeroCard';
import PendingPayoutCard from '../../components/partner/earnings/PendingPayoutCard';
import WeeklyChartCard from '../../components/partner/earnings/WeeklyChartCard';
import StatsMiniCard from '../../components/partner/earnings/StatsMiniCard';
import EarningsHistoryItem from '../../components/partner/earnings/EarningsHistoryItem';
import EarningsSkeleton from '../../components/partner/earnings/EarningsSkeleton';
import PartnerNotifPanel from '../../components/partner/PartnerNotifPanel';

const HEADER_HEIGHT = 60;

function EarningsContent() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollEndPadding = usePartnerScrollEndPadding();
  const scrollY = useSharedValue(0);

  const { loading, refreshing, reload, payouts } = usePartnerEarnings();
  const [dismissed, setDismissed] = useState(() => new Set());
  const visiblePayouts = payouts.filter((p) => !dismissed.has(p.id));

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const onRefresh = useCallback(async () => {
    await reload();
  }, [reload]);

  const handleDismissPayout = useCallback((id) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const topPadding = insets.top + HEADER_HEIGHT + 4;
  const ready = !loading;

  return (
    <View style={[styles.safe, { backgroundColor: theme.customer.surface }]}>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPadding, paddingBottom: scrollEndPadding + 12 },
        ]}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
            progressViewOffset={topPadding - 8}
          />
        }
      >
        {!ready ? (
          <EarningsSkeleton />
        ) : (
          <>
            <EarningsHeroCard />
            <PendingPayoutCard />
            <WeeklyChartCard />
            <StatsMiniCard />

            <View style={styles.historyHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text.primary }]}>
                Recent payouts
              </Text>
              <Text style={[styles.sectionMeta, { color: theme.text.secondary }]}>
                {visiblePayouts.length} {visiblePayouts.length === 1 ? 'entry' : 'entries'}
              </Text>
            </View>

            <View style={styles.historyList}>
              {visiblePayouts.length === 0 ? (
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
                    No completed jobs yet
                  </Text>
                  <Text style={[styles.emptySub, { color: theme.text.secondary }]}>
                    Completed bookings will appear here once you finish your first wash.
                  </Text>
                </View>
              ) : (
                visiblePayouts.map((payout, i) => (
                  <EarningsHistoryItem
                    key={payout.id}
                    item={payout}
                    index={i}
                    onDismiss={handleDismissPayout}
                  />
                ))
              )}
            </View>
          </>
        )}
      </Animated.ScrollView>

      <EarningsHeader scrollY={scrollY} />
      <PartnerNotifPanel />
    </View>
  );
}

export default function PartnerEarnings() {
  return <EarningsContent />;
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { paddingBottom: 8 },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', letterSpacing: -0.3 },
  sectionMeta: { fontSize: 12, fontWeight: '600' },
  historyList: {
    paddingHorizontal: 20,
    gap: 10,
  },
  emptyCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 18,
    alignItems: 'center',
    gap: 4,
  },
  emptyTitle: { fontSize: 15, fontWeight: '800', letterSpacing: -0.2 },
  emptySub: { fontSize: 12, fontWeight: '500', textAlign: 'center' },
});
