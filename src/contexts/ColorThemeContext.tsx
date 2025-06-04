
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme as useNextTheme } from 'next-themes'; // Renamed to avoid conflict

export type ThemeMode = 'light' | 'dark';

export type ThemeName =
  | 'light-theme-brighter-zen'
  | 'light-theme-oceanic-bliss'
  | 'light-theme-forest-harmony'
  | 'light-theme-crimson-royal'
  | 'light-theme-sunset-glow'
  | 'light-theme-minty-fresh'
  | 'light-theme-ruby-radiance'
  | 'light-theme-vintage-sepia'
  | 'dark-theme-deep-indigo'
  | 'dark-theme-oceanic-depths'
  | 'dark-theme-forest-canopy'
  | 'dark-theme-crimson-night'
  | 'dark-theme-twilight-blaze'
  | 'dark-theme-minty-umbra'
  | 'dark-theme-garnet-gloom'
  | 'dark-theme-neon-pulse';

interface ColorTheme {
  name: ThemeName;
  displayName: string;
  mode: ThemeMode;
}

export const availableColorThemes: ColorTheme[] = [
  { name: 'light-theme-brighter-zen', displayName: 'Brighter Zen (Light Default)', mode: 'light' },
  { name: 'light-theme-oceanic-bliss', displayName: 'Oceanic Bliss (Light)', mode: 'light' },
  { name: 'light-theme-forest-harmony', displayName: 'Forest Harmony (Light)', mode: 'light' },
  { name: 'light-theme-crimson-royal', displayName: 'Crimson Royal (Light)', mode: 'light' },
  { name: 'light-theme-sunset-glow', displayName: 'Sunset Glow (Light)', mode: 'light' },
  { name: 'light-theme-minty-fresh', displayName: 'Minty Fresh (Light)', mode: 'light' },
  { name: 'light-theme-ruby-radiance', displayName: 'Ruby Radiance (Light)', mode: 'light' },
  { name: 'light-theme-vintage-sepia', displayName: 'Vintage Sepia (Light)', mode: 'light' },
  { name: 'dark-theme-deep-indigo', displayName: 'Deep Indigo (Dark Default)', mode: 'dark' },
  { name: 'dark-theme-oceanic-depths', displayName: 'Oceanic Depths (Dark)', mode: 'dark' },
  { name: 'dark-theme-forest-canopy', displayName: 'Forest Canopy (Dark)', mode: 'dark' },
  { name: 'dark-theme-crimson-night', displayName: 'Crimson Night (Dark)', mode: 'dark' },
  { name: 'dark-theme-twilight-blaze', displayName: 'Twilight Blaze (Dark)', mode: 'dark' },
  { name: 'dark-theme-minty-umbra', displayName: 'Minty Umbra (Dark)', mode: 'dark' },
  { name: 'dark-theme-garnet-gloom', displayName: 'Garnet Gloom (Dark)', mode: 'dark' },
  { name: 'dark-theme-neon-pulse', displayName: 'Neon Pulse (Dark)', mode: 'dark' },
];

const COLOR_THEME_STORAGE_KEY = 'commercezen_color_theme_v3'; // Incremented version
const DEFAULT_LIGHT_THEME_NAME: ThemeName = 'light-theme-brighter-zen';
const DEFAULT_DARK_THEME_NAME: ThemeName = 'dark-theme-deep-indigo';

