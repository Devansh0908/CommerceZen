
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes'; // Import useTheme from next-themes

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
  // Light Themes
  { name: 'light-theme-brighter-zen', displayName: 'Brighter Zen (Light)', mode: 'light' },
  { name: 'light-theme-oceanic-bliss', displayName: 'Oceanic Bliss (Light)', mode: 'light' },
  { name: 'light-theme-forest-harmony', displayName: 'Forest Harmony (Light)', mode: 'light' },
  { name: 'light-theme-crimson-royal', displayName: 'Crimson Royal (Light)', mode: 'light' },
  { name: 'light-theme-sunset-glow', displayName: 'Sunset Glow (Light)', mode: 'light' },
  { name: 'light-theme-minty-fresh', displayName: 'Minty Fresh (Light)', mode: 'light' },
  { name: 'light-theme-ruby-radiance', displayName: 'Ruby Radiance (Light)', mode: 'light' },
  { name: 'light-theme-vintage-sepia', displayName: 'Vintage Sepia (Light)', mode: 'light' },
  // Dark Themes
  { name: 'dark-theme-deep-indigo', displayName: 'Deep Indigo (Dark)', mode: 'dark' },
  { name: 'dark-theme-oceanic-depths', displayName: 'Oceanic Depths (Dark)', mode: 'dark' },
  { name: 'dark-theme-forest-canopy', displayName: 'Forest Canopy (Dark)', mode: 'dark' },
  { name: 'dark-theme-crimson-night', displayName: 'Crimson Night (Dark)', mode: 'dark' },
  { name: 'dark-theme-twilight-blaze', displayName: 'Twilight Blaze (Dark)', mode: 'dark' },
  { name: 'dark-theme-minty-umbra', displayName: 'Minty Umbra (Dark)', mode: 'dark' },
  { name: 'dark-theme-garnet-gloom', displayName: 'Garnet Gloom (Dark)', mode: 'dark' },
  { name: 'dark-theme-neon-pulse', displayName: 'Neon Pulse (Dark)', mode: 'dark' },
];

const COLOR_THEME_STORAGE_KEY = 'commercezen_color_theme_v2';
const DEFAULT_LIGHT_THEME: ThemeName = 'light-theme-brighter-zen';
const DEFAULT_DARK_THEME: ThemeName = 'dark-theme-deep-indigo';

interface ColorThemeContextType {
  colorTheme: ThemeName;
  setColorTheme: (themeName: ThemeName) => void;
  availableThemes: ColorTheme[]; // This will be all themes
  currentModeThemes: ColorTheme[]; // Themes filtered for current light/dark mode
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme(); // From next-themes
  const [colorTheme, _setColorTheme] = useState<ThemeName>(DEFAULT_LIGHT_THEME);
  const [currentModeThemes, setCurrentModeThemes] = useState<ColorTheme[]>([]);
  const [mounted, setMounted] = useState(false);

  const applyThemeClass = useCallback((themeName: ThemeName) => {
    availableColorThemes.forEach(t => {
      document.documentElement.classList.remove(t.name);
    });
    document.documentElement.classList.add(themeName);
  }, []);

  useEffect(() => {
    setMounted(true);
    if (!resolvedTheme) return; // Wait for next-themes to resolve

    try {
      const storedThemeName = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ThemeName | null;
      const storedTheme = availableColorThemes.find(t => t.name === storedThemeName);

      let themeToApply: ThemeName;

      if (storedTheme && storedTheme.mode === resolvedTheme) {
        themeToApply = storedTheme.name;
      } else {
        themeToApply = resolvedTheme === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
      }
      
      _setColorTheme(themeToApply);
      applyThemeClass(themeToApply);
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, themeToApply);

    } catch (error) {
      console.error("Error loading color theme from localStorage", error);
      const defaultThemeForMode = resolvedTheme === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
      _setColorTheme(defaultThemeForMode);
      applyThemeClass(defaultThemeForMode);
    }
  }, [resolvedTheme, applyThemeClass]);

  useEffect(() => {
    if (mounted && resolvedTheme) {
      setCurrentModeThemes(availableColorThemes.filter(t => t.mode === resolvedTheme));
      
      // Auto-switch to default theme if current colorTheme is not compatible with resolvedTheme
      const currentAppliedTheme = availableColorThemes.find(t => t.name === colorTheme);
      if (currentAppliedTheme && currentAppliedTheme.mode !== resolvedTheme) {
        const newDefaultTheme = resolvedTheme === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
        _setColorTheme(newDefaultTheme);
        applyThemeClass(newDefaultTheme);
        localStorage.setItem(COLOR_THEME_STORAGE_KEY, newDefaultTheme);
      }
    }
  }, [resolvedTheme, mounted, colorTheme, applyThemeClass]);


  const setColorTheme = useCallback((newThemeName: ThemeName) => {
    if (!mounted) return;
    
    const themeDetails = availableColorThemes.find(t => t.name === newThemeName);
    if (themeDetails && themeDetails.mode !== resolvedTheme) {
      // This case should ideally be prevented by the UI, but as a safeguard:
      console.warn(`Attempted to set theme ${newThemeName} which is for ${themeDetails.mode} mode, but current mode is ${resolvedTheme}.`);
      const fallbackTheme = resolvedTheme === 'dark' ? DEFAULT_DARK_THEME : DEFAULT_LIGHT_THEME;
       _setColorTheme(fallbackTheme);
      applyThemeClass(fallbackTheme);
      localStorage.setItem(COLOR_THEME_STORAGE_KEY, fallbackTheme);
      return;
    }

    applyThemeClass(newThemeName);
    _setColorTheme(newThemeName);
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, newThemeName);
  }, [mounted, resolvedTheme, applyThemeClass]);

  const value = {
    colorTheme,
    setColorTheme,
    availableThemes: availableColorThemes, // All themes
    currentModeThemes, // Themes filtered for the current light/dark mode
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
