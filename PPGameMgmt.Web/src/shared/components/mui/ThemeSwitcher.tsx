import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Divider,
  useTheme
} from '@mui/material';
import {
  Palette as PaletteIcon,
  DarkMode as DarkModeIcon,
  LightMode as LightModeIcon,
  Circle as CircleIcon
} from '@mui/icons-material';
import { useThemeContext } from '../../../core/theme/ThemeContext';
import { ThemeName, themes } from '../../../core/theme/themeConfig';

interface ThemeSwitcherProps {
  showIcon?: boolean;
  showTooltip?: boolean;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  showIcon = true,
  showTooltip = true,
}) => {
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  let themeContext;
  let themeName;
  let setTheme;
  let toggleMode;

  try {
    // Try to get the theme context, but don't fail if it's not available
    themeContext = useThemeContext();
    themeName = themeContext.themeName;
    setTheme = themeContext.setTheme;
    toggleMode = themeContext.toggleMode;
  } catch (error) {
    // If theme context is not available, provide fallback functions
    themeName = 'default';
    setTheme = () => console.warn('Theme context not available');
    toggleMode = () => console.warn('Theme context not available');
  }

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleThemeChange = (name: ThemeName) => {
    setTheme(name);
    handleClose();
  };

  const handleModeToggle = () => {
    toggleMode();
    handleClose();
  };

  const isDarkMode = theme.palette.mode === 'dark';

  return (
    <Box>
      <Tooltip title={showTooltip ? "Change theme" : ""}>
        <IconButton
          onClick={handleClick}
          size="small"
          aria-controls={open ? 'theme-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          color="inherit"
        >
          {showIcon && <PaletteIcon />}
        </IconButton>
      </Tooltip>
      <Menu
        id="theme-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'theme-button',
        }}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 180,
            borderRadius: 2,
            overflow: 'visible',
            mt: 1.5,
          },
        }}
      >
        <MenuItem onClick={handleModeToggle}>
          <ListItemIcon>
            {isDarkMode ? <LightModeIcon fontSize="small" /> : <DarkModeIcon fontSize="small" />}
          </ListItemIcon>
          <ListItemText>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</ListItemText>
        </MenuItem>
        <Divider />
        {Object.entries(themes || {})
          .filter(([key]) => key !== 'dark' || !isDarkMode)
          .map(([key, themeOption]) => (
            <MenuItem
              key={key}
              onClick={() => handleThemeChange(key as ThemeName)}
              selected={key === themeName}
              sx={{
                '&.Mui-selected': {
                  backgroundColor: theme.palette.action.selected,
                },
              }}
            >
              <ListItemIcon>
                <CircleIcon
                  fontSize="small"
                  sx={{ color: themeOption?.palette?.primary?.main || theme.palette.primary.main }}
                />
              </ListItemIcon>
              <ListItemText>{key.charAt(0).toUpperCase() + key.slice(1)}</ListItemText>
            </MenuItem>
          ))}
      </Menu>
    </Box>
  );
};

export default ThemeSwitcher;
