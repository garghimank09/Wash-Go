import { View, Text, Pressable, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MotiView } from 'moti';
import { Bell } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerStatus } from '../../context/PartnerStatusContext';
import { usePartnerNotifications } from '../../context/PartnerNotificationContext';
import { usePartnerAuth } from '../../context/PartnerAuthContext';
import { getPartnerStatus, getPartnerShadow } from '../../constants/partnerTheme';
import { timeBasedGreeting } from '../../lib/partnerFormatters';

function initialOf(name) {
  if (!name) return 'W';
  const t = String(name).trim();
  return t ? t[0].toUpperCase() : 'W';
}

export default function PartnerHeader() {
  const { theme, isDark } = useTheme();
  const { status } = usePartnerStatus();
  const { unreadCount, openPanel } = usePartnerNotifications();
  const { user } = usePartnerAuth();
  const tokens = getPartnerStatus(status, isDark);
  const shadows = getPartnerShadow(isDark);
  const displayName = user?.full_name || 'Partner';
  const initial = initialOf(displayName);

  return (
    <MotiView
      from={{ opacity: 0, translateY: 4 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260 }}
      style={styles.row}
    >
      <View style={styles.left}>
        <LinearGradient
          colors={tokens.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.avatar, shadows.rim]}
        >
          <Text style={styles.avatarText}>{initial}</Text>
          <View
            style={[
              styles.statusDot,
              {
                backgroundColor: tokens.dot,
                borderColor: theme.customer.surface,
              },
            ]}
          />
        </LinearGradient>
        <View style={styles.greetCol}>
          <Text style={[styles.greet, { color: theme.text.secondary }]}>
            {timeBasedGreeting()}
          </Text>
          <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
            {displayName}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={openPanel}
        hitSlop={10}
        style={({ pressed }) => [
          styles.bell,
          {
            backgroundColor: theme.customer.surfaceContainerLowest,
            borderColor: theme.customer.outlineVariant,
          },
          shadows.rim,
          pressed && { opacity: 0.9 },
        ]}
        accessibilityLabel="Notifications"
      >
        <Bell size={20} color={theme.text.primary} strokeWidth={2} />
        {unreadCount > 0 ? (
          <View style={[styles.badge, { borderColor: theme.customer.surfaceContainerLowest }]}>
            <Text style={styles.badgeText}>
              {unreadCount > 9 ? '9+' : String(unreadCount)}
            </Text>
          </View>
        ) : null}
      </Pressable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 4,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 2.5,
  },
  greetCol: { flex: 1 },
  greet: { fontSize: 12, fontWeight: '500', marginBottom: 1 },
  name: { fontSize: 18, fontWeight: '800', letterSpacing: -0.3 },
  bell: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
});
