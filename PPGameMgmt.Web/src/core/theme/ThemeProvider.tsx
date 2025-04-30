/**
 * Theme Provider Component
 *
 * Provides theme context for application-wide theme management
 * including light/dark mode and accent color customization.
 */
import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, PaletteMode } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import createAppTheme from './mui-theme';

// Available theme modes
type ThemeMode = 'light' | 'dark' | 'system';

// Available accent colors
type AccentColor = 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'slate';

// CSS color variables for each accent color
const accentColorVariables: Record<AccentColor, Record<string, string>> = {
  blue: {
    '--primary': 'hsl(221.2 83.2% 53.3%)',
    '--primary-foreground': 'hsl(210 40% 98%)',
    '--primary-600': 'hsl(221.2 83.2% 43.3%)',
    '--primary-200': 'hsl(221.2 83.2% 83.3%)',
  },
  green: {
    '--primary': 'hsl(142.1 76.2% 36.3%)',
    '--primary-foreground': 'hsl(355.7 100% 97.3%)',
    '--primary-600': 'hsl(142.1 76.2% 26.3%)',
    '--primary-200': 'hsl(142.1 76.2% 86.3%)',
  },
  purple: {
    '--primary': 'hsl(262.1 83.3% 57.8%)',
    '--primary-foreground': 'hsl(210 40% 98%)',
    '--primary-600': 'hsl(262.1 83.3% 47.8%)',
    '--primary-200': 'hsl(262.1 83.3% 87.8%)',
  },
  orange: {
    '--primary': 'hsl(24.6 95% 53.1%)',
    '--primary-foreground': 'hsl(60 9.1% 97.8%)',
    '--primary-600': 'hsl(24.6 95% 43.1%)',
    '--primary-200': 'hsl(24.6 95% 83.1%)',
  },
  red: {
    '--primary': 'hsl(0 72.2% 50.6%)',
    '--primary-foreground': 'hsl(60 9.1% 97.8%)',
    '--primary-600': 'hsl(0 72.2% 40.6%)',
    '--primary-200': 'hsl(0 72.2% 80.6%)',
  },
  slate: {
    '--primary': 'hsl(215.4 16.3% 46.9%)',
    '--primary-foreground': 'hsl(60 9.1% 97.8%)',
    '--primary-600': 'hsl(215.4 16.3% 36.9%)',
    '--primary-200': 'hsl(215.4 16.3% 76.9%)',
  }
};

// Interface for the theme context
interface ThemeContextType {
  // Current theme mode
  theme: ThemeMode;
  // Set the theme mode
  setTheme: (theme: ThemeMode) => void;
  // Current accent color
  accentColor: AccentColor;
  // Set the accent color
  setAccentColor: (color: AccentColor) => void;
  // Whether the current theme is dark
  isDarkMode: boolean;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultAccentColor?: AccentColor;
}

/**
 * Theme Provider Component
 *
 * Provides theme context for the application
 */
export function ThemeProvider({
  children,
  defaultTheme = 'system',
  defaultAccentColor = 'blue'
}: ThemeProviderProps) {
  // Get saved theme from localStorage or use default
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const savedTheme = localStorage.getItem('ui-theme') as ThemeMode | null;
    return savedTheme || defaultTheme;
  });

  // Get saved accent color from localStorage or use default
  const [accentColor, setAccentColorState] = useState<AccentColor>(() => {
    const savedAccentColor = localStorage.getItem('ui-accent-color') as AccentColor | null;
    return savedAccentColor || defaultAccentColor;
  });

  // Determine if the current theme is dark
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);

  // Effect to update theme when it changes
  useEffect(() => {
    const root = document.documentElement;

    // Remove all theme classes
    root.classList.remove('light', 'dark');

    // Handle system preference
    if (theme === 'system') {
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.add(systemPrefersDark ? 'dark' : 'light');
      setIsDarkMode(systemPrefersDark);
    } else {
      // Apply selected theme
      root.classList.add(theme);
      setIsDarkMode(theme === 'dark');
    }

    // Save to localStorage
    localStorage.setItem('ui-theme', theme);
  }, [theme]);

  // Effect to update accent color when it changes
  useEffect(() => {
    const root = document.documentElement;

    // Apply accent color CSS variables
    Object.entries(accentColorVariables[accentColor]).forEach(([variable, value]) => {
      root.style.setProperty(variable, value);
    });

    // Save to localStorage
    localStorage.setItem('ui-accent-color', accentColor);
  }, [accentColor]);

  // Effect to listen for system preference changes
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Initial check
    setIsDarkMode(mediaQuery.matches);

    // Update theme when system preference changes
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(e.matches ? 'dark' : 'light');
      setIsDarkMode(e.matches);
    };

    // Add event listener
    mediaQuery.addEventListener('change', handler);

    // Clean up
    return () => mediaQuery.removeEventListener('change', handler);
  }, [theme]);

  // Set theme helper function
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
  };

  // Set accent color helper function
  const setAccentColor = (newAccentColor: AccentColor) => {
    setAccentColorState(newAccentColor);
  };

  // Context value
  const contextValue: ThemeContextType = {
    theme,
    setTheme,
    accentColor,
    setAccentColor,
    isDarkMode
  };

  // Create MUI theme based on current mode
  const muiTheme = useMemo(() => {
    const mode: PaletteMode = isDarkMode ? 'dark' : 'light';
    return createAppTheme(mode);
  }, [isDarkMode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

/**
 * Hook to use the theme context
 */
export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }

  return context;
}

/**
 * Higher Order Component to add theme-switching functionality
 * to any component
 */
export function withTheme<P>(Component: React.ComponentType<P & ThemeContextType>) {
  return (props: P) => {
    const themeContext = useTheme();
    return <Component {...props} {...themeContext} />;
  };
}

/**
 * ThemeToggle component for easy theme switching
 */
export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    switch (theme) {
      case 'light':
        setTheme('dark');
        break;
      case 'dark':
        setTheme('system');
        break;
      case 'system':
        setTheme('light');
        break;
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      aria-label="Toggle theme"
    >
      {theme === 'light' && (
        <span className="block w-5 h-5">🌞</span>
      )}
      {theme === 'dark' && (
        <span className="block w-5 h-5">🌙</span>
      )}
      {theme === 'system' && (
        <span className="block w-5 h-5">⚙️</span>
      )}
    </button>
  );
}