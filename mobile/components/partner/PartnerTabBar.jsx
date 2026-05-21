import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useSegments, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  Home,
  Inbox,
  CalendarDays,
  Wallet,
  UserRound,
} from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import {
  PARTNER_LAYOUT,
  getPartnerContentPadding,
  getPartnerTabBarOccupiedHeight,
  getPartnerShadow,
} from '../../constants/partnerTheme';
import { PARTNER_MOTION, partnerTiming } from '../../constants/partnerMotion';
import { usePartnerNotifications } from '../../context/PartnerNotificationContext';

const TABS = [
  { key: 'home', label: 'Home', icon: Home, route: '/(partner)/home' },
  { key: 'offers', label: 'Offers', icon: Inbox, route: '/(partner)/offers' },
  { key: 'schedule', label: 'Schedule', icon: CalendarDays, route: '/(partner)/schedule' },
  { key: 'earnings', label: 'Earnings', icon: Wallet, route: '/(partner)/earnings' },
  { key: 'profile', label: 'Profile', icon: UserRound, route: '/(partner)/profile' },
];

/** @deprecated Use getPartnerTabBarOccupiedHeight from partnerTheme */
export function getPartnerTabBarHeight(insetsBottom = 0) {
  return getPartnerContentPadding(insetsBottom);
}

function TabButton({ tab, isActive, onPress, accentColor, mutedColor, iconSize }) {
  const press = useSharedValue(0);

  const wrapStyle = useAnimatedStyle(() => ({
    opacity: interpolate(press.value, [0, 1], [1, 0.72], Extrapolation.CLAMP),
    transform: [
      { scale: interpolate(press.value, [0, 1], [1, 0.97], Extrapolation.CLAMP) },
    ],
  }));

  const handleIn = useCallback(() => {
    press.value = withTiming(1, partnerTiming(PARTNER_MOTION.duration.fast));
  }, [press]);
  const handleOut = useCallback(() => {
    press.value = withTiming(0, partnerTiming(PARTNER_MOTION.duration.normal));
  }, [press]);

  const Icon = tab.icon;

  return (
    <Pressable
      onPressIn={handleIn}
      onPressOut={handleOut}
      onPress={onPress}
      hitSlop={8}
      style={styles.tabPressable}
      accessibilityLabel={tab.label}
      accessibilityRole="button"
    >
      <Animated.View style={[styles.tabInner, wrapStyle]}>
        <Icon
          size={iconSize}
          color={isActive ? accentColor : mutedColor}
          strokeWidth={isActive ? 2.3 : 2}
        />
      </Animated.View>
    </Pressable>
  );
}

export default function PartnerTabBar() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const { unreadCount } = usePartnerNotifications();
  const shadows = getPartnerShadow(isDark);

  const { height: barHeight, bottomGap, scrimHeight, horizontalMargin, radius, indicatorInset, iconSize } =
    PARTNER_LAYOUT.tabBar;
  const safeBottom = Math.max(insets.bottom, bottomGap);
  const surface = theme.customer.surface;

  const currentKey = (() => {
    const last = segments[segments.length - 1];
    const match = TABS.find((t) => t.key === last);
    return match ? match.key : 'home';
  })();
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.key === currentKey));

  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorX = useSharedValue(activeIndex);
  useEffect(() => {
    indicatorX.value = withTiming(
      activeIndex,
      partnerTiming(PARTNER_MOTION.duration.tabIndicator)
    );
  }, [activeIndex, indicatorX]);

  const slotWidth = trackWidth / TABS.length;
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value * slotWidth }],
  }));

  const onPressTab = useCallback(
    (tab, isActive) => {
      Haptics.selectionAsync().catch(() => {});
      if (isActive) return;
      router.replace(tab.route);
    },
    [router]
  );

  const accent = theme.accent.primary;
  const muted = theme.text.muted;
  const cardBg = isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.97)';
  const borderColor = isDark
    ? 'rgba(255,255,255,0.12)'
    : 'rgba(255,255,255,0.85)';
  const pillBg = isDark
    ? 'rgba(34,211,238,0.18)'
    : 'rgba(6,182,212,0.12)';

  const plateHeight = safeBottom + barHeight;

  return (
    <View pointerEvents="box-none" style={styles.wrap}>
      <View
        pointerEvents="none"
        style={[styles.bottomPlate, { height: plateHeight, backgroundColor: surface }]}
      />

      <LinearGradient
        pointerEvents="none"
        colors={[`${surface}00`, `${surface}CC`, surface]}
        locations={[0, 0.7, 1]}
        style={[
          styles.scrim,
          { height: scrimHeight, bottom: plateHeight - 2 },
        ]}
      />

      <View
        pointerEvents="box-none"
        style={[styles.barRow, { paddingBottom: safeBottom, paddingHorizontal: horizontalMargin }]}
      >
        <View
          style={[
            styles.bar,
            shadows.soft,
            {
              height: barHeight,
              borderRadius: radius,
              backgroundColor: cardBg,
              borderColor,
            },
          ]}
        >
          <BlurView
            intensity={isDark ? 36 : 44}
            tint={isDark ? 'dark' : 'light'}
            style={[StyleSheet.absoluteFill, { borderRadius: radius, overflow: 'hidden' }]}
          />
          <View
            style={[
              styles.indicatorTrack,
              {
                left: indicatorInset,
                right: indicatorInset,
                top: indicatorInset,
                bottom: indicatorInset,
              },
            ]}
            pointerEvents="none"
            onLayout={(e) => setTrackWidth(e.nativeEvent.layout.width)}
          >
            {slotWidth > 0 ? (
              <Animated.View
                style={[
                  styles.indicatorPill,
                  { backgroundColor: pillBg, width: slotWidth, borderRadius: radius - indicatorInset },
                  indicatorStyle,
                ]}
              />
            ) : null}
          </View>
          <View style={styles.tabsRow}>
            {TABS.map((tab) => {
              const isActive = currentKey === tab.key;
              const showBadge = tab.key === 'offers' && unreadCount > 0;
              return (
                <View key={tab.key} style={styles.tabSlot}>
                  <TabButton
                    tab={tab}
                    isActive={isActive}
                    onPress={() => onPressTab(tab, isActive)}
                    accentColor={accent}
                    mutedColor={muted}
                    iconSize={iconSize}
                  />
                  {showBadge ? (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: theme.customer.error, borderColor: cardBg },
                      ]}
                    />
                  ) : null}
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 60,
    justifyContent: 'flex-end',
  },
  bottomPlate: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrim: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  barRow: {
    width: '100%',
  },
  bar: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  indicatorTrack: {
    position: 'absolute',
    flexDirection: 'row',
  },
  indicatorPill: {
    height: '100%',
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  tabSlot: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
  },
  tabPressable: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabInner: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: '30%',
    width: 7,
    height: 7,
    borderRadius: 4,
    borderWidth: 1.5,
  },
});
