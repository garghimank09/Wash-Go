import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View, type ViewProps } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

export function GradientCard({
  title,
  subtitle,
  children,
  style,
}: ViewProps & {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <LinearGradient
      colors={[colors.gradientA, colors.gradientB]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.wrap, style]}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        {children}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  inner: {
    padding: spacing.lg,
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.88)',
    marginTop: spacing.xs,
    fontSize: 14,
    lineHeight: 20,
  },
});
