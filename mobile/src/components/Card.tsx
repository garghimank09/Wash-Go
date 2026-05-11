import React from 'react';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { colors } from '../theme/colors';
import { radius, spacing } from '../theme/spacing';

export function Card({ children, style, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgElevated,
    borderRadius: radius.lg,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
});
