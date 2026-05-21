import { Pressable, View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { CUSTOMER_LAYOUT, getCustomerShadow } from '../../constants/customerTheme';
import AppIcon from './AppIcon';
import PhasePill from './PhasePill';
import { decodeBookingMeta, formatPriceCents } from '../../services/bookingService';
import { deriveCustomerPhase, isPhaseActive } from '../../lib/customerBookingPhase';
import { getPackage } from '../../services/pricingService';

function formatScheduled(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const date = d.toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const time = d.toLocaleTimeString(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  });
  return `${date} • ${time}`;
}

export default function BookingCard({ booking, onPress }) {
  const { theme, isDark } = useTheme();
  const shadows = getCustomerShadow(isDark);

  const phase = deriveCustomerPhase(booking);
  const { packageId } = decodeBookingMeta(booking.notes);
  const pkg = getPackage(packageId);
  const active = isPhaseActive(phase);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        shadows.rim,
        {
          backgroundColor: theme.customer.surfaceContainerLowest,
          borderColor: active ? theme.accent.primary : theme.customer.outlineVariant,
          borderLeftColor: active ? theme.accent.primary : theme.customer.outlineVariant,
        },
        active && styles.cardActive,
        pressed && { opacity: 0.92 },
      ]}
    >
      <View style={styles.topRow}>
        <PhasePill phase={phase} />
        <Text style={[styles.price, { color: theme.text.primary }]}>
          {formatPriceCents(booking.price_cents, booking.currency)}
        </Text>
      </View>

      <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
        {pkg?.label || 'Wash'}
      </Text>

      <View style={styles.metaRow}>
        <AppIcon name="place" size={14} color={theme.text.muted} />
        <Text style={[styles.metaText, { color: theme.text.secondary }]} numberOfLines={1}>
          {booking.service_address || 'Address pending'}
        </Text>
      </View>

      <View style={styles.metaRow}>
        <AppIcon name="schedule" size={14} color={theme.text.muted} />
        <Text style={[styles.metaText, { color: theme.text.secondary }]} numberOfLines={1}>
          {formatScheduled(booking.scheduled_at)}
        </Text>
      </View>

      <View style={[styles.footerRow, { borderTopColor: theme.customer.outlineVariant }]}>
        <Text style={[styles.cta, { color: theme.accent.primary }]}>
          {active ? 'Track booking' : 'View details'}
        </Text>
        <AppIcon name="arrow-forward" size={16} color={theme.accent.primary} />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: CUSTOMER_LAYOUT.card.radius,
    borderWidth: 1,
    borderLeftWidth: 3,
    padding: 16,
    marginBottom: 10,
  },
  cardActive: {},
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  price: {
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  metaText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '500',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: { fontSize: 12, fontWeight: '800', letterSpacing: 0.2 },
});
