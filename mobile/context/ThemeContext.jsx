import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme } from '../constants/theme';

const THEME_STORAGE_KEY = '@washgo_theme_preference';

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  themePreference: 'system',
  setThemePreference: () => {},
});

export function ThemeProvider({ children }) {
  const systemColorScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(THEME_STORAGE_KEY)
      .then((saved) => {
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemePreferenceState(saved);
        }
      })
      .finally(() => setIsLoaded(true));
  }, []);

  const setThemePreference = async (preference) => {
    setThemePreferenceState(preference);
    await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
  };

  const isDark =
    themePreference === 'system'
      ? systemColorScheme === 'dark'
      : themePreference === 'dark';

  const theme = isLoaded
    ? isDark
      ? darkTheme
      : lightTheme
    : lightTheme;

  return (
    <ThemeContext.Provider
      value={{ theme, isDark: isLoaded ? isDark : false, themePreference, setThemePreference }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}