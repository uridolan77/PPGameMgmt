import { PaletteMode } from '@mui/material';

// Define the available themes
export type ThemeName = 'default' | 'blue' | 'green' | 'purple' | 'dark';

// Define the color palette for each theme
export interface ThemePalette {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  success: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  warning: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  error: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  info: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

// Define the theme options
export interface ThemeOptions {
  name: ThemeName;
  palette: ThemePalette;
  mode: PaletteMode;
  borderRadius: number;
  fontFamily: string;
}

// Default theme palette
const defaultPalette: ThemePalette = {
  primary: {
    main: '#1976d2',
    light: '#42a5f5',
    dark: '#1565c0',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
};

// Dark theme palette
const darkPalette: ThemePalette = {
  primary: {
    main: '#90caf9',
    light: '#e3f2fd',
    dark: '#42a5f5',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  secondary: {
    main: '#ce93d8',
    light: '#f3e5f5',
    dark: '#ab47bc',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  success: {
    main: '#66bb6a',
    light: '#e8f5e9',
    dark: '#388e3c',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  warning: {
    main: '#ffa726',
    light: '#fff3e0',
    dark: '#f57c00',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  error: {
    main: '#f44336',
    light: '#e57373',
    dark: '#d32f2f',
    contrastText: '#ffffff',
  },
  info: {
    main: '#29b6f6',
    light: '#4fc3f7',
    dark: '#0288d1',
    contrastText: 'rgba(0, 0, 0, 0.87)',
  },
  background: {
    default: '#121212',
    paper: '#1e1e1e',
  },
  text: {
    primary: '#ffffff',
    secondary: 'rgba(255, 255, 255, 0.7)',
    disabled: 'rgba(255, 255, 255, 0.5)',
  },
};

// Blue theme palette
const bluePalette: ThemePalette = {
  primary: {
    main: '#2196f3',
    light: '#64b5f6',
    dark: '#1976d2',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#1565c0',
    light: '#1e88e5',
    dark: '#0d47a1',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f5f8fa',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
};

// Green theme palette
const greenPalette: ThemePalette = {
  primary: {
    main: '#4caf50',
    light: '#81c784',
    dark: '#388e3c',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#2e7d32',
    light: '#43a047',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f1f8e9',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
};

// Purple theme palette
const purplePalette: ThemePalette = {
  primary: {
    main: '#9c27b0',
    light: '#ba68c8',
    dark: '#7b1fa2',
    contrastText: '#ffffff',
  },
  secondary: {
    main: '#673ab7',
    light: '#7e57c2',
    dark: '#512da8',
    contrastText: '#ffffff',
  },
  success: {
    main: '#2e7d32',
    light: '#4caf50',
    dark: '#1b5e20',
    contrastText: '#ffffff',
  },
  warning: {
    main: '#ed6c02',
    light: '#ff9800',
    dark: '#e65100',
    contrastText: '#ffffff',
  },
  error: {
    main: '#d32f2f',
    light: '#ef5350',
    dark: '#c62828',
    contrastText: '#ffffff',
  },
  info: {
    main: '#0288d1',
    light: '#03a9f4',
    dark: '#01579b',
    contrastText: '#ffffff',
  },
  background: {
    default: '#f3e5f5',
    paper: '#ffffff',
  },
  text: {
    primary: 'rgba(0, 0, 0, 0.87)',
    secondary: 'rgba(0, 0, 0, 0.6)',
    disabled: 'rgba(0, 0, 0, 0.38)',
  },
};

// Define the available themes
export const themes: Record<ThemeName, ThemeOptions> = {
  default: {
    name: 'default',
    palette: defaultPalette,
    mode: 'light',
    borderRadius: 4,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  blue: {
    name: 'blue',
    palette: bluePalette,
    mode: 'light',
    borderRadius: 8,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  green: {
    name: 'green',
    palette: greenPalette,
    mode: 'light',
    borderRadius: 8,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
  purple: {
    name: 'purple',
    palette: purplePalette,
    mode: 'light',
    borderRadius: 8,
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
  },
  dark: {
    name: 'dark',
    palette: darkPalette,
    mode: 'dark',
    borderRadius: 8,
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
};

export default themes;
