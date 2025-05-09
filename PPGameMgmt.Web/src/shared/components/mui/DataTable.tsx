import React, { useState } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Paper,
  CircularProgress,
  Typography,
  Button,
  SxProps,
  Theme,
  useTheme
} from '@mui/material';
import { useThemeContext } from '../../../core/theme/ThemeContext';

export interface Column<T> {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
  format?: (value: any, row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyMessage?: string;
  onRowClick?: (row: T) => void;
  onRetry?: () => void;
  getRowId?: (row: T) => string | number;
  pagination?: boolean;
  initialRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  sx?: SxProps<Theme>;
  paperSx?: SxProps<Theme>;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  emptyComponent?: React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage = 'Error loading data',
  emptyMessage = 'No data found',
  onRowClick,
  onRetry,
  getRowId = (row: any) => row.id,
  pagination = true,
  initialRowsPerPage = 10,
  rowsPerPageOptions = [5, 10, 25, 50],
  sx,
  paperSx,
  loadingComponent,
  errorComponent,
  emptyComponent
}: DataTableProps<T>) {
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
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Apply theme-specific styling
  const paperStyle = {
    width: '100%',
    overflow: 'hidden',
    borderRadius: `${currentTheme.borderRadius}px`,
    ...paperSx
  };

  const tableRowStyle = {
    cursor: onRowClick ? 'pointer' : 'default',
    '&:last-child td, &:last-child th': { border: 0 },
    '&:hover': {
      backgroundColor: theme.palette.action.hover
    }
  };

  const tableHeadStyle = {
    '& .MuiTableCell-head': {
      fontWeight: 'bold',
      backgroundColor: theme.palette.mode === 'dark'
        ? theme.palette.grey[800]
        : theme.palette.grey[100],
      fontFamily: currentTheme.fontFamily
    }
  };

  // Ensure data is an array
  const safeData = Array.isArray(data) ? data : [];

  // Display states
  if (isLoading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (isError) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', gap: 2 }}>
        <Typography color="error">{errorMessage}</Typography>
        {onRetry && (
          <Button
            variant="contained"
            color="primary"
            onClick={onRetry}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        )}
      </Box>
    );
  }

  if (!Array.isArray(data)) {
    console.error('DataTable received non-array data:', data);
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', height: '300px', gap: 2 }}>
        <Typography color="error">Invalid data format</Typography>
        {onRetry && (
          <Button
            variant="contained"
            color="primary"
            onClick={onRetry}
            sx={{ mt: 2 }}
          >
            Retry
          </Button>
        )}
      </Box>
    );
  }

  if (safeData.length === 0) {
    if (emptyComponent) {
      return <>{emptyComponent}</>;
    }
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Box>
    );
  }

  // Pagination logic
  const paginatedData = pagination
    ? safeData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : safeData;

  return (
    <Paper sx={paperStyle}>
      <TableContainer sx={sx}>
        <Table stickyHeader aria-label="data table">
          <TableHead sx={tableHeadStyle}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.map((row) => (
              <TableRow
                hover
                key={getRowId(row)}
                onClick={() => onRowClick && onRowClick(row)}
                sx={tableRowStyle}
              >
                {columns.map((column) => {
                  const value = (row as any)[column.id];
                  return (
                    <TableCell
                      key={column.id}
                      align={column.align || 'left'}
                      sx={{ fontFamily: currentTheme.fontFamily }}
                    >
                      {column.format ? column.format(value, row) : value}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && (
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions}
          component="div"
          count={safeData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          sx={{ fontFamily: currentTheme.fontFamily }}
        />
      )}
    </Paper>
  );
}

export default DataTable;