interface ColorThemeContextType {
  colorTheme: ThemeName; // The name of the currently active custom theme
  setColorTheme: (themeName: ThemeName) => void;
  currentModeThemes: ColorTheme[]; // Themes filtered for current light/dark mode (from next-themes)
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme: actualResolvedMode } = useNextTheme(); // e.g., 'light' or 'dark'
  const [colorTheme, _setColorTheme] = useState<ThemeName>(DEFAULT_LIGHT_THEME_NAME);
  const [currentModeThemes, setCurrentModeThemes] = useState<ColorTheme[]>([]);
  const [mounted, setMounted] = useState(false);

  const applyCustomThemeClass = useCallback((themeNameToApply: ThemeName) => {
    if (typeof window !== 'undefined') {
      availableColorThemes.forEach(t => {
        document.documentElement.classList.remove(t.name);
      });
      // Only add the class if it's not one of the base themes handled by :root or .dark
      // Or, always add it for consistency, as it won't hurt if vars are identical.
      // For simplicity and explicit state, always add the chosen theme class.
      document.documentElement.classList.add(themeNameToApply);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !actualResolvedMode) return; // Wait for mount and next-themes to resolve mode

    let initialThemeName: ThemeName;
    const storedThemeName = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ThemeName | null;
    const storedThemeDetails = storedThemeName ? availableColorThemes.find(t => t.name === storedThemeName) : null;

    if (storedThemeDetails && storedThemeDetails.mode === actualResolvedMode) {
      initialThemeName = storedThemeDetails.name;
    } else {
      initialThemeName = actualResolvedMode === 'dark' ? DEFAULT_DARK_THEME_NAME : DEFAULT_LIGHT_THEME_NAME;
    }

    _setColorTheme(initialThemeName);
    applyCustomThemeClass(initialThemeName);
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, initialThemeName);
    setCurrentModeThemes(availableColorThemes.filter(t => t.mode === actualResolvedMode));

  }, [mounted, actualResolvedMode, applyCustomThemeClass]);


  useEffect(() => {
    if (!mounted || !actualResolvedMode) return;

    // Update available themes for the current mode
    setCurrentModeThemes(availableColorThemes.filter(t => t.mode === actualResolvedMode));

    // If the current custom theme (`colorTheme`) is not compatible with the OS/next-themes mode, switch to default for that mode.
    const currentCustomThemeDetails = availableColorThemes.find(t => t.name === colorTheme);
    if (currentCustomThemeDetails && currentCustomThemeDetails.mode !== actualResolvedMode) {
      const newDefaultForMode = actualResolvedMode === 'dark' ? DEFAULT_DARK_THEME_NAME : DEFAULT_LIGHT_THEME_NAME;
      _setColorTheme(newDefaultForMode);
      applyCustomThemeClass(newDefaultForMode);
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, newDefaultForMode);
    }
  }, [actualResolvedMode, colorTheme, mounted, applyCustomThemeClass]);


  const setColorTheme = useCallback((newThemeName: ThemeName) => {
    if (!mounted || !actualResolvedMode) return;
    
    const themeDetails = availableColorThemes.find(t => t.name === newThemeName);

    // Ensure the selected theme is compatible with the current light/dark mode
    if (themeDetails && themeDetails.mode === actualResolvedMode) {
      _setColorTheme(newThemeName);
      applyCustomThemeClass(newThemeName);
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, newThemeName);
    } else {
      // This case should ideally be prevented by the UI (ProfileClientView filters themes)
      // If it happens, fall back to the default for the current mode
      console.warn(`Theme ${newThemeName} is not compatible with current mode ${actualResolvedMode}. Falling back to default.`);
      const fallbackTheme = actualResolvedMode === 'dark' ? DEFAULT_DARK_THEME_NAME : DEFAULT_LIGHT_THEME_NAME;
      _setColorTheme(fallbackTheme);
      applyCustomThemeClass(fallbackTheme);
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, fallbackTheme);
    }
  }, [mounted, actualResolvedMode, applyCustomThemeClass]);

  const value = {
    colorTheme,
    setColorTheme,
    currentModeThemes,
  };

  return (
    <ColorThemeContext.Provider value={value}>
      {children}
    </ColorThemeContext.Provider>
  );
}

export function useColorTheme() {
  const context = useContext(ColorThemeContext);
  if (context === undefined) {
    throw new Error('useColorTheme must be used within a ColorThemeProvider');
  }
  return context;
}

    