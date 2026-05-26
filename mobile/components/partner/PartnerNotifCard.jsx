import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Sparkles,
  CircleX,
  CircleCheck,
  MapPin,
  Wallet,
  TrendingUp,
  CalendarClock,
  Star,
  Trash2,
  X,
  ChevronRight,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerNotifications } from '../../context/PartnerNotificationContext';
import { getPartnerNotifStyle } from '../../constants/partnerTheme';
import { formatRelativeTime } from '../../lib/partnerFormatters';

const ICONS = {
  Sparkles,
  CircleX,
  CircleCheck,
  MapPin,
  Wallet,
  TrendingUp,
  CalendarClock,
  Star,
};

export default function PartnerNotifCard({ item, isUnread, onDismiss, onNavigate }) {
  const { theme, isDark } = useTheme();
  const router = useRouter();
  const { markAsRead } = usePartnerNotifications();
  const tokens = getPartnerNotifStyle(item.type, isDark);
  const Icon = ICONS[tokens.icon] || Sparkles;

  const handlePress = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      /* ignore */
    }
    await markAsRead(item.id);
    onNavigate?.();
    if (item.path) {
      router.push(item.path);
      return;
    }
    if (item.bookingId) {
      router.push(`/(partner)/job/${item.bookingId}`);
    }
  };

  const renderRightActions = () => (
    <View style={styles.deleteAction}>
      <Trash2 size={20} color={theme.customer.error} strokeWidth={2.4} />
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => onDismiss?.(item.id)}
      overshootRight={false}
      friction={2}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: isUnread
              ? theme.customer.primaryBg
              : theme.customer.surfaceContainerLowest,
            borderColor: isUnread
              ? theme.accent.primary + '40'
              : theme.customer.outlineVariant,
          },
          isUnread && {
            borderLeftWidth: 3,
            borderLeftColor: theme.accent.primary,
          },
          pressed && { opacity: 0.94 },
        ]}
      >
        {isUnread ? (
          <View style={[styles.unreadDot, { backgroundColor: theme.accent.primary }]} />
        ) : null}
        <View style={[styles.iconWrap, { backgroundColor: tokens.bg }]}>
          <Icon size={18} color={tokens.fg} strokeWidth={2.4} />
        </View>
        <View style={styles.body}>
          <View style={styles.titleRow}>
            <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
              {item.title}
            </Text>
            {item.bookingRef ? (
              <Text style={[styles.ref, { color: theme.text.muted }]}>{item.bookingRef}</Text>
            ) : null}
          </View>
          <Text style={[styles.message, { color: theme.text.secondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.time, { color: theme.text.muted }]}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
        <ChevronRight size={16} color={theme.text.muted} strokeWidth={2.2} />
        <Pressable
          onPress={() => onDismiss?.(item.id)}
          hitSlop={10}
          style={styles.closeBtn}
        >
          <X size={16} color={theme.text.muted} strokeWidth={2} />
        </Pressable>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    position: 'relative',
  },
  unreadDot: {
    position: 'absolute',
    left: 6,
    top: 16,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 14, fontWeight: '700', letterSpacing: -0.1, flex: 1 },
  ref: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  message: { fontSize: 12, lineHeight: 17 },
  time: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  closeBtn: { padding: 4, marginLeft: -4 },
  deleteAction: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
    marginBottom: 10,
    marginLeft: 8,
    backgroundColor: 'rgba(248,113,113,0.14)',
  },
});
