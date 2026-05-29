import { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ActionSheetIOS,
  Platform,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { MotiView } from 'moti';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Camera,
  ImageIcon,
  Plus,
  RotateCw,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getJobTokens } from '../../../constants/jobTheme';
import { getSelectionFill, getSelectionBorder } from '../../../lib/selectableCardStyle';
import UploadPreviewModal from './UploadPreviewModal';

const RING_SIZE = 36;
const RING_STROKE = 3;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

/**
 * Premium proof upload section with two tabs (before / after) and a 3-column
 * tile grid. Each tile shows the picked image with an animated progress ring
 * during simulated upload, a retry path on failure, and a delete handle once
 * uploaded.
 */
export default function UploadProofCard({
  buckets,
  counts,
  pickFromCamera,
  pickFromLibrary,
  retry,
  remove,
  visibleBucket: visibleBucketProp,
}) {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);
  const tokens = getJobTokens(isDark);

  const [activeBucket, setActiveBucket] = useState(visibleBucketProp || 'before');
  const [previewImage, setPreviewImage] = useState(null);

  const activeImages = buckets[activeBucket] || [];

  const tabs = useMemo(() => {
    const list = [];
    if (visibleBucketProp === 'arrival' || (counts.arrival ?? 0) > 0) {
      list.push({ id: 'arrival', label: 'Condition', count: counts.arrival ?? 0 });
    }
    list.push(
      { id: 'before', label: 'Before wash', count: counts.before ?? 0 },
      { id: 'after', label: 'After wash', count: counts.after ?? 0 },
    );
    return list;
  }, [counts.arrival, counts.before, counts.after, visibleBucketProp]);

  const openAddMenu = () => {
    Haptics.selectionAsync().catch(() => {});
    const open = (key) => {
      if (key === 'camera') pickFromCamera(activeBucket);
      else if (key === 'library') pickFromLibrary(activeBucket);
    };
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take photo', 'Choose from library'],
          cancelButtonIndex: 0,
        },
        (idx) => {
          if (idx === 1) open('camera');
          else if (idx === 2) open('library');
        }
      );
      return;
    }
    Alert.alert('Add proof photo', undefined, [
      { text: 'Take photo', onPress: () => open('camera') },
      { text: 'Choose from library', onPress: () => open('library') },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260 }}
      style={[
        styles.card,
        {
          backgroundColor: theme.customer.surfaceContainerLowest,
          borderColor: theme.customer.outlineVariant,
        },
        shadows.rim,
      ]}
    >
      <View style={styles.headerRow}>
        <View style={[styles.headerIcon, { backgroundColor: theme.customer.primaryBg }]}>
          <Camera size={14} color={theme.accent.primary} strokeWidth={2.4} />
        </View>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Photo proof
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={[styles.subtle, { color: theme.text.muted }]}>
          {counts.beforeSuccess + counts.afterSuccess} uploaded
        </Text>
      </View>

      <View style={[styles.tabs, { backgroundColor: theme.customer.surfaceContainerLow }]}>
        {tabs.map((tab) => {
          const active = tab.id === activeBucket;
          return (
            <Pressable
              key={tab.id}
              onPress={() => {
                Haptics.selectionAsync().catch(() => {});
                setActiveBucket(tab.id);
              }}
              style={({ pressed }) => [
                styles.tab,
                active && {
                  backgroundColor: getSelectionFill(theme),
                  borderColor: getSelectionBorder(theme),
                  borderWidth: 1.5,
                },
                pressed && !active && { opacity: 0.85 },
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  { color: active ? theme.text.primary : theme.text.secondary },
                ]}
              >
                {tab.label}
              </Text>
              <View
                style={[
                  styles.tabBadge,
                  active
                    ? {
                        backgroundColor: theme.accent.primary,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: theme.accent.primary,
                      }
                    : {
                        backgroundColor: theme.customer.surfaceContainerLowest,
                        borderWidth: StyleSheet.hairlineWidth,
                        borderColor: theme.customer.outlineVariant,
                      },
                ]}
              >
                <Text
                  style={[
                    styles.tabBadgeText,
                    { color: active ? '#ffffff' : theme.text.muted },
                  ]}
                >
                  {tab.count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <View style={styles.grid}>
        {activeImages.map((img, idx) => (
          <ImageTile
            key={img.id}
            image={img}
            index={idx}
            tokens={tokens}
            onOpen={() => setPreviewImage(img)}
            onRetry={() => retry(activeBucket, img.id)}
            onRemove={() => remove(activeBucket, img.id)}
          />
        ))}
        <AddTile onPress={openAddMenu} tokens={tokens} />
      </View>

      <View style={styles.helpRow}>
        <ImageIcon size={11} color={theme.text.muted} strokeWidth={2.4} />
        <Text style={[styles.helpText, { color: theme.text.muted }]}>
          Tap a tile to preview · Long-press to remove
        </Text>
      </View>

      <UploadPreviewModal
        visible={!!previewImage}
        image={previewImage}
        onClose={() => setPreviewImage(null)}
        onDelete={() => previewImage && remove(activeBucket, previewImage.id)}
      />
    </MotiView>
  );
}

function ImageTile({ image, index, tokens, onOpen, onRetry, onRemove }) {
  const isUploading = image.status === 'uploading';
  const isFailed = image.status === 'failed';
  const isSuccess = image.status === 'success';

  const offset = RING_CIRCUMFERENCE * (1 - (image.progress || 0));

  const handlePress = () => {
    if (isFailed) {
      Haptics.selectionAsync().catch(() => {});
      onRetry?.();
      return;
    }
    Haptics.selectionAsync().catch(() => {});
    onOpen?.();
  };

  const handleLongPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onRemove?.();
  };

  return (
    <MotiView
      from={{ opacity: 0, translateY: 4 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 220, delay: 30 + index * 20 }}
      style={styles.tileWrap}
    >
      <Pressable
        onPress={handlePress}
        onLongPress={handleLongPress}
        delayLongPress={350}
        style={({ pressed }) => [
          styles.tile,
          {
            backgroundColor: tokens.upload.tileBg,
            borderColor: tokens.upload.tileBorder,
          },
          pressed && { opacity: 0.95 },
        ]}
      >
        <Image
          source={{ uri: image.uri }}
          style={StyleSheet.absoluteFillObject}
          contentFit="cover"
          cachePolicy="memory-disk"
        />

        {isUploading ? (
          <View style={styles.overlay}>
            <LinearGradient
              colors={['rgba(0,0,0,0.40)', 'rgba(0,0,0,0.05)']}
              start={{ x: 0, y: 1 }}
              end={{ x: 0, y: 0 }}
              style={StyleSheet.absoluteFill}
            />
            <View style={styles.ringWrap}>
              <Svg width={RING_SIZE} height={RING_SIZE}>
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke={tokens.upload.ringTrack}
                  strokeWidth={RING_STROKE}
                  fill="transparent"
                />
                <Circle
                  cx={RING_SIZE / 2}
                  cy={RING_SIZE / 2}
                  r={RING_RADIUS}
                  stroke={tokens.upload.ringFg}
                  strokeWidth={RING_STROKE}
                  fill="transparent"
                  strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                  strokeDashoffset={offset}
                  strokeLinecap="round"
                  transform={`rotate(-90 ${RING_SIZE / 2} ${RING_SIZE / 2})`}
                />
              </Svg>
            </View>
            <Text style={styles.overlayLabel}>{Math.round((image.progress || 0) * 100)}%</Text>
          </View>
        ) : null}

        {isFailed ? (
          <View style={[styles.statusBadge, { backgroundColor: tokens.upload.failBg }]}>
            <AlertCircle size={11} color={tokens.upload.failFg} strokeWidth={2.4} />
            <Text style={[styles.statusText, { color: tokens.upload.failFg }]}>
              Tap to retry
            </Text>
          </View>
        ) : null}

        {isSuccess ? (
          <View style={[styles.successDot, { backgroundColor: tokens.upload.successFg }]}>
            <Check size={9} color="#ffffff" strokeWidth={3} />
          </View>
        ) : null}

        {isFailed ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation?.();
              Haptics.selectionAsync().catch(() => {});
              onRetry?.();
            }}
            hitSlop={6}
            style={styles.cornerBtn}
          >
            <RotateCw size={11} color="#ffffff" strokeWidth={2.4} />
          </Pressable>
        ) : (
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
              onRemove?.();
            }}
            hitSlop={6}
            style={styles.cornerBtn}
          >
            <Trash2 size={11} color="#ffffff" strokeWidth={2.4} />
          </Pressable>
        )}
      </Pressable>
    </MotiView>
  );
}

