
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback }
from 'react';

export type ThemeName = 'theme-default' | 'theme-oceanic' | 'theme-forest' | 'theme-crimson';

interface ColorTheme {
  name: ThemeName;
  displayName: string;
}

export const availableColorThemes: ColorTheme[] = [
  { name: 'theme-default', displayName: 'Default Zen' },
  { name: 'theme-oceanic', displayName: 'Oceanic Bliss' },
  { name: 'theme-forest', displayName: 'Forest Harmony' },
  { name: 'theme-crimson', displayName: 'Crimson Royal' },
];

const COLOR_THEME_STORAGE_KEY = 'commercezen_color_theme';

interface ColorThemeContextType {
  colorTheme: ThemeName;
  setColorTheme: (themeName: ThemeName) => void;
  availableThemes: ColorTheme[];
}

const ColorThemeContext = createContext<ColorThemeContextType | undefined>(undefined);

export function ColorThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorTheme, _setColorTheme] = useState<ThemeName>('theme-default');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const storedTheme = localStorage.getItem(COLOR_THEME_STORAGE_KEY) as ThemeName | null;
      if (storedTheme && availableColorThemes.some(t => t.name === storedTheme)) {
        _setColorTheme(storedTheme);
        document.documentElement.className = document.documentElement.className.replace(/theme-\w+/g, '').trim();
        document.documentElement.classList.add(storedTheme);
      } else {
        // Apply default if nothing stored or invalid
        document.documentElement.classList.add('theme-default');
      }
    } catch (error) {
      console.error("Error loading color theme from localStorage", error);
      document.documentElement.classList.add('theme-default');
    }
  }, []);

  const setColorTheme = useCallback((themeName: ThemeName) => {
    if (!mounted) return;
    
    const currentThemeIsDark = document.documentElement.classList.contains('dark');

    // Remove any existing theme-class
    availableColorThemes.forEach(t => {
      document.documentElement.classList.remove(t.name);
    });
    
    // Add the new theme class
    document.documentElement.classList.add(themeName);
    
    // Re-apply .dark if it was there, as removing all theme classes might remove it too if it was part of a combined class
    // next-themes handles .dark separately, but good to be safe.
    // Or ensure next-themes adds its .dark class *after* our theme class manipulation.
    // Simpler: next-themes manages .dark, we manage theme-*.
    // So, we just need to set our theme class.

    _setColorTheme(themeName);
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, themeName);
  }, [mounted]);

  // Effect to apply theme class when colorTheme state changes (e.g., from initial load)
  useEffect(() => {
    if (mounted) {
      // Remove any existing theme-class
      availableColorThemes.forEach(t => {
        document.documentElement.classList.remove(t.name);
      });
      // Add the new theme class
      document.documentElement.classList.add(colorTheme);
    }
  }, [colorTheme, mounted]);


  const value = {
    colorTheme,
    setColorTheme,
    availableThemes: availableColorThemes,
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
