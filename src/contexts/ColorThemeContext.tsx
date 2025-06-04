
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme as useNextTheme } from 'next-themes';

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

const COLOR_THEME_STORAGE_KEY = 'commercezen_color_theme_v3';
const DEFAULT_LIGHT_THEME_NAME: ThemeName = 'light-theme-brighter-zen';
const DEFAULT_DARK_THEME_NAME: ThemeName = 'dark-theme-deep-indigo';

interface ColorThemeContextType {
  colorTheme: ThemeName;
  setColorTheme: (themeName: ThemeName) => void;
  currentModeThemes: ColorTheme[];
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme: actualResolvedMode } = useNextTheme();
  const [colorTheme, _setColorTheme] = useState<ThemeName>(DEFAULT_LIGHT_THEME_NAME);
  const [currentModeThemes, setCurrentModeThemes] = useState<ColorTheme[]>([]);
  const [mounted, setMounted] = useState(false);

  const applyCustomThemeClass = useCallback((themeNameToApply: ThemeName) => {
    if (typeof window !== 'undefined') {
      availableColorThemes.forEach(t => {
        document.documentElement.classList.remove(t.name);
      });
      document.documentElement.classList.add(themeNameToApply);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Effect for initial theme load and when OS/next-themes mode changes
  useEffect(() => {
    if (!mounted || !actualResolvedMode) return;

    let themeToApply: ThemeName;
    const storedThemeName = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ThemeName | null;
    const storedThemeDetails = storedThemeName ? availableColorThemes.find(t => t.name === storedThemeName) : null;

    if (storedThemeDetails && storedThemeDetails.mode === actualResolvedMode) {
      themeToApply = storedThemeDetails.name;
    } else {
      themeToApply = actualResolvedMode === 'dark' ? DEFAULT_DARK_THEME_NAME : DEFAULT_LIGHT_THEME_NAME;
    }

    _setColorTheme(themeToApply);
    applyCustomThemeClass(themeToApply);
    if(themeToApply) localStorage.setItem(COLOR_THEME_STORAGE_KEY, themeToApply);
    
    setCurrentModeThemes(availableColorThemes.filter(t => t.mode === actualResolvedMode));

  }, [mounted, actualResolvedMode, applyCustomThemeClass]);


  // Effect to react if `colorTheme` state somehow becomes incompatible with `actualResolvedMode`
  // This primarily handles edge cases or direct state manipulation not through `setColorTheme`.
  useEffect(() => {
    if (!mounted || !actualResolvedMode || !colorTheme) return;
    
    // Update currentModeThemes whenever actualResolvedMode changes (also done above, but good for consistency)
    setCurrentModeThemes(availableColorThemes.filter(t => t.mode === actualResolvedMode));

    const currentSelectedCustomThemeDetails = availableColorThemes.find(t => t.name === colorTheme);

    if (!currentSelectedCustomThemeDetails || currentSelectedCustomThemeDetails.mode !== actualResolvedMode) {
      // The current `colorTheme` state is incompatible, revert to default for the active mode
      const newDefaultForMode = actualResolvedMode === 'dark' ? DEFAULT_DARK_THEME_NAME : DEFAULT_LIGHT_THEME_NAME;
      
      // Only update if it's actually different to avoid loops
      if (colorTheme !== newDefaultForMode) {
        _setColorTheme(newDefaultForMode);
        applyCustomThemeClass(newDefaultForMode);
        localStorage.setItem(COLOR_THEME_STORAGE_KEY, newDefaultForMode);
      }
    }
  }, [mounted, actualResolvedMode, colorTheme, applyCustomThemeClass]);


  const setColorTheme = useCallback((newThemeName: ThemeName) => {
    if (!mounted || !actualResolvedMode) return;
    
    const themeDetails = availableColorThemes.find(t => t.name === newThemeName);

    if (themeDetails && themeDetails.mode === actualResolvedMode) {
      _setColorTheme(newThemeName);
      applyCustomThemeClass(newThemeName);
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, newThemeName);
    } else {
      console.warn(`Attempted to set theme ${newThemeName} which is incompatible with current mode ${actualResolvedMode}. Reverting to default for mode.`);
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
