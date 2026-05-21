import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
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
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
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

export default function PartnerNotifCard({ item, isUnread, onDismiss, onPress }) {
  const { theme, isDark } = useTheme();
  const tokens = getPartnerNotifStyle(item.type, isDark);
  const Icon = ICONS[tokens.icon] || Sparkles;

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
        onPress={() => onPress?.(item)}
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
          <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={[styles.message, { color: theme.text.secondary }]} numberOfLines={2}>
            {item.message}
          </Text>
          <Text style={[styles.time, { color: theme.text.muted }]}>
            {formatRelativeTime(item.createdAt)}
          </Text>
        </View>
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
    gap: 12,
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
  title: { fontSize: 14, fontWeight: '700', letterSpacing: -0.1 },
  message: { fontSize: 12, lineHeight: 17 },
  time: { fontSize: 11, marginTop: 4, fontWeight: '500' },
  closeBtn: { padding: 4 },
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
