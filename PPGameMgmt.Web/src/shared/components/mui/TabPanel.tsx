import React from 'react';
import { Box, SxProps, Theme, useTheme } from '@mui/material';
import { useThemeContext } from '../../../core/theme/ThemeContext';

export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
  id?: string;
  sx?: SxProps<Theme>;
}

export const TabPanel: React.FC<TabPanelProps> = ({
  children,
  value,
  index,
  id = 'tabpanel',
  sx,
  ...other
}) => {
  const theme = useTheme();
  let currentTheme;

  try {
    // Try to get the theme context, but don't fail if it's not available
    currentTheme = useThemeContext().currentTheme;
  } catch (error) {
    // Fallback to default values if theme context is not available
    currentTheme = {
      fontFamily: theme.typography.fontFamily
    };
  }

  // Apply theme-specific styling
  const boxStyle = {
    ...sx,
    fontFamily: currentTheme.fontFamily,
    transition: theme.transitions.create('opacity', {
      duration: theme.transitions.duration.shorter,
    }),
  };

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`${id}-${index}`}
      aria-labelledby={`${id}-tab-${index}`}
      {...other}
      style={{
        paddingTop: '16px',
        transition: `all ${theme.transitions.duration.standard}ms ${theme.transitions.easing.easeInOut}`
      }}
    >
      {value === index && <Box sx={boxStyle}>{children}</Box>}
    </div>
  );
};

export default TabPanel;
