import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import * as Haptics from 'expo-haptics';
import { MapPin, Clock, ChevronRight } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { getPartnerShadow } from '../../constants/partnerTheme';
import { formatPayoutCurrency, formatBookingTime } from '../../lib/partnerFormatters';

/**
 * Premium open-offer card. Tapping "Accept" claims the booking via
 * {@link onAccept} which should call `POST /bookings/{id}/accept` and
 * navigate to the job screen on success. The card guards against duplicate
 * accepts with a local `accepting` flag and disables itself.
 */
export default function OfferCard({ offer, index = 0, onAccept }) {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);
  const [accepting, setAccepting] = useState(false);

  const handleAccept = async () => {
    if (accepting) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    setAccepting(true);
    try {
      await onAccept?.(offer);
    } finally {
      setAccepting(false);
    }
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260, delay: 30 + index * 35 }}
    >
      <View
        style={[
          styles.card,
          {
            backgroundColor: theme.customer.surfaceContainerLowest,
            borderColor: theme.customer.outlineVariant,
          },
          shadows.rim,
        ]}
      >
        <View style={styles.headerRow}>
          <View style={[styles.avatar, { backgroundColor: theme.customer.primaryBg }]}>
            <Text style={[styles.avatarText, { color: theme.accent.primary }]}>
              {offer.customer?.initial || 'C'}
            </Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.customer, { color: theme.text.primary }]} numberOfLines={1}>
              {offer.customer?.name || 'Customer'}
            </Text>
            {offer.vehicleLabel ? (
              <Text style={[styles.pkg, { color: theme.text.secondary }]} numberOfLines={1}>
                {offer.vehicleLabel}
              </Text>
            ) : null}
          </View>
          <Text style={[styles.price, { color: theme.text.primary }]}>
            {formatPayoutCurrency(offer.partnerPayoutCents ?? offer.priceCents, offer.currency)}
          </Text>
        </View>

        {offer.address ? (
          <View style={styles.row}>
            <MapPin size={14} color={theme.text.muted} strokeWidth={2} />
            <Text style={[styles.rowText, { color: theme.text.secondary }]} numberOfLines={1}>
              {offer.address}
            </Text>
          </View>
        ) : null}

        {offer.scheduledAt ? (
          <View style={styles.row}>
            <Clock size={14} color={theme.text.muted} strokeWidth={2} />
            <Text style={[styles.rowText, { color: theme.text.secondary }]}>
              {formatBookingTime(offer.scheduledAt)}
            </Text>
          </View>
        ) : null}

        <Pressable
          onPress={handleAccept}
          disabled={accepting}
          style={({ pressed }) => [
            styles.acceptBtn,
            {
              backgroundColor: theme.accent.primary,
              opacity: accepting ? 0.7 : pressed ? 0.92 : 1,
            },
          ]}
          accessibilityLabel="Accept this booking"
        >
          <Text style={styles.acceptText}>{accepting ? 'Accepting…' : 'Accept job'}</Text>
          <ChevronRight size={18} color="#ffffff" strokeWidth={2.4} />
        </Pressable>
      </View>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    marginHorizontal: 20,
    marginBottom: 12,
    gap: 12,
    overflow: 'hidden',
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800' },
  customer: { fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  pkg: { fontSize: 12, fontWeight: '500', marginTop: 1 },
  price: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3 },
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  rowText: { fontSize: 13, fontWeight: '500', flex: 1 },
  acceptBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 2,
  },
  acceptText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
});
