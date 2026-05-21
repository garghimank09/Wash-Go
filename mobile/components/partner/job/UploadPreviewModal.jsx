import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet, Modal } from 'react-native';
import { Image } from 'expo-image';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { X, Trash2 } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../context/ThemeContext';

const PARTNER_EASE = Easing.bezier(0.25, 0.1, 0.25, 1);

/**
 * Full-screen image preview with pinch-zoom + pan, dimmed premium backdrop.
 * No bounce: scale clamps between 1 and 4, snaps back with timing only.
 */
export default function UploadPreviewModal({ visible, image, onClose, onDelete }) {
  const { isDark } = useTheme();

  const scale = useSharedValue(1);
  const savedScale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (visible) {
      opacity.value = withTiming(1, { duration: 220, easing: PARTNER_EASE });
    } else {
      opacity.value = 0;
      scale.value = 1;
      savedScale.value = 1;
      translateX.value = 0;
      translateY.value = 0;
      savedTx.value = 0;
      savedTy.value = 0;
    }
  }, [visible, opacity, scale, savedScale, translateX, translateY, savedTx, savedTy]);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      const next = Math.max(1, Math.min(4, savedScale.value * e.scale));
      scale.value = next;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value <= 1.01) {
        translateX.value = withTiming(0, { duration: 200, easing: PARTNER_EASE });
        translateY.value = withTiming(0, { duration: 200, easing: PARTNER_EASE });
        savedTx.value = 0;
        savedTy.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value <= 1.01) return;
      translateX.value = savedTx.value + e.translationX;
      translateY.value = savedTy.value + e.translationY;
    })
    .onEnd(() => {
      savedTx.value = translateX.value;
      savedTy.value = translateY.value;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1.01) {
        scale.value = withTiming(1, { duration: 220, easing: PARTNER_EASE });
        translateX.value = withTiming(0, { duration: 220, easing: PARTNER_EASE });
        translateY.value = withTiming(0, { duration: 220, easing: PARTNER_EASE });
        savedScale.value = 1;
        savedTx.value = 0;
        savedTy.value = 0;
      } else {
        scale.value = withTiming(2.2, { duration: 220, easing: PARTNER_EASE });
        savedScale.value = 2.2;
      }
    });

  const composed = Gesture.Simultaneous(pan, pinch, doubleTap);

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const handleClose = () => {
    Haptics.selectionAsync().catch(() => {});
    onClose?.();
  };

  const handleDelete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    runOnJS_safe(onDelete);
    onClose?.();
  };

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={handleClose}
      statusBarTranslucent
    >
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />

        <GestureDetector gesture={composed}>
          <Animated.View style={[styles.imageWrap, imageStyle]}>
            {image?.uri ? (
              <Image
                source={{ uri: image.uri }}
                style={styles.image}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
            ) : (
              <View style={[styles.image, { backgroundColor: 'rgba(255,255,255,0.04)' }]} />
            )}
          </Animated.View>
        </GestureDetector>

        <View style={styles.topBar} pointerEvents="box-none">
          <Pressable
            onPress={handleClose}
            hitSlop={10}
            style={({ pressed }) => [
              styles.iconBtn,
              pressed && { opacity: 0.85 },
            ]}
            accessibilityLabel="Close"
          >
            <X size={20} color="#ffffff" strokeWidth={2.2} />
          </Pressable>
          <View style={{ flex: 1 }} />
          {onDelete ? (
            <Pressable
              onPress={handleDelete}
              hitSlop={10}
              style={({ pressed }) => [
                styles.iconBtn,
                styles.deleteBtn,
                pressed && { opacity: 0.85 },
              ]}
              accessibilityLabel="Delete"
            >
              <Trash2 size={18} color="#fca5a5" strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>

        {image?.capturedAt ? (
          <View style={styles.captionWrap} pointerEvents="none">
            <Text style={styles.caption}>
              Captured {new Date(image.capturedAt).toLocaleTimeString(undefined, {
                hour: 'numeric',
                minute: '2-digit',
              })}
            </Text>
          </View>
        ) : null}
      </Animated.View>
    </Modal>
  );
}

// Tiny safe runner so we never throw if onDelete is not passed.
function runOnJS_safe(fn) {
  if (typeof fn === 'function') fn();
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  imageWrap: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '85%',
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 48,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.10)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
  },
  deleteBtn: {
    backgroundColor: 'rgba(248,113,113,0.10)',
    borderColor: 'rgba(248,113,113,0.25)',
  },
  captionWrap: {
    position: 'absolute',
    bottom: 48,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  caption: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
});
