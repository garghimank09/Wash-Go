import { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  FlatList,
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
    clearAll,
    lastReadAt,
  } = useNotifications();

  const translateX = useSharedValue(panelWidth);

  const panelTiming = { duration: CUSTOMER_MOTION.duration.panel, easing: CUSTOMER_EASE };

  useEffect(() => {
    translateX.value = panelOpen
      ? withTiming(0, panelTiming)
      : withTiming(panelWidth, panelTiming);
  }, [panelOpen, panelWidth, translateX]);

  const panelStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

  const pan = Gesture.Pan()
    .activeOffsetX(20)
    .onUpdate((e) => {
      if (e.translationX > 0) {
        translateX.value = Math.min(e.translationX, panelWidth);
      }
    })
    .onEnd((e) => {
      if (e.translationX > panelWidth * 0.25 || e.velocityX > 400) {
        translateX.value = withTiming(panelWidth, panelTiming, () => {
          runOnJS(closePanel)();
        });
      } else {
        translateX.value = withTiming(0, panelTiming);
      }
    });

  const grouped = [
    { key: 'today', title: 'Today', data: notifications.filter((n) => n.group === 'today') },
    {
      key: 'earlier',
      title: 'Earlier',
      data: notifications.filter((n) => n.group === 'earlier'),
    },
  ].filter((s) => s.data.length > 0);

  const readCutoff = lastReadAt ?? 0;

  if (!panelOpen) return null;

  return (
    <Modal visible transparent animationType="none" onRequestClose={closePanel}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={closePanel}>
          <BlurView
            intensity={40}
            tint={isDark ? 'dark' : 'light'}
            style={StyleSheet.absoluteFill}
          />
          <View style={styles.dim} />
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
                  Notifications
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
                <Pressable onPress={clearAll} hitSlop={8}>
                  <Text style={[styles.clearAll, { color: theme.accent.primary }]}>
                    Clear all
                  </Text>
                </Pressable>
              ) : null}
            </View>

            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <View
                  style={[
                    styles.emptyIcon,
                    { backgroundColor: theme.customer.primaryBg },
                  ]}
                >
                  <AppIcon name="notifications-none" size={36} color={theme.text.muted} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
                  All caught up
                </Text>
                <Text style={[styles.emptySub, { color: theme.text.secondary }]}>
                  Booking updates will appear here.
                </Text>
              </View>
            ) : (
              <FlatList
                data={grouped}
                keyExtractor={(item) => item.key}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
                renderItem={({ item: section }) => (
                  <View>
                    <Text style={[styles.sectionTitle, { color: theme.text.muted }]}>
                      {section.title}
                    </Text>
                    {section.data.map((n) => (
                      <NotificationCard
                        key={n.id}
                        item={n}
                        isUnread={n.createdAt > readCutoff}
                      />
                    ))}
                  </View>
                )}
              />
            )}
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
    ...StyleSheet.flatten({
      shadowColor: '#000',
      shadowOffset: { width: -4, height: 0 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 12,
    }),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
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
  clearAll: { fontSize: 14, fontWeight: '700' },
  list: { paddingBottom: 24 },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 4,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
});
