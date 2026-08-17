import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const LightColors = {
  primary: '#10B981',       // Vibrant Emerald
  primaryDark: '#064E3B',   // Deep Forest Emerald
  primaryLight: '#ECFDF5',  // Mint tint
  secondary: '#F59E0B',     // Warm Amber/Gold
  secondaryLight: '#FEF3C7',// Amber tint
  accent: '#6366F1',        // Indigo Accent
  background: '#F8FAFC',    // Soft Slate Light
  card: '#FFFFFF',          // Clean White
  surface: '#FFFFFF',       // Surface White
  cardBorder: '#E2E8F0',    // Slate Border
  text: '#0F172A',          // Deep Slate Text
  textMuted: '#64748B',     // Slate Muted Text
  textSecondary: '#64748B', // Compatibility Alias
  border: '#E2E8F0',        // Border
  danger: '#EF4444',        // Red Danger
  dangerLight: '#FEE2E2',   // Red Tint
  navBackground: '#FFFFFF', // Bottom Nav White
  navBorder: '#F1F5F9',
  navActiveText: '#064E3B',
  navInactiveText: '#94A3B8',
  badgeBg: '#F1F5F9',
};

export const DarkColors = {
  primary: '#10B981',       // Emerald
  primaryDark: '#34D399',   // Lighter mint for dark mode readability
  primaryLight: '#064E3B',  // Dark Forest tint
  secondary: '#FBBF24',     // Warm Gold
  secondaryLight: '#78350F',// Dark Amber tint
  accent: '#818CF8',        // Indigo
  background: '#0B0F17',    // Deep Dark Navy/Slate
  card: '#161E2E',          // Dark Card Slate
  surface: '#161E2E',       // Dark Surface
  cardBorder: '#283548',    // Dark Border
  text: '#F8FAFC',          // Light Text
  textMuted: '#94A3B8',     // Muted Text
  textSecondary: '#94A3B8', // Compatibility Alias
  border: '#283548',        // Dark Border
  danger: '#F87171',        // Red Danger
  dangerLight: '#450A0A',   // Dark Red Tint
  navBackground: '#111827', // Dark Nav
  navBorder: '#1F2937',
  navActiveText: '#34D399',
  navInactiveText: '#64748B',
  badgeBg: '#1F2937',
};

export const Colors = LightColors;

export type ThemePreference = 'system' | 'light' | 'dark';

interface ThemeContextData {
  themePreference: ThemePreference;
  setThemePreference: (pref: ThemePreference) => void;
  isDark: boolean;
  colors: typeof LightColors;
}

const ThemeContext = createContext<ThemeContextData>({} as ThemeContextData);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const systemScheme = useColorScheme();
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const saved = await AsyncStorage.getItem('@healthy_routine_theme');
        if (saved === 'light' || saved === 'dark' || saved === 'system') {
          setThemePreferenceState(saved);
        }
      } catch (err) {
        console.warn('Failed to load theme preference', err);
      }
    };
    loadTheme();
  }, []);

  const setThemePreference = async (pref: ThemePreference) => {
    setThemePreferenceState(pref);
    try {
      await AsyncStorage.setItem('@healthy_routine_theme', pref);
    } catch (err) {
      console.warn('Failed to save theme preference', err);
    }
  };

  const isDark =
    themePreference === 'dark'
      ? true
      : themePreference === 'light'
      ? false
      : systemScheme === 'dark';

  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider
      value={{
        themePreference,
        setThemePreference,
        isDark,
        colors,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useAppTheme = () => useContext(ThemeContext);
