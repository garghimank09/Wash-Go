import { useCallback, useMemo } from 'react';
import { View, StyleSheet, RefreshControl } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerScrollEndPadding } from '../../hooks/usePartnerContentPadding';
import {
  PartnerScheduleProvider,
  usePartnerSchedule,
} from '../../context/PartnerScheduleContext';
import ScheduleHeader from '../../components/partner/schedule/ScheduleHeader';
import ScheduleHeroCard from '../../components/partner/schedule/ScheduleHeroCard';
import ScheduleDatePicker from '../../components/partner/schedule/ScheduleDatePicker';
import ScheduleTimeline from '../../components/partner/schedule/ScheduleTimeline';
import RouteSummaryCard from '../../components/partner/schedule/RouteSummaryCard';
import ScheduleInsightCard from '../../components/partner/schedule/ScheduleInsightCard';
import EarningsPreviewCard from '../../components/partner/schedule/EarningsPreviewCard';
import ScheduleSkeleton from '../../components/partner/schedule/ScheduleSkeleton';
import PartnerNotifPanel from '../../components/partner/PartnerNotifPanel';

const HEADER_HEIGHT = 60;
const DATE_PICKER_INDEX = 1;

function ScheduleContent() {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollEndPadding = usePartnerScrollEndPadding();
  const scrollY = useSharedValue(0);

  const {
    days,
    selectedKey,
    setSelectedKey,
    loading,
    refreshing,
    reload,
    countBookingsForDate,
  } = usePartnerSchedule();

  const selectedDay = useMemo(() => {
    const found = days.find((d) => d.key === selectedKey);
    return found || days[0] || null;
  }, [days, selectedKey]);

  const showRoute = countBookingsForDate(selectedKey) > 0;

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const onRefresh = useCallback(async () => {
    await reload();
  }, [reload]);

  const scrollTopOffset = insets.top + HEADER_HEIGHT;
  const ready = !loading;

  return (
    <View style={[styles.safe, { backgroundColor: theme.customer.surface }]}>
      <Animated.ScrollView
        style={{ marginTop: scrollTopOffset }}
        contentContainerStyle={{ paddingBottom: scrollEndPadding + 12 }}
        showsVerticalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        stickyHeaderIndices={ready ? [DATE_PICKER_INDEX] : undefined}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
          />
        }
      >
        {!ready || !selectedDay ? (
          <ScheduleSkeleton />
        ) : (
          <>
            <ScheduleHeroCard dateKey={selectedDay.key} />
            <ScheduleDatePicker selectedKey={selectedKey} onSelect={setSelectedKey} />
            <ScheduleTimeline dateKey={selectedDay.key} isToday={selectedDay.isToday} />
            {showRoute ? <RouteSummaryCard /> : null}
            <ScheduleInsightCard />
            <EarningsPreviewCard
              dateKey={selectedDay.key}
              isToday={selectedDay.isToday}
            />
          </>
        )}
      </Animated.ScrollView>

      <ScheduleHeader scrollY={scrollY} />
      <PartnerNotifPanel />
    </View>
  );
}

export default function PartnerSchedule() {
  return (
    <PartnerScheduleProvider>
      <ScheduleContent />
    </PartnerScheduleProvider>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
