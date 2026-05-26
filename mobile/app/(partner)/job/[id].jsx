import { useCallback, useEffect, useMemo, useState } from 'react';
import { View, StyleSheet, RefreshControl, Linking } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useToast } from '../../../context/ToastContext';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import ActiveJobHeader from '../../../components/partner/job/ActiveJobHeader';
import RouteMapCard from '../../../components/partner/job/RouteMapCard';
import CustomerInfoCard from '../../../components/partner/job/CustomerInfoCard';
import CustomerJobDetailSheet from '../../../components/partner/job/CustomerJobDetailSheet';
import FieldBriefingCard from '../../../components/partner/job/FieldBriefingCard';
import UploadProofCard from '../../../components/partner/job/UploadProofCard';
import WashChecklistCard from '../../../components/partner/job/WashChecklistCard';
import WashTimeline from '../../../components/partner/job/WashTimeline';
import FloatingActionFooter, {
  FLOATING_FOOTER_BASE_HEIGHT,
} from '../../../components/partner/job/FloatingActionFooter';
import JobSkeleton from '../../../components/partner/job/JobSkeleton';
import JobLoadError from '../../../components/partner/job/JobLoadError';
import TrackingMapNotice from '../../../components/partner/job/TrackingMapNotice';
import PartnerNotifPanel from '../../../components/partner/PartnerNotifPanel';
import useJobRealtime from '../../../hooks/useJobRealtime';
import useJobChecklist from '../../../hooks/useJobChecklist';
import useJobUploads from '../../../hooks/useJobUploads';
import usePartnerJob from '../../../hooks/usePartnerJob';
import usePartnerLocationReporter from '../../../hooks/usePartnerLocationReporter';
import { isPhaseAtLeast } from '../../../lib/jobPhases';
import { canDialPhone, normalizeForTel } from '../../../lib/partnerPhone';
import { formatJobAdvanceError } from '../../../lib/partnerJobErrors';

/**
 * Single partner job workspace — opened from Home (active card), Schedule (Open job),
 * or Offers (after accept). Phase CTAs advance in-place via useJobRealtime; see
 * mobile/docs/partner-job-flow.md.
 */

const HEADER_HEIGHT = 64;

