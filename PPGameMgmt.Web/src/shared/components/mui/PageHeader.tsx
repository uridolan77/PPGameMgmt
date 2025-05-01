import React from 'react';
import { Box, Typography, Button, SxProps, Theme, useTheme } from '@mui/material';
import { useThemeContext } from '../../../core/theme/ThemeContext';

export interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  sx?: SxProps<Theme>;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  actions,
  sx
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

  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography
            variant="h4"
            component="h1"
            gutterBottom
            fontWeight="bold"
            sx={{
              fontFamily: currentTheme.fontFamily,
              color: theme.palette.text.primary
            }}
          >
            {title}
          </Typography>
          {description && (
            <Typography
              variant="subtitle1"
              color="text.secondary"
              sx={{
                fontFamily: currentTheme.fontFamily
              }}
            >
              {description}
            </Typography>
          )}
        </Box>
        {actions && (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default PageHeader;
