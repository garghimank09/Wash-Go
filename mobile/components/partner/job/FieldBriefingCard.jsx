import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import { AlertTriangle, FileText, Info } from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getBriefingTokens } from '../../../constants/jobTheme';

const TONE_ICON = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  premium: Info,
  neutral: Info,
};

/**
 * Operational field briefing. Surfaces special handling tags, customer notes,
 * and one-line alerts so the washer can scan the brief in seconds.
 */
export default function FieldBriefingCard({ briefing }) {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);

  if (!briefing) return null;
  const { tags = [], notes, alerts = [] } = briefing;

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
          <FileText size={14} color={theme.accent.primary} strokeWidth={2.4} />
        </View>
        <Text style={[styles.title, { color: theme.text.primary }]}>
          Field briefing
        </Text>
        <View style={{ flex: 1 }} />
        <Text style={[styles.tagCount, { color: theme.text.muted }]}>
          {tags.length + alerts.length} items
        </Text>
      </View>

      {tags.length > 0 ? (
        <View style={styles.tagWrap}>
          {tags.map((tag) => {
            const tokens = getBriefingTokens(tag.tone, isDark);
            return (
              <View
                key={tag.id}
                style={[
                  styles.tag,
                  {
                    backgroundColor: tokens.bg,
                    borderColor: tokens.border,
                  },
                ]}
              >
                <View style={[styles.tagDot, { backgroundColor: tokens.fg }]} />
                <Text style={[styles.tagText, { color: tokens.fg }]} numberOfLines={1}>
                  {tag.label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {notes ? (
        <View
          style={[
            styles.notesWrap,
            {
              backgroundColor: theme.customer.surface,
              borderColor: theme.customer.outlineVariant,
            },
          ]}
        >
          <Text style={[styles.notesLabel, { color: theme.text.muted }]}>
            Customer notes
          </Text>
          <Text style={[styles.notesBody, { color: theme.text.primary }]}>
            {notes}
          </Text>
        </View>
      ) : null}

      {alerts.length > 0 ? (
        <View style={styles.alertWrap}>
          {alerts.map((alert) => {
            const tokens = getBriefingTokens(alert.tone, isDark);
            const Icon = TONE_ICON[alert.tone] || Info;
            return (
              <View
                key={alert.id}
                style={[
                  styles.alertRow,
                  {
                    backgroundColor: tokens.bg,
                    borderColor: tokens.border,
                  },
                ]}
              >
                <Icon size={13} color={tokens.fg} strokeWidth={2.4} />
                <Text style={[styles.alertText, { color: tokens.fg }]} numberOfLines={2}>
                  {alert.label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}
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
  tagCount: { fontSize: 11, fontWeight: '600' },
  tagWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  notesWrap: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  notesLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  notesBody: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  alertWrap: {
    gap: 6,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  alertText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    letterSpacing: 0.1,
  },
});
