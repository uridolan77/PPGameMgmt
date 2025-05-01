import React from 'react';
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  SxProps,
  Theme,
  useTheme
} from '@mui/material';
import { Search, FilterList, FileDownload } from '@mui/icons-material';
import { useThemeContext } from '../../../core/theme/ThemeContext';

export interface SearchFilterBarProps {
  searchValue: string;
  onSearchChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  onFilter?: () => void;
  onExport?: (format: 'csv' | 'excel' | 'pdf') => void;
  showFilterButton?: boolean;
  showExportButton?: boolean;
  exportOptions?: ('csv' | 'excel' | 'pdf')[];
  sx?: SxProps<Theme>;
  children?: React.ReactNode;
}

export const SearchFilterBar: React.FC<SearchFilterBarProps> = ({
  searchValue,
  onSearchChange,
  searchPlaceholder = 'Search...',
  onFilter,
  onExport,
  showFilterButton = true,
  showExportButton = true,
  exportOptions = ['csv'],
  sx,
  children
}) => {
  const theme = useTheme();
  let currentTheme;

  try {
    // Try to get the theme context, but don't fail if it's not available
    currentTheme = useThemeContext().currentTheme;
  } catch (error) {
    // Fallback to default values if theme context is not available
    currentTheme = {
      borderRadius: 4,
      fontFamily: theme.typography.fontFamily
    };
  }

  const handleExport = (format: 'csv' | 'excel' | 'pdf') => {
    if (onExport) {
      onExport(format);
    }
  };

  // Apply theme-specific styling
  const buttonStyle = {
    minWidth: '100px',
    borderRadius: `${currentTheme.borderRadius}px`,
    fontFamily: currentTheme.fontFamily
  };

  const textFieldStyle = {
    maxWidth: { sm: '400px' },
    '& .MuiOutlinedInput-root': {
      borderRadius: `${currentTheme.borderRadius}px`,
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        mb: 3,
        gap: 2,
        ...sx
      }}
    >
      <TextField
        placeholder={searchPlaceholder}
        variant="outlined"
        size="small"
        fullWidth
        sx={textFieldStyle}
        value={searchValue}
        onChange={onSearchChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search fontSize="small" color="action" />
            </InputAdornment>
          ),
        }}
      />
      <Box sx={{ display: 'flex', gap: 1 }}>
        {children}

        {showFilterButton && onFilter && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<FilterList />}
            onClick={onFilter}
            sx={buttonStyle}
          >
            Filter
          </Button>
        )}

        {showExportButton && onExport && (
          <Button
            variant="outlined"
            size="small"
            startIcon={<FileDownload />}
            onClick={() => handleExport(exportOptions[0])}
            sx={buttonStyle}
          >
            Export
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default SearchFilterBar;
