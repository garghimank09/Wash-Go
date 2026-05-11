import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';

export function SplashScreen() {
  return (
    <LinearGradient colors={[colors.bg, colors.bgElevated, '#0F172A']} style={styles.root}>
      <View style={styles.content}>
        <Text style={styles.logo}>WashGo</Text>
        <Text style={styles.tagline}>On-demand shine, built for what comes next.</Text>
        <ActivityIndicator style={styles.spinner} size="large" color={colors.primary} />
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  logo: {
    fontSize: 42,
    fontWeight: '900',
    color: colors.text,
    letterSpacing: -1,
  },
  tagline: {
    marginTop: spacing.md,
    fontSize: 15,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  spinner: { marginTop: spacing.xxl },
});