export default function PartnerJobScreen() {
  const params = useLocalSearchParams();
  const router = useRouter();
  const { theme } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const bookingId = Array.isArray(params.id) ? params.id[0] : params.id;

  const { detail, tracking, loading, error, trackingError, refresh, refetchDetail } =
    usePartnerJob(bookingId);

  const handleStatusSynced = useCallback(async () => {
    await refetchDetail();
  }, [refetchDetail]);

  const realtime = useJobRealtime({
    bookingId,
    apiStatus: detail?.status,
    tracking,
    onStatusSynced: handleStatusSynced,
  });

  const checklist = useJobChecklist(bookingId);
  const uploads = useJobUploads(bookingId);

  const [refreshing, setRefreshing] = useState(false);
  const [advancing, setAdvancing] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [customerSheetOpen, setCustomerSheetOpen] = useState(false);

  const reportingEnabled =
    !!bookingId &&
    !!detail &&
    detail.status !== 'completed' &&
    detail.status !== 'cancelled';
  usePartnerLocationReporter(reportingEnabled);

  useEffect(() => {
    if (realtime.phase === 'service_started' && uploads.counts.beforeSuccess > 0) {
      realtime.advance('before_uploaded').catch(() => {});
    }
    if (realtime.phase === 'washing' && uploads.counts.afterSuccess > 0) {
      realtime.advance('after_uploaded').catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [realtime.phase, uploads.counts.beforeSuccess, uploads.counts.afterSuccess]);

  const onScroll = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollY.value = e.contentOffset.y;
    },
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);

  const handleRetryLoad = useCallback(async () => {
    setRetrying(true);
    try {
      await refresh();
    } finally {
      setRetrying(false);
    }
  }, [refresh]);

  const handlePrimary = useCallback(async () => {
    if (advancing) return;
    if (realtime.phase === 'completed') {
      router.back();
      return;
    }
    setAdvancing(true);
    try {
      await realtime.advance();
    } catch (err) {
      toast.error(formatJobAdvanceError(err));
    } finally {
      setAdvancing(false);
    }
  }, [advancing, realtime, router, toast]);

  const handleCall = useCallback(async () => {
    const raw = detail?.customer?.phone;
    if (!canDialPhone(raw)) {
      toast.error('No valid phone number for this customer.');
      return;
    }
    const num = normalizeForTel(raw);
    const url = `tel:${num}`;
    try {
      const supported = await Linking.canOpenURL(url);
      if (!supported) {
        toast.error('Calls are not supported on this device.');
        return;
      }
      await Linking.openURL(url);
    } catch {
      toast.error('Could not start the call. Try again.');
    }
  }, [detail, toast]);

  const { footerDisabled, footerHint } = useMemo(() => {
    if (realtime.phase === 'service_started') {
      const need = uploads.counts.beforeSuccess === 0;
      return {
        footerDisabled: need,
        footerHint: need ? 'Upload at least one before-wash photo' : null,
      };
    }
    if (realtime.phase === 'washing') {
      const need = uploads.counts.afterSuccess === 0;
      return {
        footerDisabled: need,
        footerHint: need ? 'Upload after-wash photos to wrap' : null,
      };
    }
    if (realtime.phase === 'after_uploaded') {
      const incomplete = checklist.progress < 1;
      return {
        footerDisabled: incomplete,
        footerHint: incomplete
          ? `Complete ${checklist.total - checklist.completed} more checklist items`
          : null,
      };
    }
    if (realtime.phase === 'approval_pending') {
      const handoff = detail?.handoff_status || detail?.handoffStatus;
      if (handoff === 'issue_reported') {
        return {
          footerDisabled: true,
          footerHint: 'Customer reported an issue — support will follow up',
        };
      }
      return { footerDisabled: true, footerHint: 'Awaiting customer confirmation' };
    }
    return { footerDisabled: false, footerHint: null };
  }, [
    realtime.phase,
    detail?.handoff_status,
    detail?.handoffStatus,
    uploads.counts,
    checklist.progress,
    checklist.total,
    checklist.completed,
  ]);

  const showBriefing = !isPhaseAtLeast(realtime.phase, 'completed') && detail?.briefing?.notes;
  const showUploads = isPhaseAtLeast(realtime.phase, 'arrived');
  const uploadBucket =
    realtime.phase === 'washing' ||
    realtime.phase === 'after_uploaded' ||
    realtime.phase === 'qc_complete'
      ? 'after'
      : 'before';
  const showChecklist = isPhaseAtLeast(realtime.phase, 'before_uploaded');

  const topPadding = insets.top + HEADER_HEIGHT + 4;
  const bottomPadding = FLOATING_FOOTER_BASE_HEIGHT + Math.max(insets.bottom, 14) + 16;

  const ready = !loading && !!detail && !error;
  const loadFailed = !loading && (!!error || !detail);

  return (
    <View style={[styles.safe, { backgroundColor: theme.customer.surface }]}>
      <Animated.ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingTop: topPadding, paddingBottom: bottomPadding },
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
        {loading ? (
          <JobSkeleton />
        ) : loadFailed ? (
          <JobLoadError message={error} onRetry={handleRetryLoad} loading={retrying} />
        ) : (
          <>
            <TrackingMapNotice message={trackingError} />

            <RouteMapCard
              washerCoord={realtime.washerCoord}
              customerCoord={
                realtime.customerCoord || detail?.address?.coords || null
              }
              route={realtime.route}
              etaMinutes={realtime.etaMinutes ?? detail?.etaMinutes}
              distanceKm={realtime.distanceKm}
              phase={realtime.phase}
              trafficLevel="light"
            />

            <CustomerInfoCard
              job={detail}
              onOpenDetails={() => setCustomerSheetOpen(true)}
            />

            {showBriefing ? <FieldBriefingCard briefing={detail.briefing} /> : null}

            {showUploads ? (
              <UploadProofCard
                buckets={uploads.buckets}
                counts={uploads.counts}
                pickFromCamera={uploads.pickFromCamera}
                pickFromLibrary={uploads.pickFromLibrary}
                retry={uploads.retry}
                remove={uploads.remove}
                visibleBucket={uploadBucket}
              />
            ) : null}

            {showChecklist ? (
              <WashChecklistCard
                rows={checklist.rows}
                toggle={checklist.toggle}
                progress={checklist.progress}
                saveStatus={checklist.saveStatus}
              />
            ) : null}

            <WashTimeline phase={realtime.phase} events={realtime.events} />
          </>
        )}
      </Animated.ScrollView>

      <ActiveJobHeader
        scrollY={scrollY}
        phase={realtime.phase}
        connection={realtime.connection}
      />

      {ready ? (
        <FloatingActionFooter
          phase={realtime.phase}
          disabled={footerDisabled}
          disabledReason={footerHint}
          loading={advancing}
          onPrimary={handlePrimary}
          onCall={handleCall}
          callDisabled={!canDialPhone(detail?.customer?.phone)}
        />
      ) : null}

      <CustomerJobDetailSheet
        visible={customerSheetOpen}
        job={detail}
        onClose={() => setCustomerSheetOpen(false)}
      />

      <PartnerNotifPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {},
});
