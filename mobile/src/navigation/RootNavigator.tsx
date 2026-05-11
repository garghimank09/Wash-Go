import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import React from 'react';

import { useAuth } from '../context/AuthContext';
import { SplashScreen } from '../screens/SplashScreen';
import { colors } from '../theme/colors';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';

const navTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.primary,
    background: colors.bg,
    card: colors.bgElevated,
    text: colors.text,
    border: colors.border,
    notification: colors.accent,
  },
};

export function RootNavigator() {
  const { user, bootstrapping } = useAuth();

  if (bootstrapping) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer theme={navTheme}>{user ? <MainNavigator /> : <AuthNavigator />}</NavigationContainer>
  );
}
