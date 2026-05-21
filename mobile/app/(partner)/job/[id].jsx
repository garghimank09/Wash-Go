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
import FieldBriefingCard from '../../../components/partner/job/FieldBriefingCard';
import UploadProofCard from '../../../components/partner/job/UploadProofCard';
import WashChecklistCard from '../../../components/partner/job/WashChecklistCard';
import WashTimeline from '../../../components/partner/job/WashTimeline';
import FloatingActionFooter, {
  FLOATING_FOOTER_BASE_HEIGHT,
} from '../../../components/partner/job/FloatingActionFooter';
import JobSkeleton from '../../../components/partner/job/JobSkeleton';
import PartnerNotifPanel from '../../../components/partner/PartnerNotifPanel';
import useJobRealtime from '../../../hooks/useJobRealtime';
import useJobChecklist from '../../../hooks/useJobChecklist';
import useJobUploads from '../../../hooks/useJobUploads';
import usePartnerJob from '../../../hooks/usePartnerJob';
import usePartnerLocationReporter from '../../../hooks/usePartnerLocationReporter';
import { isPhaseAtLeast } from '../../../lib/jobPhases';
import { canDialPhone, normalizeForTel } from '../../../lib/partnerPhone';

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

  const { detail, tracking, loading, error, refresh } = usePartnerJob(bookingId);

  const realtime = useJobRealtime({
    bookingId,
    apiStatus: detail?.status,
    tracking,
  });

  const checklist = useJobChecklist(bookingId);
  const uploads = useJobUploads(bookingId);

  const [refreshing, setRefreshing] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  // GPS heartbeat — only while the job is meaningfully active.
  const reportingEnabled =
    !!bookingId &&
    !!detail &&
    detail.status !== 'completed' &&
    detail.status !== 'cancelled';
  usePartnerLocationReporter(reportingEnabled);

  // Move forward automatically once the first photo of each bucket uploads.
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
      toast.error(err?.message || 'Could not update job status. Try again.');
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

  // Footer state ------------------------------------------------------------
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
      return { footerDisabled: true, footerHint: 'Awaiting customer confirmation' };
    }
    return { footerDisabled: false, footerHint: null };
  }, [
    realtime.phase,
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

  const ready = !loading && !!detail;

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
        {!ready ? (
          <JobSkeleton />
        ) : (
          <>
            <RouteMapCard
              washerCoord={realtime.washerCoord}
              customerCoord={
                realtime.customerCoord || detail?.address?.coords || null
              }
              route={realtime.route}
              etaMinutes={realtime.etaMinutes}
              distanceKm={realtime.distanceKm}
              phase={realtime.phase}
              trafficLevel="light"
            />

            <CustomerInfoCard job={detail} />

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

      <PartnerNotifPanel />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: {},
});
