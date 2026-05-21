import { useEffect, useMemo } from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { ChevronLeft, Bell } from 'lucide-react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  useSharedValue,
  withRepeat,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../../context/ThemeContext';
import { usePartnerStatus } from '../../../context/PartnerStatusContext';
import { usePartnerNotifications } from '../../../context/PartnerNotificationContext';
import { getPartnerStatus, getPartnerShadow } from '../../../constants/partnerTheme';
import { getJobTokens, getConnectionTokens } from '../../../constants/jobTheme';
import { findPhase } from '../../../lib/jobPhases';
import { usePartnerAuth } from '../../../context/PartnerAuthContext';

function initialOf(name) {
  if (!name) return 'W';
  const t = String(name).trim();
  return t ? t[0].toUpperCase() : 'W';
}

/**
 * Compact, sticky operational header for the active job screen.
 * Stays mounted above the scroll view; the frosted backdrop fades in on
 * scroll so the bar starts feeling lighter at rest.
 */
export default function ActiveJobHeader({ scrollY, phase, connection }) {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { status } = usePartnerStatus();
  const { unreadCount, openPanel } = usePartnerNotifications();
  const { user } = usePartnerAuth();
  const partnerInitial = initialOf(user?.full_name);
  const statusTokens = getPartnerStatus(status, isDark);
  const shadows = getPartnerShadow(isDark);
  const jobTokens = getJobTokens(isDark);
  const connTokens = getConnectionTokens(connection, isDark);
  const phaseInfo = findPhase(phase);

  const frostedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [0, 12, 28], [0, 0.55, 1], Extrapolation.CLAMP),
  }));
  const dividerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(scrollY.value, [12, 36], [0, 1], Extrapolation.CLAMP),
  }));

  const pulse = useSharedValue(0);
  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1600, easing: Easing.inOut(Easing.quad) }),
      -1,
      true
    );
  }, [pulse]);
  const pulseStyle = useAnimatedStyle(() => ({
    opacity: connection === 'connected' ? 0.5 + pulse.value * 0.5 : 0.6,
  }));

  const bgColor = useMemo(
    () => (isDark ? 'rgba(13,18,36,0.78)' : 'rgba(255,255,255,0.86)'),
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
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={({ pressed }) => [
            styles.iconBtn,
            {
              backgroundColor: theme.customer.surfaceContainerLowest,
              borderColor: theme.customer.outlineVariant,
            },
            shadows.rim,
            pressed && { opacity: 0.9 },
          ]}
          accessibilityLabel="Back"
        >
          <ChevronLeft size={20} color={theme.text.primary} strokeWidth={2.2} />
        </Pressable>

        <View style={styles.center}>
          <LinearGradient
            colors={statusTokens.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.avatar, shadows.rim]}
          >
            <Text style={styles.avatarText}>{partnerInitial}</Text>
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
            <View style={styles.titleRow}>
              <Text style={[styles.title, { color: theme.text.primary }]} numberOfLines={1}>
                Active service
              </Text>
              <View style={[styles.phasePill, { backgroundColor: jobTokens.phase[phase]?.bg }]}>
                <Text style={[styles.phaseText, { color: jobTokens.phase[phase]?.fg }]}>
                  {phaseInfo.label}
                </Text>
              </View>
            </View>
            <View style={styles.connRow}>
              <View style={styles.connDotWrap}>
                <Animated.View
                  style={[
                    styles.connDot,
                    { backgroundColor: connTokens.dot },
                    pulseStyle,
                  ]}
                />
              </View>
              <Text style={[styles.connText, { color: connTokens.fg }]} numberOfLines={1}>
                Dispatch · {connTokens.label}
              </Text>
            </View>
          </View>
        </View>

        <Pressable
          onPress={openPanel}
          hitSlop={10}
          style={({ pressed }) => [
            styles.iconBtn,
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
    zIndex: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    position: 'relative',
  },
  center: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  avatarText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  statusDot: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 11,
    height: 11,
    borderRadius: 5.5,
    borderWidth: 2.4,
  },
  titleCol: { flex: 1 },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
    maxWidth: 110,
  },
  phasePill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  phaseText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  connRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 2,
  },
  connDotWrap: {
    width: 8,
    height: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  connDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  connText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
    flex: 1,
  },
  badge: {
    position: 'absolute',
    top: 4,
    right: 4,
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
