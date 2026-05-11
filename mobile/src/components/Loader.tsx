import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { colors } from '../theme/colors';

export function Loader({ size = 'large' }: { size?: 'small' | 'large' }) {
  return (
    <View style={styles.wrap} accessibilityLabel="Loading">
      <ActivityIndicator size={size} color={colors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
