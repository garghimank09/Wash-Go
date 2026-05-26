import { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { CUSTOMER_MOTION, CUSTOMER_EASE } from '../../constants/customerMotion';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';
import { useNotifications } from '../../context/NotificationContext';
import { isNotificationUnread } from '../../lib/notificationModel';
import ActivityNotificationList from './ActivityNotificationList';
import NotificationCard from './NotificationCard';
import AppIcon from '../customer/AppIcon';

const PANEL_WIDTH_RATIO = 0.85;
const PANEL_MAX_WIDTH = 400;

export default function NotificationPanel() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const panelWidth = Math.min(screenWidth * PANEL_WIDTH_RATIO, PANEL_MAX_WIDTH);
  const {
    notifications,
    unreadCount,
    panelOpen,
    closePanel,
    markAllRead,
    lastReadAt,
    loading,
    refreshing,
    refresh,
  } = useNotifications();

  const translateX = useSharedValue(panelWidth);
  const backdropOpacity = useSharedValue(0);

  const panelTiming = { duration: CUSTOMER_MOTION.duration.panel, easing: CUSTOMER_EASE };
  const backdropTiming = { duration: CUSTOMER_MOTION.duration.panel * 0.85, easing: CUSTOMER_EASE };

  useEffect(() => {
    if (panelOpen) {
      backdropOpacity.value = withTiming(1, backdropTiming);
      translateX.value = withTiming(0, panelTiming);
    } else {
      backdropOpacity.value = withTiming(0, backdropTiming);
      translateX.value = withTiming(panelWidth, panelTiming);
    }
  }, [panelOpen, panelWidth, translateX, backdropOpacity, panelTiming, backdropTiming]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const dismissPanel = () => {
    translateX.value = withTiming(panelWidth, panelTiming, () => {
      runOnJS(closePanel)();
    });
    backdropOpacity.value = withTiming(0, backdropTiming);
  };

  const pan = Gesture.Pan()
    .activeOffsetX(20)
    .onUpdate((e) => {
      if (e.translationX > 0) {
        translateX.value = Math.min(e.translationX, panelWidth);
        backdropOpacity.value = Math.max(0, 1 - e.translationX / panelWidth);
      }
    })
    .onEnd((e) => {
      if (e.translationX > panelWidth * 0.25 || e.velocityX > 400) {
        dismissPanel();
      } else {
        translateX.value = withTiming(0, panelTiming);
        backdropOpacity.value = withTiming(1, backdropTiming);
      }
    });

  const readCutoff = lastReadAt ?? 0;

  if (!panelOpen) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={dismissPanel}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissPanel}>
          <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
            <BlurView
              intensity={40}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.dim} />
          </Animated.View>
        </Pressable>

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.panel,
              panelStyle,
              {
                width: panelWidth,
                paddingTop: insets.top + 12,
                paddingBottom: insets.bottom + 16,
                backgroundColor: theme.customer.surfaceContainerLowest,
              },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
                  Activity
                </Text>
                {unreadCount > 0 ? (
                  <View style={[styles.badge, { backgroundColor: theme.accent.primary }]}>
                    <Text style={[styles.badgeText, { color: theme.button.primary.text }]}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                ) : null}
              </View>
              {notifications.length > 0 ? (
                <Pressable onPress={markAllRead} hitSlop={8}>
                  <Text style={[styles.markRead, { color: theme.accent.primary }]}>
                    Mark all read
                  </Text>
                </Pressable>
              ) : null}
            </View>

            <ActivityNotificationList
              items={notifications}
              readCutoff={readCutoff}
              loading={loading}
              refreshing={refreshing}
              onRefresh={refresh}
              theme={theme}
              emptyIcon={({ size, color }) => (
                <AppIcon name="notifications-none" size={size} color={color} />
              )}
              emptyTitle="All caught up"
              emptySubtitle="Live booking updates will appear here as your wash progresses."
              renderCard={(item) => (
                <NotificationCard
                  item={item}
                  isUnread={isNotificationUnread(item, readCutoff)}
                />
              )}
            />
          </Animated.View>
        </GestureDetector>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  dim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 24,
    borderBottomLeftRadius: 24,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: -4, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { fontSize: 11, fontWeight: '800' },
  markRead: { fontSize: 14, fontWeight: '700' },
});
