import { createTheme, responsiveFontSizes } from '@mui/material/styles';
import { PaletteMode } from '@mui/material';
import themeConfig from './theme';

/**
 * Create a Material-UI theme using our design tokens
 * This ensures consistency between MUI components and our custom components
 */
export const createAppTheme = (mode: PaletteMode = 'light') => {
  // Convert HSL values to RGB for MUI
  const getColor = (cssVar: string) => {
    // For simplicity, we'll use a placeholder conversion here
    // In a real app, you'd want to properly convert HSL to RGB
    return mode === 'light' 
      ? {
          // Light mode colors
          primary: {
            main: '#3b82f6', // Blue
            light: '#60a5fa',
            dark: '#2563eb',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#f3f4f6', // Light Gray
            light: '#f9fafb',
            dark: '#e5e7eb',
            contrastText: '#1f2937',
          },
          error: {
            main: '#ef4444', // Red
            light: '#f87171',
            dark: '#dc2626',
            contrastText: '#ffffff',
          },
          warning: {
            main: '#f59e0b', // Amber
            light: '#fbbf24',
            dark: '#d97706',
            contrastText: '#ffffff',
          },
          info: {
            main: '#3b82f6', // Blue
            light: '#60a5fa',
            dark: '#2563eb',
            contrastText: '#ffffff',
          },
          success: {
            main: '#10b981', // Green
            light: '#34d399',
            dark: '#059669',
            contrastText: '#ffffff',
          },
          text: {
            primary: '#1f2937',
            secondary: '#6b7280',
            disabled: '#9ca3af',
          },
          background: {
            default: '#ffffff',
            paper: '#ffffff',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
        }
      : {
          // Dark mode colors
          primary: {
            main: '#60a5fa', // Blue
            light: '#93c5fd',
            dark: '#3b82f6',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#374151', // Dark Gray
            light: '#4b5563',
            dark: '#1f2937',
            contrastText: '#ffffff',
          },
          error: {
            main: '#f87171', // Red
            light: '#fca5a5',
            dark: '#ef4444',
            contrastText: '#ffffff',
          },
          warning: {
            main: '#fbbf24', // Amber
            light: '#fcd34d',
            dark: '#f59e0b',
            contrastText: '#ffffff',
          },
          info: {
            main: '#60a5fa', // Blue
            light: '#93c5fd',
            dark: '#3b82f6',
            contrastText: '#ffffff',
          },
          success: {
            main: '#34d399', // Green
            light: '#6ee7b7',
            dark: '#10b981',
            contrastText: '#ffffff',
          },
          text: {
            primary: '#f9fafb',
            secondary: '#e5e7eb',
            disabled: '#9ca3af',
          },
          background: {
            default: '#111827',
            paper: '#1f2937',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
        };
  };

  // Create the base theme
  let theme = createTheme({
    palette: {
      mode,
      ...getColor(''),
    },
    typography: {
      fontFamily: themeConfig.typography.fontFamily.sans.join(','),
      h1: {
        fontSize: themeConfig.typography.fontSize['4xl'],
        fontWeight: themeConfig.typography.fontWeight.bold,
        lineHeight: themeConfig.typography.lineHeight.tight,
      },
      h2: {
        fontSize: themeConfig.typography.fontSize['3xl'],
        fontWeight: themeConfig.typography.fontWeight.bold,
        lineHeight: themeConfig.typography.lineHeight.tight,
      },
      h3: {
        fontSize: themeConfig.typography.fontSize['2xl'],
        fontWeight: themeConfig.typography.fontWeight.semibold,
        lineHeight: themeConfig.typography.lineHeight.tight,
      },
      h4: {
        fontSize: themeConfig.typography.fontSize.xl,
        fontWeight: themeConfig.typography.fontWeight.semibold,
        lineHeight: themeConfig.typography.lineHeight.tight,
      },
      h5: {
        fontSize: themeConfig.typography.fontSize.lg,
        fontWeight: themeConfig.typography.fontWeight.semibold,
        lineHeight: themeConfig.typography.lineHeight.tight,
      },
      h6: {
        fontSize: themeConfig.typography.fontSize.base,
        fontWeight: themeConfig.typography.fontWeight.semibold,
        lineHeight: themeConfig.typography.lineHeight.tight,
      },
      subtitle1: {
        fontSize: themeConfig.typography.fontSize.lg,
        lineHeight: themeConfig.typography.lineHeight.normal,
      },
      subtitle2: {
        fontSize: themeConfig.typography.fontSize.base,
        lineHeight: themeConfig.typography.lineHeight.normal,
      },
      body1: {
        fontSize: themeConfig.typography.fontSize.base,
        lineHeight: themeConfig.typography.lineHeight.normal,
      },
      body2: {
        fontSize: themeConfig.typography.fontSize.sm,
        lineHeight: themeConfig.typography.lineHeight.normal,
      },
      button: {
        fontSize: themeConfig.typography.fontSize.sm,
        fontWeight: themeConfig.typography.fontWeight.medium,
        textTransform: 'none',
      },
      caption: {
        fontSize: themeConfig.typography.fontSize.xs,
        lineHeight: themeConfig.typography.lineHeight.normal,
      },
      overline: {
        fontSize: themeConfig.typography.fontSize.xs,
        fontWeight: themeConfig.typography.fontWeight.medium,
        lineHeight: themeConfig.typography.lineHeight.normal,
        textTransform: 'uppercase',
      },
    },
    shape: {
      borderRadius: parseInt(themeConfig.borderRadius.md),
    },
    shadows: [
      'none',
      themeConfig.shadows.sm,
      themeConfig.shadows.DEFAULT,
      themeConfig.shadows.md,
      themeConfig.shadows.md,
      themeConfig.shadows.md,
      themeConfig.shadows.lg,
      themeConfig.shadows.lg,
      themeConfig.shadows.lg,
      themeConfig.shadows.lg,
      themeConfig.shadows.xl,
      themeConfig.shadows.xl,
      themeConfig.shadows.xl,
      themeConfig.shadows.xl,
      themeConfig.shadows.xl,
      themeConfig.shadows['2xl'],
      themeConfig.shadows['2xl'],
      themeConfig.shadows['2xl'],
      themeConfig.shadows['2xl'],
      themeConfig.shadows['2xl'],
      themeConfig.shadows['2xl'],
      themeConfig.shadows['2xl'],
      themeConfig.shadows['2xl'],
      themeConfig.shadows['2xl'],
      themeConfig.shadows['2xl'],
    ],
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: themeConfig.borderRadius.md,
            textTransform: 'none',
            fontWeight: themeConfig.typography.fontWeight.medium,
            boxShadow: themeConfig.shadows.sm,
            '&:hover': {
              boxShadow: themeConfig.shadows.md,
            },
            transition: themeConfig.transitions.DEFAULT,
          },
          contained: {
            '&:hover': {
              transform: 'translateY(-1px)',
            },
            '&:active': {
              transform: 'translateY(1px)',
            },
          },
          containedPrimary: {
            background: 'linear-gradient(to right, #3b82f6, #2563eb)',
          },
          outlined: {
            borderWidth: '1px',
            '&:hover': {
              borderWidth: '1px',
            },
          },
          sizeLarge: {
            padding: '0.75rem 1.5rem',
            fontSize: themeConfig.typography.fontSize.base,
          },
          sizeMedium: {
            padding: '0.5rem 1rem',
          },
          sizeSmall: {
            padding: '0.25rem 0.75rem',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: themeConfig.borderRadius.md,
              transition: themeConfig.transitions.DEFAULT,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'light' ? '#3b82f6' : '#60a5fa',
              },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                borderColor: mode === 'light' ? '#3b82f6' : '#60a5fa',
                borderWidth: '2px',
              },
            },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: themeConfig.borderRadius.lg,
            boxShadow: themeConfig.shadows.md,
            overflow: 'hidden',
            transition: themeConfig.transitions.DEFAULT,
            '&:hover': {
              boxShadow: themeConfig.shadows.lg,
            },
          },
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: {
            padding: '1.25rem 1.5rem 0.75rem',
          },
          title: {
            fontSize: themeConfig.typography.fontSize.xl,
            fontWeight: themeConfig.typography.fontWeight.semibold,
          },
          subheader: {
            fontSize: themeConfig.typography.fontSize.sm,
            color: mode === 'light' ? '#6b7280' : '#d1d5db',
          },
        },
      },
      MuiCardContent: {
        styleOverrides: {
          root: {
            padding: '1.25rem 1.5rem',
            '&:last-child': {
              paddingBottom: '1.25rem',
            },
          },
        },
      },
      MuiCardActions: {
        styleOverrides: {
          root: {
            padding: '0.75rem 1.5rem 1.25rem',
            justifyContent: 'flex-end',
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: {
            borderRadius: themeConfig.borderRadius.md,
            boxShadow: themeConfig.shadows.sm,
          },
          standardSuccess: {
            backgroundColor: mode === 'light' ? '#ecfdf5' : '#064e3b',
            color: mode === 'light' ? '#065f46' : '#a7f3d0',
          },
          standardInfo: {
            backgroundColor: mode === 'light' ? '#eff6ff' : '#172554',
            color: mode === 'light' ? '#1e40af' : '#93c5fd',
          },
          standardWarning: {
            backgroundColor: mode === 'light' ? '#fffbeb' : '#78350f',
            color: mode === 'light' ? '#b45309' : '#fcd34d',
          },
          standardError: {
            backgroundColor: mode === 'light' ? '#fef2f2' : '#7f1d1d',
            color: mode === 'light' ? '#b91c1c' : '#fca5a5',
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontSize: themeConfig.typography.fontSize.sm,
            fontWeight: themeConfig.typography.fontWeight.medium,
            marginBottom: '0.375rem',
            color: mode === 'light' ? '#374151' : '#e5e7eb',
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: themeConfig.borderRadius.md,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? '#3b82f6' : '#60a5fa',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: mode === 'light' ? '#3b82f6' : '#60a5fa',
              borderWidth: '2px',
            },
            transition: themeConfig.transitions.DEFAULT,
          },
          input: {
            padding: '0.75rem 1rem',
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            padding: '0.75rem 1rem',
            borderBottom: `1px solid ${mode === 'light' ? '#e5e7eb' : '#374151'}`,
          },
          head: {
            fontWeight: themeConfig.typography.fontWeight.semibold,
            backgroundColor: mode === 'light' ? '#f9fafb' : '#1f2937',
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': {
              backgroundColor: mode === 'light' ? '#f3f4f6' : '#374151',
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
          elevation1: {
            boxShadow: themeConfig.shadows.sm,
          },
          elevation2: {
            boxShadow: themeConfig.shadows.DEFAULT,
          },
          elevation3: {
            boxShadow: themeConfig.shadows.md,
          },
          elevation4: {
            boxShadow: themeConfig.shadows.lg,
          },
          elevation8: {
            boxShadow: themeConfig.shadows.xl,
          },
          elevation16: {
            boxShadow: themeConfig.shadows['2xl'],
          },
          elevation24: {
            boxShadow: themeConfig.shadows['2xl'],
          },
        },
      },
    },
  });

  // Make typography responsive
  theme = responsiveFontSizes(theme);

  return theme;
};

export default createAppTheme;
