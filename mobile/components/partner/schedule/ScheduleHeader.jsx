import { useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Bell, Wallet } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { usePartnerStatus } from '../../../context/PartnerStatusContext';
import { usePartnerNotifications } from '../../../context/PartnerNotificationContext';
import { getPartnerStatus, getPartnerShadow } from '../../../constants/partnerTheme';
import { formatPayoutCurrency } from '../../../lib/partnerFormatters';
import { usePartnerSchedule } from '../../../context/PartnerScheduleContext';
import { usePartnerAuth } from '../../../context/PartnerAuthContext';

function initialOf(name) {
  if (!name) return 'W';
  const t = String(name).trim();
  return t ? t[0].toUpperCase() : 'W';
}

export default function ScheduleHeader({ scrollY }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { status } = usePartnerStatus();
  const { unreadCount, openPanel } = usePartnerNotifications();
  const { user } = usePartnerAuth();
  const { todaySummary } = usePartnerSchedule();
  const statusTokens = getPartnerStatus(status, isDark);
  const shadows = getPartnerShadow(isDark);
  const displayName = user?.full_name || 'Partner';
  const initial = initialOf(displayName);

  const frostedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 12, 28], [0, 0.4, 1], Extrapolation.CLAMP),
  }));

  const dividerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [12, 36], [0, 1], Extrapolation.CLAMP),
  }));

  const bgColor = useMemo(
    () => (isDark ? 'rgba(13,18,36,0.78)' : 'rgba(255,255,255,0.80)'),
    [isDark]
  );

  return (
    <View style={[styles.outer, { paddingTop: insets.top + 8 }]}>
      <Animated.View
        pointerEvents="none"
        style={[StyleSheet.absoluteFill, frostedStyle, { backgroundColor: bgColor }]}
      >
        {Platform.OS === 'ios' ? (
          <BlurView
            intensity={isDark ? 32 : 38}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
        ) : null}
      </Animated.View>

      <View style={styles.row}>
        <View style={styles.left}>
          <LinearGradient
            colors={statusTokens.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.avatar, shadows.rim]}
          >
            <Text style={styles.avatarText}>{initial}</Text>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor: statusTokens.dot,
                  borderColor: theme.customer.surface,
                },
              ]}
            />
          </LinearGradient>
          <View style={styles.titleCol}>
            <Text style={[styles.eyebrow, { color: theme.text.secondary }]}>
              Schedule
            </Text>
            <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
              {displayName}
            </Text>
          </View>
        </View>

        <View style={styles.right}>
          <View
            style={[
              styles.earningsChip,
              {
                backgroundColor: theme.customer.primaryBg,
              },
            ]}
          >
            <Wallet size={12} color={theme.accent.primary} strokeWidth={2.4} />
            <Text style={[styles.earningsChipText, { color: theme.accent.primary }]}>
              {formatPayoutCurrency(todaySummary.projectedCents)}
            </Text>
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
            <Bell size={18} color={theme.text.primary} strokeWidth={2} />
            {unreadCount > 0 ? (
              <View
                style={[
                  styles.badge,
                  { borderColor: theme.customer.surfaceContainerLowest },
                ]}
              >
                <Text style={styles.badgeText}>
                  {unreadCount > 9 ? '9+' : String(unreadCount)}
                </Text>
              </View>
            ) : null}
          </Pressable>
        </View>
      </View>

      <Animated.View
        pointerEvents="none"
        style={[
          styles.divider,
          dividerStyle,
          { backgroundColor: theme.customer.outlineVariant },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 10,
    gap: 12,
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2.5,
  },
  titleCol: { flex: 1 },
  eyebrow: { fontSize: 11, fontWeight: '600', letterSpacing: 0.4, textTransform: 'uppercase' },
  name: { fontSize: 16, fontWeight: '800', letterSpacing: -0.3, marginTop: 1 },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  earningsChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  earningsChipText: { fontSize: 12, fontWeight: '800', letterSpacing: -0.1 },
  bell: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#ef4444',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  badgeText: { color: '#ffffff', fontSize: 9, fontWeight: '800' },
  divider: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 1,
  },
});
