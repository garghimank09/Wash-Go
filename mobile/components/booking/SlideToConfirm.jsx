import { useCallback, useEffect, useMemo } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';

const TRACK_H = 56;
const THUMB = 48;

export default function SlideToConfirm({
  label = 'Slide to continue',
  onConfirm,
  disabled = false,
  accentColor = '#06b6d4',
}) {
  const dragX = useSharedValue(0);
  const committed = useSharedValue(0);

  const maxDrag = useMemo(() => 220, []);

  useEffect(() => {
    dragX.value = 0;
    committed.value = 0;
  }, [disabled, dragX, committed]);

  const finish = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    onConfirm?.();
  }, [onConfirm]);

  const pan = Gesture.Pan()
    .enabled(!disabled)
    .onUpdate((e) => {
      if (committed.value) return;
      const next = Math.max(0, Math.min(maxDrag, e.translationX));
      dragX.value = next;
    })
    .onEnd((e) => {
      if (committed.value) return;
      const pass = dragX.value > maxDrag * 0.82 || e.velocityX > 800;
      if (pass) {
        committed.value = 1;
        dragX.value = withTiming(maxDrag, { duration: 120 });
        runOnJS(finish)();
      } else {
        dragX.value = withSpring(0, { damping: 18, stiffness: 200 });
      }
    });

  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value }],
  }));

  const fillStyle = useAnimatedStyle(() => ({
    width: dragX.value + THUMB,
    opacity: 0.35 + (dragX.value / maxDrag) * 0.45,
  }));

  return (
    <View style={[styles.wrap, disabled && styles.disabled]}>
      <LinearGradient
        colors={['rgba(15,23,42,0.06)', 'rgba(6,182,212,0.08)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.track}
      >
        <Animated.View style={[styles.fill, { backgroundColor: accentColor }, fillStyle]} />
        <Text style={styles.label}>{label}</Text>
        <GestureDetector gesture={pan}>
          <Animated.View style={[styles.thumb, thumbStyle]}>
            <LinearGradient colors={[accentColor, '#0891b2']} style={styles.thumbGrad}>
              <ChevronRight color="#fff" size={22} strokeWidth={2.5} />
            </LinearGradient>
          </Animated.View>
        </GestureDetector>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { width: '100%' },
  disabled: { opacity: 0.5 },
  track: {
    height: TRACK_H,
    borderRadius: TRACK_H / 2,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.35)',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: TRACK_H / 2,
  },
  label: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
    letterSpacing: -0.2,
  },
  thumb: {
    position: 'absolute',
    left: 4,
    top: 4,
    width: THUMB,
    height: THUMB,
    borderRadius: THUMB / 2,
    shadowColor: '#0f172a',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  thumbGrad: {
    flex: 1,
    borderRadius: THUMB / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
