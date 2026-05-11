import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Card } from '../components/Card';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function AiAssistantScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['left', 'right', 'bottom']}>
      <View style={styles.body}>
        <Card>
          <Text style={styles.title}>Gen AI concierge (coming soon)</Text>
          <Text style={styles.bodyText}>
            This screen is reserved for Ollama-powered chat, booking insights, and review summaries. The mobile app
            already uses a JWT-aware Axios client so you can safely add streaming endpoints and WebSocket channels
            without restructuring navigation.
          </Text>
        </Card>
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={styles.subhead}>Planned integrations</Text>
          <Text style={styles.bullet}>• POST /api/generate via secure backend proxy{'\n'}• Session context from active booking{'\n'}• Tool calls for reschedule & support</Text>
        </Card>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  body: { padding: spacing.lg },
  title: { fontSize: 20, fontWeight: '800', color: colors.text },
  bodyText: { marginTop: spacing.md, color: colors.textMuted, lineHeight: 22, fontSize: 15 },
  subhead: { fontWeight: '800', color: colors.text, marginBottom: spacing.sm },
  bullet: { color: colors.textMuted, lineHeight: 22, fontSize: 14 },
});
