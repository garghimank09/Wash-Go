import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MotiView } from 'moti';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { useRouter } from 'expo-router';
import { onBookingsSync } from '../../lib/bookingSyncEvents';
import { bookingService } from '../../services/bookingService';
import { deriveCustomerPhase } from '../../lib/customerBookingPhase';
import { NOTIF_COPY } from '../../lib/notificationDerivation';

const PHASE_ALERTS = {
  accepted: NOTIF_COPY.accepted,
  on_the_way: NOTIF_COPY.on_the_way,
  in_progress: NOTIF_COPY.in_progress,
  completed: NOTIF_COPY.completed,
  cancelled: NOTIF_COPY.cancelled,
};

/**
 * Top in-app banner when an active booking phase changes (Uber-style live updates).
 */
export default function RealtimeBanner() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const phaseMapRef = useRef(new Map());
  const [banner, setBanner] = useState(null);
  const hideTimer = useRef(null);

  const showBanner = (payload) => {
    if (hideTimer.current) clearTimeout(hideTimer.current);
    setBanner(payload);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    hideTimer.current = setTimeout(() => setBanner(null), 5200);
  };

  const refreshPhases = async () => {
    try {
      const bookings = await bookingService.getBookings();
      const nextMap = new Map();
      for (const b of bookings) {
        const phase = deriveCustomerPhase(b);
        nextMap.set(b.id, phase);
        const prev = phaseMapRef.current.get(b.id);
        if (prev && prev !== phase && PHASE_ALERTS[phase]) {
          const copy = PHASE_ALERTS[phase];
          showBanner({
            bookingId: b.id,
            title: copy.title,
            message: copy.message,
          });
        }
      }
      phaseMapRef.current = nextMap;
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    refreshPhases();
    const off = onBookingsSync(() => refreshPhases());
    return () => {
      off();
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  if (!banner) return null;

  return (
    <View pointerEvents="box-none" style={[styles.viewport, { top: insets.top + 8 }]}>
      <Pressable
        onPress={() => {
          setBanner(null);
          if (banner.bookingId) router.push(`/booking/${banner.bookingId}`);
        }}
      >
        <MotiView
          from={{ opacity: 0, translateY: -16 }}
          animate={{ opacity: 1, translateY: 0 }}
          exit={{ opacity: 0, translateY: -12 }}
          style={styles.card}
        >
          <View style={styles.dot} />
          <View style={styles.textCol}>
            <Text style={styles.title}>{banner.title}</Text>
            <Text style={styles.body} numberOfLines={2}>
              {banner.message}
            </Text>
          </View>
          <Text style={styles.cta}>View</Text>
        </MotiView>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 200,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    backgroundColor: 'rgba(15,23,42,0.94)',
    borderWidth: 1,
    borderColor: 'rgba(6,182,212,0.35)',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22d3ee',
  },
  textCol: { flex: 1 },
  title: { color: '#f8fafc', fontSize: 14, fontWeight: '800' },
  body: { color: 'rgba(248,250,252,0.75)', fontSize: 12, marginTop: 2, lineHeight: 16 },
  cta: { color: '#22d3ee', fontSize: 13, fontWeight: '800' },
});
