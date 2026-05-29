import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MapPin, CheckCircle2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../context/ThemeContext';
import { bookingService } from '../../services/bookingService';
import { photoUrl } from '../../services/partnerPhotoService';
import { emitBookingsSync } from '../../lib/bookingSyncEvents';
import { emitNotificationsSync } from '../../lib/notificationSyncEvents';
import { useToast } from '../../context/ToastContext';

/**
 * Customer approves vehicle condition before wash starts (web parity).
 */
export default function ArrivalApprovalCard({ booking, onApproved }) {
  const { theme } = useTheme();
  const toast = useToast();
  const c = theme.customer;
  const [submitting, setSubmitting] = useState(false);

  const arrival = booking?.photos?.find((p) => p.kind === 'arrival');
  const phase = booking?.service_phase || booking?.servicePhase;
  const pending = phase === 'awaiting_arrival_approval' && Boolean(arrival);
  const approved =
    phase === 'arrival_approved' || phase === 'wash_in_progress' || booking?.status === 'completed';

  if (!arrival && !pending && !approved) return null;

  const handleApprove = async () => {
    if (!booking?.id) return;
    setSubmitting(true);
    try {
      await bookingService.approveArrival(booking.id);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      emitBookingsSync({ source: 'arrival_approved', bookingId: booking.id });
      emitNotificationsSync({ source: 'arrival_approved' });
      onApproved?.();
    } catch (err) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
      toast.error(err?.message || 'Could not approve. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: c.surfaceContainerLowest,
          borderColor: pending ? 'rgba(245,158,11,0.45)' : c.outlineVariant,
        },
        theme.shadow.md,
      ]}
    >
      <View style={styles.header}>
        <View style={[styles.iconWrap, { backgroundColor: 'rgba(245,158,11,0.15)' }]}>
          <MapPin size={20} color="#b45309" strokeWidth={2.2} />
        </View>
        <View style={styles.headerText}>
          <Text style={[styles.title, { color: theme.text.primary }]}>Vehicle condition</Text>
          <Text style={[styles.sub, { color: theme.text.secondary }]}>
            {pending
              ? 'Review the photo and notes — approve so your washer can start the wash.'
              : approved
                ? 'You approved the documented condition. The wash can proceed.'
                : 'Condition details will appear when your washer checks in.'}
          </Text>
        </View>
      </View>

      {arrival?.url ? (
        <Image
          source={{ uri: photoUrl(arrival.url) || arrival.url }}
          style={styles.photo}
          resizeMode="cover"
        />
      ) : null}

      {booking?.arrival_condition_notes ? (
        <View style={[styles.notesBox, { backgroundColor: c.surfaceContainerLow }]}>
          <Text style={[styles.notesLabel, { color: theme.text.muted }]}>Washer notes</Text>
          <Text style={[styles.notesBody, { color: theme.text.primary }]}>
            {booking.arrival_condition_notes}
          </Text>
        </View>
      ) : null}

      {pending ? (
        <Pressable
          onPress={handleApprove}
          disabled={submitting}
          style={({ pressed }) => [
            styles.approveBtn,
            { backgroundColor: theme.accent.primary, opacity: pressed || submitting ? 0.88 : 1 },
          ]}
        >
          {submitting ? (
            <ActivityIndicator color={theme.button.primary.text} />
          ) : (
            <>
              <CheckCircle2 size={18} color={theme.button.primary.text} strokeWidth={2.4} />
              <Text style={[styles.approveText, { color: theme.button.primary.text }]}>
                Approve condition & start wash
              </Text>
            </>
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    overflow: 'hidden',
  },
  header: { flexDirection: 'row', gap: 12, alignItems: 'flex-start' },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  title: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  sub: { fontSize: 13, lineHeight: 19, marginTop: 4 },
  photo: {
    width: '100%',
    height: 180,
    borderRadius: 14,
    marginTop: 14,
    backgroundColor: '#e2e8f0',
  },
  notesBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 12,
  },
  notesLabel: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  notesBody: { fontSize: 13, marginTop: 4, lineHeight: 18 },
  approveBtn: {
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 14,
  },
  approveText: { fontSize: 15, fontWeight: '800' },
});