function AddTile({ onPress, tokens }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tileWrap,
        pressed && { opacity: 0.94 },
      ]}
    >
      <View
        style={[
          styles.tile,
          styles.addTile,
          {
            backgroundColor: tokens.upload.tileGhost,
            borderColor: tokens.upload.tileGhostBorder,
          },
        ]}
      >
        <Plus size={20} color={tokens.upload.ringFg} strokeWidth={2.2} />
        <Text style={[styles.addLabel, { color: tokens.upload.ringFg }]}>
          Add photo
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 22,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  subtle: { fontSize: 11, fontWeight: '600' },
  tabs: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 14,
    gap: 4,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  tabText: {
    flexShrink: 1,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: -0.1,
  },
  tabBadge: {
    flexShrink: 0,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 999,
    minWidth: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tileWrap: {
    width: '31.6%',
    aspectRatio: 1,
  },
  tile: {
    flex: 1,
    borderRadius: 14,
    borderWidth: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  addTile: {
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringWrap: { alignItems: 'center', justifyContent: 'center' },
  overlayLabel: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.2,
    marginTop: 4,
  },
  statusBadge: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusText: {
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  successDot: {
    position: 'absolute',
    left: 6,
    bottom: 6,
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cornerBtn: {
    position: 'absolute',
    right: 6,
    top: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helpText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
