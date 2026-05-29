import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { useRouter } from 'expo-router';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { formatRelativeTime } from '../../lib/notificationDerivation';
import AppIcon from '../customer/AppIcon';

export default function NotificationCard({ item, isUnread, onNavigate }) {
  const { theme } = useTheme();
  const router = useRouter();
  const { dismiss, markAsRead } = useNotifications();
  const phaseStyle = theme.phases?.[item.type];
  const typeStyle = theme.notificationTypes?.[item.type] || {
    fg: phaseStyle?.fg ?? theme.text.secondary,
    bg: phaseStyle?.bg ?? theme.customer.surfaceContainerLow,
    icon: 'notifications',
  };

  const onPress = () => {
    onNavigate?.();
    markAsRead(item.id);
    if (item.path && typeof item.path === 'string') {
      router.push(item.path);
      return;
    }
    if (item.bookingId) {
      router.push(`/booking/${item.bookingId}`);
    }
  };

  const renderRightActions = () => (
    <View style={[styles.deleteAction, { backgroundColor: theme.customer.error + '22' }]}>
      <AppIcon name="delete" size={22} color={theme.customer.error} />
    </View>
  );

  return (
    <Swipeable
      renderRightActions={renderRightActions}
      onSwipeableOpen={() => dismiss(item.id)}
      overshootRight={false}
      friction={2}
    >
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.card,
          {
            backgroundColor: isUnread
              ? theme.customer.primaryBg
              : theme.customer.surfaceContainerLowest,
            borderColor: isUnread
              ? theme.accent.primary + '35'
              : theme.customer.outlineVariant,
          },
          isUnread && styles.unreadBorder,
          pressed && { opacity: 0.92 },
        ]}
      >
        {isUnread ? (
          <View style={[styles.unreadDot, { backgroundColor: theme.accent.primary }]} />
        ) : null}
        <View style={[styles.iconWrap, { backgroundColor: typeStyle.bg }]}>
          <AppIcon
            name={typeStyle.icon || 'notifications'}
            size={20}
            color={typeStyle.fg}
          />
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
        <Pressable
          onPress={() => dismiss(item.id)}
          hitSlop={10}
          style={styles.closeBtn}
        >
          <AppIcon name="close" size={18} color={theme.text.muted} />
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
    borderRadius: 14,
    borderWidth: 1,
    marginBottom: 10,
    position: 'relative',
  },
  unreadBorder: {
    borderLeftWidth: 3,
    borderLeftColor: '#06b6d4',
  },
  unreadDot: {
    position: 'absolute',
    left: 6,
    top: 18,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: { flex: 1, gap: 2 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  title: { fontSize: 14, fontWeight: '700', flex: 1 },
  ref: { fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  message: { fontSize: 12, lineHeight: 17 },
  time: { fontSize: 11, marginTop: 4 },
  closeBtn: { padding: 4 },
  deleteAction: {
    width: 72,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 14,
    marginBottom: 10,
    marginLeft: 8,
  },
});
