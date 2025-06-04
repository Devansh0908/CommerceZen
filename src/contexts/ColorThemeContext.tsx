
"use client";

import type React from 'react';
import { createContext, useContext, useState, useEffect, useCallback }
from 'react';

export type ThemeName = 
  'theme-default' | 
  'theme-oceanic' | 
  'theme-forest' | 
  'theme-crimson' |
  'theme-sunset' |
  'theme-minty' |
  'theme-ruby' |
  'theme-sepia' |
  'theme-cyberpunk'; // Added new theme

interface ColorTheme {
  name: ThemeName;
  displayName: string;
}

export const availableColorThemes: ColorTheme[] = [
  { name: 'theme-default', displayName: 'Default Zen' },
  { name: 'theme-oceanic', displayName: 'Oceanic Bliss' },
  { name: 'theme-forest', displayName: 'Forest Harmony' },
  { name: 'theme-crimson', displayName: 'Crimson Royal' },
  { name: 'theme-sunset', displayName: 'Sunset Glow' },
  { name: 'theme-minty', displayName: 'Minty Fresh' },
  { name: 'theme-ruby', displayName: 'Ruby Radiance' },
  { name: 'theme-sepia', displayName: 'Vintage Sepia' },
  { name: 'theme-cyberpunk', displayName: 'Cyberpunk Neon' }, // Added new theme
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
      
      availableColorThemes.forEach(t => {
        document.documentElement.classList.remove(t.name);
      });

      if (storedTheme && availableColorThemes.some(t => t.name === storedTheme)) {
        _setColorTheme(storedTheme);
        document.documentElement.classList.add(storedTheme);
      } else {
        _setColorTheme('theme-default');
        document.documentElement.classList.add('theme-default'); 
      }
    } catch (error)
{
      console.error("Error loading color theme from localStorage", error);
      _setColorTheme('theme-default');
      availableColorThemes.forEach(t => {
        document.documentElement.classList.remove(t.name);
      });
      document.documentElement.classList.add('theme-default');
    }
  }, []); 

  const setColorTheme = useCallback((newThemeName: ThemeName) => {
    if (!mounted) return;
    
    availableColorThemes.forEach(t => {
      document.documentElement.classList.remove(t.name);
    });
    
    document.documentElement.classList.add(newThemeName);
    
    _setColorTheme(newThemeName); 
    localStorage.setItem(COLOR_THEME_STORAGE_KEY, newThemeName); 
  }, [mounted]);


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

