import { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import AppIcon from './AppIcon';
import {
  bookingService,
  decodeBookingMeta,
  formatPriceCents,
  HANDOFF_ISSUE_REASONS,
} from '../../services/bookingService';
import { getPackage } from '../../services/pricingService';
import { emitBookingsSync } from '../../lib/bookingSyncEvents';
import { emitNotificationsSync } from '../../lib/notificationSyncEvents';
import { CUSTOMER_LAYOUT } from '../../constants/customerTheme';

function formatWhen(iso) {
  if (!iso) return 'Just now';
  try {
    return new Date(iso).toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return 'Just now';
  }
}

function formatHandoffError(err) {
  const raw = err?.message || '';
  if (/already|completed/i.test(raw)) return 'This booking is already completed.';
  if (/not available|not ready|422|validation/i.test(raw)) {
    return 'This review is no longer available. Pull to refresh.';
  }
  if (/Session expired/i.test(raw)) return raw;
  return raw.length > 100 ? 'Could not complete this step. Try again.' : raw || 'Something went wrong. Try again.';
}

export default function WashCompletionReviewCard({ booking, vehicle, onUpdated }) {
  const { theme } = useTheme();
  const toast = useToast();
  const insets = useSafeAreaInsets();
  const c = theme.customer;
  const s = styles(theme);

  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueKey, setIssueKey] = useState(null);
  const [issueDetail, setIssueDetail] = useState('');

  const { packageId } = decodeBookingMeta(booking?.notes);
  const pkg = getPackage(packageId);
  const photos = booking?.photos || [];
  const beforePhotos = photos.filter((p) => p.kind === 'before');
  const afterPhotos = photos.filter((p) => p.kind === 'after');

  const washerName = booking?.washer?.full_name || 'Your washer';
  const washerRating = booking?.washer?.rating_avg;

  const handleConfirm = useCallback(async () => {
    if (submitting || confirmed) return;
    setSubmitting(true);
    try {
      await bookingService.confirmHandoff(booking.id);
      setConfirmed(true);
      emitBookingsSync({ source: 'handoff_confirm', bookingId: booking.id });
      emitNotificationsSync({ source: 'handoff_confirm', bookingId: booking.id });
      await onUpdated?.();
    } catch (err) {
      toast.error(formatHandoffError(err));
      await onUpdated?.();
    } finally {
      setSubmitting(false);
    }
  }, [booking?.id, confirmed, onUpdated, submitting, toast]);

  const handleReportIssue = useCallback(async () => {
    if (!issueKey || submitting) return;
    setSubmitting(true);
    try {
      await bookingService.reportHandoffIssue(booking.id, {
        reasonKey: issueKey,
        reasonDetail: issueDetail.trim() || undefined,
      });
      setIssueOpen(false);
      emitBookingsSync({ source: 'handoff_issue', bookingId: booking.id });
      emitNotificationsSync({ source: 'handoff_issue', bookingId: booking.id });
      toast.info('Report submitted. Our team will follow up.');
      await onUpdated?.();
    } catch (err) {
      toast.error(formatHandoffError(err));
    } finally {
      setSubmitting(false);
    }
  }, [booking?.id, issueDetail, issueKey, onUpdated, submitting, toast]);

  const photoStrip = useMemo(() => {
    const items = [...beforePhotos.slice(0, 2), ...afterPhotos.slice(0, 2)];
    if (items.length === 0) return null;
    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.photoScroll}>
        {items.map((p) => (
          <Image key={p.id} source={{ uri: p.url }} style={s.photoThumb} resizeMode="cover" />
        ))}
      </ScrollView>
    );
  }, [afterPhotos, beforePhotos, s.photoScroll, s.photoThumb]);

  if (confirmed) {
    return (
      <MotiView
        from={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        style={[s.card, s.successCard]}
      >
        <View style={s.successIconWrap}>
          <AppIcon name="check-circle" size={36} color="#047857" />
        </View>
        <Text style={s.successTitle}>All done!</Text>
        <Text style={s.successSub}>Thanks for confirming. Your wash is complete.</Text>
      </MotiView>
    );
  }

  return (
    <>
      <View style={s.card}>
        <LinearGradient
          colors={['#0e7490', '#0891b2', '#06b6d4']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={s.hero}
        >
          <Text style={s.heroEyebrow}>Service complete</Text>
          <Text style={s.heroTitle}>Your wash is ready for review</Text>
          <Text style={s.heroSub}>
            Review the result, then confirm to close out this booking.
          </Text>
        </LinearGradient>

        <View style={s.body}>
          <View style={s.washerRow}>
            <View style={s.washerAvatar}>
              <AppIcon name="person" size={20} color={theme.button.primary.text} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.washerName}>{washerName}</Text>
              <Text style={s.metaLine}>
                {pkg?.label || 'Wash'}
                {vehicle ? ` · ${vehicle.make} ${vehicle.model}` : ''}
              </Text>
              <Text style={s.metaMuted}>
                Finished {formatWhen(booking.handoff_requested_at || booking.updated_at)}
              </Text>
            </View>
            {washerRating != null ? (
              <View style={s.ratingChip}>
                <AppIcon name="star" size={12} color="#f59e0b" />
                <Text style={s.ratingText}>{Number(washerRating).toFixed(1)}</Text>
              </View>
            ) : null}
          </View>

          {photoStrip}

          <Text style={s.priceLine}>
            {formatPriceCents(booking.price_cents, booking.currency)}
          </Text>

          <TouchableOpacity
            style={[s.primaryBtn, submitting && s.btnDisabled]}
            onPress={handleConfirm}
            disabled={submitting}
            activeOpacity={0.88}
          >
            {submitting ? (
              <ActivityIndicator color={theme.button.primary.text} />
            ) : (
              <>
                <AppIcon name="verified" size={18} color={theme.button.primary.text} />
                <Text style={s.primaryBtnText}>Confirm & Complete</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={s.secondaryBtn}
            onPress={() => setIssueOpen(true)}
            disabled={submitting}
            activeOpacity={0.88}
          >
            <AppIcon name="report-problem" size={16} color={c.error} />
            <Text style={s.secondaryBtnText}>Report an issue</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal visible={issueOpen} transparent animationType="slide" onRequestClose={() => setIssueOpen(false)}>
        <Pressable style={s.modalBackdrop} onPress={() => setIssueOpen(false)} />
        <View style={[s.sheet, { paddingBottom: insets.bottom + 16 }]}>
          <Text style={s.sheetTitle}>Report an issue</Text>
          <Text style={s.sheetSub}>Tell us what went wrong. Support may reach out shortly.</Text>
          {HANDOFF_ISSUE_REASONS.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[s.reasonRow, issueKey === r.key && s.reasonRowActive]}
              onPress={() => setIssueKey(r.key)}
            >
              <Text style={s.reasonText}>{r.label}</Text>
              {issueKey === r.key ? (
                <AppIcon name="check-circle" size={18} color={theme.accent.primary} />
              ) : null}
            </TouchableOpacity>
          ))}
          <TouchableOpacity
            style={[s.primaryBtn, (!issueKey || submitting) && s.btnDisabled, { marginTop: 12 }]}
            onPress={handleReportIssue}
            disabled={!issueKey || submitting}
          >
            {submitting ? (
              <ActivityIndicator color={theme.button.primary.text} />
            ) : (
              <Text style={s.primaryBtnText}>Submit report</Text>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </>
  );
}

const styles = (theme) => {
  const c = theme.customer;
  return StyleSheet.create({
    card: {
      borderRadius: CUSTOMER_LAYOUT.card.radiusLg,
      overflow: 'hidden',
      backgroundColor: c.surfaceContainer,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: c.outlineVariant,
    },
    hero: { padding: 20, paddingBottom: 22 },
    heroEyebrow: {
      fontSize: 11,
      fontWeight: '700',
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      color: 'rgba(255,255,255,0.85)',
    },
    heroTitle: {
      marginTop: 6,
      fontSize: 22,
      fontWeight: '800',
      color: '#fff',
      letterSpacing: -0.3,
    },
    heroSub: { marginTop: 8, fontSize: 14, lineHeight: 20, color: 'rgba(255,255,255,0.92)' },
    body: { padding: 16, gap: 14 },
    washerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
    washerAvatar: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: theme.accent.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    washerName: { fontSize: 16, fontWeight: '700', color: theme.text.primary },
    metaLine: { fontSize: 13, color: theme.text.secondary, marginTop: 2 },
    metaMuted: { fontSize: 12, color: theme.text.muted, marginTop: 2 },
    ratingChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 999,
      backgroundColor: 'rgba(245,158,11,0.14)',
    },
    ratingText: { fontSize: 12, fontWeight: '700', color: '#b45309' },
    photoScroll: { marginHorizontal: -4 },
    photoThumb: {
      width: 88,
      height: 88,
      borderRadius: 12,
      marginHorizontal: 4,
      backgroundColor: c.surfaceContainerLow,
    },
    priceLine: { fontSize: 15, fontWeight: '700', color: theme.text.primary },
    primaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      backgroundColor: theme.button.primary.background,
      borderRadius: theme.radius.lg,
      paddingVertical: 14,
      minHeight: 52,
    },
    primaryBtnText: { color: theme.button.primary.text, fontSize: 16, fontWeight: '800' },
    secondaryBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: theme.radius.lg,
      borderWidth: 1,
      borderColor: 'rgba(220,38,38,0.25)',
      backgroundColor: 'rgba(220,38,38,0.06)',
    },
    secondaryBtnText: { color: c.error, fontSize: 14, fontWeight: '700' },
    btnDisabled: { opacity: 0.6 },
    successCard: { padding: 24, alignItems: 'center' },
    successIconWrap: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: 'rgba(16,185,129,0.14)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    successTitle: { marginTop: 12, fontSize: 20, fontWeight: '800', color: theme.text.primary },
    successSub: { marginTop: 6, fontSize: 14, color: theme.text.secondary, textAlign: 'center' },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.45)' },
    sheet: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: c.surfaceContainer,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
    },
    sheetTitle: { fontSize: 18, fontWeight: '800', color: theme.text.primary },
    sheetSub: { fontSize: 13, color: theme.text.secondary, marginTop: 4, marginBottom: 12 },
    reasonRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: 12,
      paddingHorizontal: 12,
      borderRadius: 12,
      marginBottom: 6,
      backgroundColor: c.surfaceContainerLow,
    },
    reasonRowActive: { borderWidth: 1, borderColor: theme.accent.primary },
    reasonText: { fontSize: 14, fontWeight: '600', color: theme.text.primary },
  });
};
