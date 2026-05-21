import { useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { BellOff } from 'lucide-react-native';
import { useTheme } from '../../context/ThemeContext';
import { usePartnerNotifications } from '../../context/PartnerNotificationContext';
import { PARTNER_MOTION, partnerTiming } from '../../constants/partnerMotion';
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
    clearAll,
    lastReadAt,
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
    translateX.value = withTiming(panelWidth, panelTiming, (finished) => {
      if (finished) runOnJS(closePanel)();
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
      if (e.translationX > panelWidth * 0.28 || e.velocityX > 500) {
        dismissPanel();
      } else {
        translateX.value = withTiming(0, panelTiming);
        backdropOpacity.value = withTiming(1, backdropTiming);
      }
    });

  const readCutoff = lastReadAt ?? 0;
  const grouped = [
    { key: 'today', title: 'Today', data: notifications.filter((n) => n.group === 'today') },
    { key: 'earlier', title: 'Earlier', data: notifications.filter((n) => n.group === 'earlier') },
  ].filter((s) => s.data.length > 0);

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
                <Text style={[styles.title, { color: theme.text.primary }]}>Notifications</Text>
                {unreadCount > 0 ? (
                  <View style={[styles.badge, { backgroundColor: theme.accent.primary }]}>
                    <Text style={styles.badgeText}>
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </Text>
                  </View>
                ) : null}
              </View>
              {notifications.length > 0 ? (
                <Pressable onPress={clearAll} hitSlop={8}>
                  <Text style={[styles.clearAll, { color: theme.accent.primary }]}>Clear all</Text>
                </Pressable>
              ) : null}
            </View>

            {notifications.length === 0 ? (
              <View style={styles.empty}>
                <View style={[styles.emptyIcon, { backgroundColor: theme.customer.primaryBg }]}>
                  <BellOff size={32} color={theme.text.muted} strokeWidth={2} />
                </View>
                <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>
                  All caught up
                </Text>
                <Text style={[styles.emptySub, { color: theme.text.secondary }]}>
                  Booking updates and customer activity will show up here.
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.list}
              >
                {grouped.map((section) => (
                  <View key={section.key}>
                    <Text style={[styles.section, { color: theme.text.muted }]}>
                      {section.title}
                    </Text>
                    {section.data.map((n) => (
                      <PartnerNotifCard
                        key={n.id}
                        item={n}
                        isUnread={n.createdAt > readCutoff}
                        onDismiss={dismiss}
                        onPress={dismissPanel}
                      />
                    ))}
                  </View>
                ))}
              </ScrollView>
            )}
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
    marginBottom: 16,
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
  clearAll: { fontSize: 14, fontWeight: '700' },
  list: { paddingBottom: 32 },
  section: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 6,
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 60,
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
