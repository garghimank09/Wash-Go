import { useEffect } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import Svg, { Path } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { ClipboardCheck, Cloud, CloudOff } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getJobTokens } from '../../../constants/jobTheme';

const PARTNER_EASE = Easing.bezier(0.25, 0.1, 0.25, 1);
const AnimatedPath = Animated.createAnimatedComponent(Path);

// Tick path drawn in a 16x16 viewbox; ~24 units of stroke length.
const TICK_PATH = 'M3.5 8.5 L7 12 L13 5';
const TICK_LENGTH = 14;

function Checkbox({ checked, tokens }) {
  const progress = useSharedValue(checked ? 1 : 0);
  const fill = useSharedValue(checked ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(checked ? 1 : 0, { duration: 220, easing: PARTNER_EASE });
    fill.value = withTiming(checked ? 1 : 0, { duration: 200, easing: PARTNER_EASE });
  }, [checked, progress, fill]);

  const tickProps = useAnimatedProps(() => ({
    strokeDashoffset: TICK_LENGTH * (1 - progress.value),
  }));

  const boxStyle = useAnimatedStyle(() => ({
    backgroundColor:
      fill.value > 0
        ? `rgba(8,145,178,${0.0 + fill.value * 1.0})`
        : 'transparent',
    borderColor: fill.value > 0.5 ? tokens.checked.ring : tokens.idle.ring,
  }));

  return (
    <Animated.View style={[styles.checkbox, boxStyle]}>
      <Svg width={16} height={16} viewBox="0 0 16 16">
        <AnimatedPath
          d={TICK_PATH}
          stroke={tokens.checked.tick}
          strokeWidth={2.2}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="transparent"
          strokeDasharray={`${TICK_LENGTH} ${TICK_LENGTH}`}
          animatedProps={tickProps}
        />
      </Svg>
    </Animated.View>
  );
}

function ProgressBar({ progress, tokens }) {
  const v = useSharedValue(progress);
  useEffect(() => {
    v.value = withTiming(progress, { duration: 260, easing: PARTNER_EASE });
  }, [progress, v]);
  const fillStyle = useAnimatedStyle(() => ({
    width: `${v.value * 100}%`,
  }));
  return (
    <View style={[styles.progressTrack, { backgroundColor: tokens.progressTrack }]}>
      <Animated.View
        style={[styles.progressFill, { backgroundColor: tokens.progress }, fillStyle]}
      />
    </View>
  );
}

export default function WashChecklistCard({ rows, toggle, progress, saveStatus }) {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);
  const tokens = getJobTokens(isDark).checklist;

  const completed = rows.filter((r) => r.done).length;
  const SaveIcon = saveStatus === 'idle' ? CloudOff : Cloud;

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
          <ClipboardCheck size={14} color={theme.accent.primary} strokeWidth={2.4} />
        </View>
        <View style={styles.headerCol}>
          <Text style={[styles.title, { color: theme.text.primary }]}>
            Service checklist
          </Text>
          <View style={styles.headerMetaRow}>
            <Text style={[styles.headerMeta, { color: theme.text.muted }]}>
              {completed} / {rows.length} complete
            </Text>
            <View style={styles.saveStatus}>
              <SaveIcon size={11} color={theme.text.muted} strokeWidth={2.4} />
              <Text style={[styles.saveText, { color: theme.text.muted }]}>
                {saveStatus === 'saving' ? 'Saving' : saveStatus === 'saved' ? 'Auto-saved' : 'Sync'}
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ProgressBar progress={progress} tokens={tokens} />

      <View style={styles.list}>
        {rows.map((row) => (
          <Pressable
            key={row.id}
            onPress={() => {
              Haptics.selectionAsync().catch(() => {});
              toggle?.(row.id);
            }}
            style={({ pressed }) => [
              styles.row,
              {
                backgroundColor: row.done
                  ? theme.customer.primaryBg
                  : theme.customer.surface,
                borderColor: row.done
                  ? theme.customer.primaryBg
                  : theme.customer.outlineVariant,
              },
              pressed && { opacity: 0.94 },
            ]}
          >
            <Checkbox checked={row.done} tokens={tokens} />
            <Text
              style={[
                styles.rowLabel,
                {
                  color: row.done ? theme.accent.dark : theme.text.primary,
                  textDecorationLine: row.done ? 'line-through' : 'none',
                  opacity: row.done ? 0.85 : 1,
                },
              ]}
            >
              {row.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </MotiView>
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
    gap: 10,
  },
  headerIcon: {
    width: 26,
    height: 26,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCol: { flex: 1, gap: 2 },
  title: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  headerMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerMeta: { fontSize: 11, fontWeight: '600' },
  saveStatus: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  saveText: { fontSize: 10, fontWeight: '700', letterSpacing: 0.2 },
  progressTrack: {
    height: 6,
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: { height: '100%', borderRadius: 999 },
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.1,
  },
});
