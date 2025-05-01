import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { themes, ThemeName, ThemeOptions } from './themeConfig';

// Define the theme context type
interface ThemeContextType {
  currentTheme: ThemeOptions;
  themeName: ThemeName;
  setTheme: (name: ThemeName) => void;
  toggleMode: () => void;
}

// Create the theme context
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// Theme provider props
interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeName;
}

// Create the theme provider component
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'default',
}) => {
  // Get the saved theme from localStorage or use the default
  const getSavedTheme = (): ThemeName => {
    const savedTheme = localStorage.getItem('theme');
    return (savedTheme as ThemeName) || defaultTheme;
  };

  // State for the current theme
  const [themeName, setThemeName] = useState<ThemeName>(getSavedTheme);
  const currentTheme = themes[themeName];

  // Create the MUI theme
  const muiTheme = createTheme({
    palette: {
      mode: currentTheme.mode,
      primary: currentTheme.palette.primary,
      secondary: currentTheme.palette.secondary,
      success: currentTheme.palette.success,
      warning: currentTheme.palette.warning,
      error: currentTheme.palette.error,
      info: currentTheme.palette.info,
      background: currentTheme.palette.background,
      text: currentTheme.palette.text,
    },
    typography: {
      fontFamily: currentTheme.fontFamily,
    },
    shape: {
      borderRadius: currentTheme.borderRadius,
    },
    components: {
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: currentTheme.borderRadius,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: currentTheme.borderRadius,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: currentTheme.borderRadius,
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: currentTheme.borderRadius * 0.5,
          },
        },
      },
    },
  });

  // Set the theme
  const setTheme = (name: ThemeName) => {
    setThemeName(name);
    localStorage.setItem('theme', name);
  };

  // Toggle between light and dark mode
  const toggleMode = () => {
    const newTheme = currentTheme.mode === 'light' ? 'dark' : 'default';
    setTheme(newTheme as ThemeName);
  };

  // Update the document body background color when the theme changes
  useEffect(() => {
    document.body.style.backgroundColor = currentTheme.palette.background.default;
  }, [currentTheme]);

  // Context value
  const contextValue: ThemeContextType = {
    currentTheme,
    themeName,
    setTheme,
    toggleMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      <MuiThemeProvider theme={muiTheme}>
        <CssBaseline />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useThemeContext = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;
