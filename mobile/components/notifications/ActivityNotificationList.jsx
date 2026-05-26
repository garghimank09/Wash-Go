import { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MotiView } from 'moti';
import { groupNotificationsForUi } from '../../lib/notificationModel';

/**
 * Premium grouped notification list (Today / Earlier).
 * @param {object} props
 * @param {Array} props.items
 * @param {number} props.readCutoff
 * @param {boolean} props.loading
 * @param {boolean} props.refreshing
 * @param {() => void} props.onRefresh
 * @param {(item: object) => React.ReactNode} props.renderCard
 */
export default function ActivityNotificationList({
  items,
  readCutoff = 0,
  loading = false,
  refreshing = false,
  onRefresh,
  renderCard,
  emptyIcon: EmptyIcon,
  emptyTitle = 'All caught up',
  emptySubtitle = 'Live updates will appear here instantly.',
  theme,
}) {
  const sections = useMemo(() => groupNotificationsForUi(items), [items]);

  if (loading && items.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={theme.accent.primary} />
        <Text style={[styles.loadingText, { color: theme.text.muted }]}>Syncing activity…</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View style={styles.centered}>
        {EmptyIcon ? (
          <View style={[styles.emptyIcon, { backgroundColor: theme.customer.primaryBg }]}>
            <EmptyIcon size={32} color={theme.text.muted} strokeWidth={2} />
          </View>
        ) : null}
        <Text style={[styles.emptyTitle, { color: theme.text.primary }]}>{emptyTitle}</Text>
        <Text style={[styles.emptySub, { color: theme.text.secondary }]}>{emptySubtitle}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.list}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.accent.primary}
          />
        ) : undefined
      }
    >
      {sections.map((section) => (
        <View key={section.key} style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.text.muted }]}>{section.title}</Text>
          {section.data.map((item, index) => (
            <MotiView
              key={item.id}
              from={{ opacity: 0, translateY: 10 }}
              animate={{ opacity: 1, translateY: 0 }}
              transition={{ type: 'timing', duration: 280, delay: Math.min(index * 40, 200) }}
            >
              {renderCard(item, item.createdAt > readCutoff)}
            </MotiView>
          ))}
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  list: { paddingBottom: 32 },
  section: { marginBottom: 8 },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginTop: 6,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
    paddingTop: 48,
  },
  loadingText: { marginTop: 12, fontSize: 13, fontWeight: '600' },
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
