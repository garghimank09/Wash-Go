import { useCallback, useEffect, useState } from 'react';
import { Pressable, StyleSheet, View, Text } from 'react-native';
import { useSegments, useRouter } from 'expo-router';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import {
  CUSTOMER_LAYOUT,
  getCustomerShadow,
} from '../../constants/customerTheme';
import { CUSTOMER_MOTION, customerTiming } from '../../constants/customerMotion';
import AppIcon from './AppIcon';

const TABS = [
  { key: 'dashboard', label: 'Home', icon: 'home', route: '/(customer)/dashboard', filledWhenActive: true },
  { key: 'bookings', label: 'Bookings', icon: 'calendar-month', route: '/(customer)/bookings' },
  { key: 'garage', label: 'Garage', icon: 'directions-car', route: '/(customer)/garage' },
  { key: 'rewards', label: 'Rewards', icon: 'card-giftcard', route: '/(customer)/rewards' },
  { key: 'profile', label: 'Profile', icon: 'person', route: '/(customer)/profile' },
];

function TabButton({ tab, isActive, onPress, accentColor, mutedColor, iconSize }) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={styles.tabPressable}
      accessibilityLabel={tab.label}
      accessibilityRole="button"
      accessibilityState={isFocusedStyle(isActive)}
    >
      {({ pressed }) => (
        <View style={[styles.tabInner, pressed && { opacity: 0.88 }]}>
          <AppIcon
            name={tab.icon}
            size={iconSize}
            filled={isActive && tab.filledWhenActive}
            color={isActive ? accentColor : mutedColor}
            style={{ opacity: isActive ? 1 : 0.72 }}
          />
          <Text
            style={[
              styles.label,
              {
                color: isActive ? accentColor : mutedColor,
                opacity: isActive ? 1 : 0.72,
                fontWeight: isActive ? '700' : '500',
              },
            ]}
          >
            {tab.label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}

function isFocusedStyle(active) {
  return active ? { selected: true } : {};
}

export default function CustomerTabBar() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const segments = useSegments();
  const shadows = getCustomerShadow(isDark);

  const { height: barHeight, bottomGap, scrimHeight, horizontalMargin, radius, indicatorInset, iconSize } =
    CUSTOMER_LAYOUT.tabBar;
  const safeBottom = Math.max(insets.bottom, bottomGap);
  const surface = theme.customer.surface;

  const currentKey = (() => {
    const last = segments[segments.length - 1];
    const match = TABS.find((t) => t.key === last);
    return match ? match.key : 'dashboard';
  })();
  const activeIndex = Math.max(0, TABS.findIndex((t) => t.key === currentKey));

  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorX = useSharedValue(activeIndex);
  useEffect(() => {
    indicatorX.value = withTiming(
      activeIndex,
      customerTiming(CUSTOMER_MOTION.duration.tabIndicator)
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
      router.navigate(tab.route);
    },
    [router]
  );

  const accent = theme.accent.primary;
  const muted = theme.text.muted;
  const cardBg = isDark ? 'rgba(15, 23, 42, 0.96)' : 'rgba(255, 255, 255, 0.97)';
  const borderColor = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(255,255,255,0.85)';
  const pillBg = isDark ? 'rgba(34,211,238,0.18)' : 'rgba(6,182,212,0.12)';
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
        style={[styles.scrim, { height: scrimHeight, bottom: plateHeight - 2 }]}
      />
      <View
        pointerEvents="box-none"
        style={[styles.barRow, { paddingBottom: safeBottom, paddingHorizontal: horizontalMargin }]}
      >
        <View
          style={[
            styles.bar,
            shadows.soft,
            { height: barHeight, borderRadius: radius, backgroundColor: cardBg, borderColor },
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
  barRow: { width: '100%' },
  bar: { overflow: 'hidden', borderWidth: 1 },
  indicatorTrack: { position: 'absolute', flexDirection: 'row' },
  indicatorPill: { height: '100%' },
  tabsRow: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  tabSlot: { flex: 1, alignItems: 'center', justifyContent: 'center', height: '100%' },
  tabPressable: { flex: 1, width: '100%', alignItems: 'center', justifyContent: 'center' },
  tabInner: { alignItems: 'center', justifyContent: 'center', gap: 2, paddingVertical: 2 },
  label: { fontSize: 10, lineHeight: 12 },
});
