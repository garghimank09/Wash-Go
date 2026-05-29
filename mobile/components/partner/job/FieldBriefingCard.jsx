import { View, Text, StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import {
  AlertTriangle,
  Car,
  ClipboardList,
  FileText,
  Info,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../../../context/ThemeContext';
import { getPartnerShadow } from '../../../constants/partnerTheme';
import { getBriefingTokens } from '../../../constants/jobTheme';
import { hasBriefingContent } from '../../../lib/parseBookingBriefing';

const TONE_ICON = {
  critical: AlertTriangle,
  warning: AlertTriangle,
  info: Info,
  premium: Sparkles,
  neutral: Info,
};

const TAG_ICON = {
  package: Sparkles,
  vehicle: Car,
};

function BriefingSection({ label, children, theme }) {
  return (
    <View
      style={[
        styles.section,
        {
          backgroundColor: theme.customer.surface,
          borderColor: theme.customer.outlineVariant,
        },
      ]}
    >
      <Text style={[styles.sectionLabel, { color: theme.text.muted }]}>{label}</Text>
      {children}
    </View>
  );
}

/**
 * Operational field briefing. Surfaces package/vehicle chips, customer
 * instructions, arrival notes, and alerts — never raw WashGo metadata.
 */
export default function FieldBriefingCard({ briefing }) {
  const { theme, isDark } = useTheme();
  const shadows = getPartnerShadow(isDark);

  if (!hasBriefingContent(briefing)) return null;

  const { tags = [], customerInstructions, arrivalNotes, alerts = [] } = briefing;
  const itemCount =
    tags.length +
    alerts.length +
    (customerInstructions ? 1 : 0) +
    (arrivalNotes ? 1 : 0);

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
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </Text>
      </View>

      {tags.length > 0 ? (
        <View style={styles.tagWrap}>
          {tags.map((tag) => {
            const tokens = getBriefingTokens(tag.tone, isDark);
            const Icon = TAG_ICON[tag.id] || TONE_ICON[tag.tone] || Info;
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
                <Icon size={12} color={tokens.fg} strokeWidth={2.4} />
                <Text style={[styles.tagText, { color: tokens.fg }]} numberOfLines={1}>
                  {tag.label}
                </Text>
              </View>
            );
          })}
        </View>
      ) : null}

      {customerInstructions ? (
        <BriefingSection label="Customer instructions" theme={theme}>
          <Text style={[styles.instructionBody, { color: theme.text.primary }]}>
            {customerInstructions}
          </Text>
        </BriefingSection>
      ) : null}

      {arrivalNotes ? (
        <BriefingSection label="Arrival condition" theme={theme}>
          <View style={styles.arrivalRow}>
            <ClipboardList size={14} color={theme.text.secondary} strokeWidth={2.3} />
            <Text style={[styles.instructionBody, { color: theme.text.primary, flex: 1 }]}>
              {arrivalNotes}
            </Text>
          </View>
        </BriefingSection>
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
                <Text style={[styles.alertText, { color: tokens.fg }]} numberOfLines={3}>
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
    overflow: 'hidden',
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
  tagText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.1,
  },
  section: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    gap: 6,
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  instructionBody: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 19,
  },
  arrivalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  alertWrap: {
    gap: 6,
  },
  alertRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    lineHeight: 17,
  },
});
