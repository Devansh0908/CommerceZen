
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
      
      // Always remove any existing theme-* classes first to ensure a clean slate
      availableColorThemes.forEach(t => {
        document.documentElement.classList.remove(t.name);
      });

      if (storedTheme && availableColorThemes.some(t => t.name === storedTheme)) {
        _setColorTheme(storedTheme);
        document.documentElement.classList.add(storedTheme);
      } else {
        _setColorTheme('theme-default');
        document.documentElement.classList.add('theme-default'); // Apply default if nothing stored or invalid
      }
    } catch (error) {
      console.error("Error loading color theme from localStorage", error);
      _setColorTheme('theme-default');
      // Ensure cleanup and default class on error
      availableColorThemes.forEach(t => {
        document.documentElement.classList.remove(t.name);
      });
      document.documentElement.classList.add('theme-default');
    }
  }, []); // Empty dependency array ensures this runs once on mount

  const setColorTheme = useCallback((newThemeName: ThemeName) => {
    if (!mounted) return;
    
    // Remove all known theme classes from <html>
    availableColorThemes.forEach(t => {
      document.documentElement.classList.remove(t.name);
    });
    
    // Add the newly selected theme class to <html>
    document.documentElement.classList.add(newThemeName);
    
    _setColorTheme(newThemeName); // Update React state
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, newThemeName); // Persist the choice
  }, [mounted]);

  // The useEffect that was previously here (listening to [colorTheme, mounted])
  // has been removed as its logic is now handled by the initial load useEffect
  // and the setColorTheme callback. This prevents potential conflicts.

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
