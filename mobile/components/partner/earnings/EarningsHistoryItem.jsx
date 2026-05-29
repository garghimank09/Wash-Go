import { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Swipeable } from 'react-native-gesture-handler';
import { MotiView } from 'moti';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Trash2, ChevronDown } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPayoutStatus } from '../../../constants/earningsTheme';
import { formatPayoutCurrency, formatPayoutDate } from '../../../lib/partnerFormatters';
import CardSurface from '../../ui/CardSurface';

export default function EarningsHistoryItem({ item, index = 0, onDismiss }) {
  const { theme, isDark } = useTheme();
  const statusTokens = getPayoutStatus(item.status, isDark);
  const c = theme.customer;

  const [expanded, setExpanded] = useState(false);
  const rotate = useSharedValue(0);

  const toggleExpanded = () => {
    Haptics.selectionAsync().catch(() => {});
    const next = !expanded;
    setExpanded(next);
    rotate.value = withTiming(next ? 1 : 0, {
      duration: 240,
      easing: Easing.out(Easing.cubic),
    });
  };

  const chevronStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotate.value * 180}deg` }],
  }));

  const renderRightActions = () => (
    <View style={[styles.deleteAction, { backgroundColor: theme.customer.error + '14' }]}>
      <Trash2 size={20} color={theme.customer.error} strokeWidth={2.4} />
    </View>
  );

  return (
    <MotiView
      from={{ opacity: 0, translateY: 6 }}
      animate={{ opacity: 1, translateY: 0 }}
      transition={{ type: 'timing', duration: 260, delay: 40 + index * 35 }}
    >
      <Swipeable
        renderRightActions={renderRightActions}
        onSwipeableOpen={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
          onDismiss?.(item.id);
        }}
        friction={1.6}
        rightThreshold={48}
      >
        <CardSurface
          onPress={toggleExpanded}
          borderRadius={18}
          backgroundColor={c.surfaceContainerLowest}
          shadow="rim"
          portal="partner"
          style={styles.card}
        >
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={[styles.name, { color: theme.text.primary }]} numberOfLines={1}>
                {item.customer}
              </Text>
              <Text style={[styles.date, { color: theme.text.secondary }]}>
                {formatPayoutDate(item.date)}
              </Text>
            </View>
            <View style={styles.right}>
              <Text style={[styles.amount, { color: theme.text.primary }]}>
                {formatPayoutCurrency(item.amountCents)}
              </Text>
              <View style={[styles.statusPill, { backgroundColor: statusTokens.bg }]}>
                <Text style={[styles.statusText, { color: statusTokens.fg }]}>
                  {statusTokens.label}
                </Text>
              </View>
            </View>
            <Animated.View style={chevronStyle}>
              <ChevronDown size={16} color={theme.text.muted} strokeWidth={2.4} />
            </Animated.View>
          </View>

          {expanded ? (
            <MotiView
              from={{ opacity: 0, translateY: -2 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 220 }}
              style={[styles.detail, { borderTopColor: c.outlineVariant }]}
            >
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.text.muted }]}>
                  Payout method
                </Text>
                <Text style={[styles.detailValue, { color: theme.text.primary }]}>
                  {item.method}
                </Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={[styles.detailLabel, { color: theme.text.muted }]}>
                  Reference
                </Text>
                <Text style={[styles.detailValue, { color: theme.text.primary }]}>
                  {item.id.toUpperCase()}
                </Text>
              </View>
            </MotiView>
          ) : null}
        </CardSurface>
      </Swipeable>
    </MotiView>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  col: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '800', letterSpacing: -0.2 },
  date: { fontSize: 12, fontWeight: '500' },
  right: { alignItems: 'flex-end', gap: 4 },
  amount: { fontSize: 15, fontWeight: '800', letterSpacing: -0.3 },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  detail: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    gap: 6,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  detailLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.2, textTransform: 'uppercase' },
  detailValue: { fontSize: 12, fontWeight: '700' },
  deleteAction: {
    width: 64,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    marginLeft: 8,
  },
});
