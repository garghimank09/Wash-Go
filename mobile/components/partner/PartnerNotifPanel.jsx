import { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BellOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerNotifications } from '../../context/PartnerNotificationContext';
import { PARTNER_MOTION, partnerTiming } from '../../constants/partnerMotion';
import { isNotificationUnread } from '../../lib/notificationModel';
import ActivityNotificationList from '../notifications/ActivityNotificationList';
import PartnerNotifCard from './PartnerNotifCard';

const PANEL_WIDTH_RATIO = 0.86;
const PANEL_MAX_WIDTH = 400;

export default function PartnerNotifPanel() {
  const { theme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = useWindowDimensions();
  const panelWidth = Math.min(screenWidth * PANEL_WIDTH_RATIO, PANEL_MAX_WIDTH);
  const {
    notifications,
    unreadCount,
    panelOpen,
    closePanel,
    dismiss,
    markAllRead,
    lastReadAt,
    loading,
    refreshing,
    refresh,
  } = usePartnerNotifications();

  const translateX = useSharedValue(panelWidth);
  const backdropOpacity = useSharedValue(0);

  const panelTiming = partnerTiming(PARTNER_MOTION.duration.panel);
  const backdropTiming = partnerTiming(PARTNER_MOTION.duration.panelBackdrop);

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
    closePanel();
    translateX.value = withTiming(panelWidth, panelTiming);
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
      if (e.translationX > panelWidth * 0.28 || e.velocityX > 500) {
        dismissPanel();
      } else {
        translateX.value = withTiming(0, panelTiming);
        backdropOpacity.value = withTiming(1, backdropTiming);
      }
    });

  const readCutoff = lastReadAt ?? 0;

  if (!panelOpen) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={dismissPanel} statusBarTranslucent>
      <View style={{ flex: 1 }}>
        <Pressable style={StyleSheet.absoluteFill} onPress={dismissPanel}>
          <Animated.View style={[StyleSheet.absoluteFill, backdropStyle]}>
            <BlurView
              intensity={36}
              tint={isDark ? 'dark' : 'light'}
              style={StyleSheet.absoluteFill}
            />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.28)' }]} />
          </Animated.View>
        </Pressable>

        <GestureDetector gesture={pan}>
          <Animated.View
            style={[
              styles.panel,
              panelStyle,
              {
                width: panelWidth,
                paddingTop: insets.top + 14,
                paddingBottom: insets.bottom + 16,
                backgroundColor: theme.customer.surfaceContainerLowest,
                borderColor: theme.customer.outlineVariant,
              },
            ]}
          >
            <View style={styles.header}>
              <View style={styles.headerLeft}>
                <Text style={[styles.title, { color: theme.text.primary }]}>Activity</Text>
                {unreadCount > 0 ? (
                  <View style={[styles.badge, { backgroundColor: theme.accent.primary }]}>
                    <Text style={styles.badgeText}>
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
              emptyIcon={BellOff}
              emptyTitle="All caught up"
              emptySubtitle="Booking updates and customer activity will show up here instantly."
              renderCard={(item) => (
                <PartnerNotifCard
                  item={item}
                  isUnread={isNotificationUnread(item, readCutoff)}
                  onDismiss={dismiss}
                  onNavigate={dismissPanel}
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
  panel: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    borderTopLeftRadius: 28,
    borderBottomLeftRadius: 28,
    paddingHorizontal: 16,
    borderLeftWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: -8, height: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 24,
    elevation: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: -0.4 },
  badge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: { color: '#ffffff', fontSize: 11, fontWeight: '800' },
  markRead: { fontSize: 14, fontWeight: '700' },
});
