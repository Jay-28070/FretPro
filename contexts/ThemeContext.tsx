/**
 * Theme Context
 * 
 * Provides theme toggle functionality and current theme state.
 * Wraps Expo's useColorScheme with manual override capability.
 * 
 * Why: Users need to manually toggle theme in Settings.
 * Pattern: Standard React Context extending Expo's theme system.
 */

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

type ColorScheme = 'light' | 'dark';
type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
  colorScheme: ColorScheme;
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@fretpro_theme_preference';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const deviceColorScheme = useDeviceColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load saved preference on mount
  useEffect(() => {
    loadThemePreference();
  }, []);

  const loadThemePreference = async () => {
    try {
      // TODO: Uncomment when AsyncStorage is installed
      // const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      // if (saved && (saved === 'light' || saved === 'dark' || saved === 'system')) {
      //   setThemePreferenceState(saved as ThemePreference);
      // }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setThemePreference = async (preference: ThemePreference) => {
    try {
      // TODO: Uncomment when AsyncStorage is installed
      // await AsyncStorage.setItem(THEME_STORAGE_KEY, preference);
      setThemePreferenceState(preference);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  // Determine actual color scheme based on preference
  const colorScheme: ColorScheme = 
    themePreference === 'system' 
      ? (deviceColorScheme ?? 'dark')
      : themePreference;

  // Don't render until theme is loaded to prevent flash
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeContext.Provider value={{ colorScheme, themePreference, setThemePreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
