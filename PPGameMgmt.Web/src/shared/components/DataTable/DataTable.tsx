import React, { useState } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TablePagination, 
  TableRow, 
  TableSortLabel,
  TextField,
  InputAdornment,
  Paper
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

export interface Column<T> {
  id: string;
  label: string;
  renderCell?: (item: T) => React.ReactNode;
  sortable?: boolean;
  searchable?: boolean;
  align?: 'left' | 'right' | 'center';
  minWidth?: number;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  initialSortBy?: string;
  initialSortDirection?: 'asc' | 'desc';
  searchable?: boolean;
  pagination?: boolean;
  dense?: boolean;
  elevation?: number;
  stickyHeader?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  initialSortBy,
  initialSortDirection = 'asc',
  searchable = true,
  pagination = true,
  dense = false,
  elevation = 1,
  stickyHeader = false
}: DataTableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string | undefined>(initialSortBy);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(initialSortDirection);

  // Handle search
  const filteredData = searchTerm
    ? data.filter(item => 
        columns
          .filter(col => col.searchable !== false)
          .some(col => {
            const value = item[col.id as keyof T];
            return value != null && String(value).toLowerCase().includes(searchTerm.toLowerCase());
          })
      )
    : data;

  // Handle sorting
  const sortedData = sortBy
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortBy as keyof T];
        const bValue = b[sortBy as keyof T];
        
        if (aValue === bValue) return 0;
        
        // Handle undefined and null values
        if (aValue == null) return sortDirection === 'asc' ? -1 : 1;
        if (bValue == null) return sortDirection === 'asc' ? 1 : -1;
        
        const comparator = aValue > bValue ? 1 : -1;
        return sortDirection === 'asc' ? comparator : -comparator;
      })
    : filteredData;

  // Handle pagination
  const paginatedData = pagination
    ? sortedData.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : sortedData;

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSort = (columnId: string) => {
    const isAsc = sortBy === columnId && sortDirection === 'asc';
    setSortDirection(isAsc ? 'desc' : 'asc');
    setSortBy(columnId);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0); // Reset to first page when searching
  };

  return (
    <Paper elevation={elevation}>
      {searchable && (
        <Box sx={{ p: 2 }}>
          <TextField
            fullWidth
            placeholder="Search..."
            variant="outlined"
            size="small"
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      )}

      <TableContainer sx={{ maxHeight: stickyHeader ? 440 : undefined }}>
        <Table stickyHeader={stickyHeader} size={dense ? 'small' : 'medium'}>
          <TableHead>
            <TableRow>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ minWidth: column.minWidth }}
                >
                  {column.sortable !== false ? (
                    <TableSortLabel
                      active={sortBy === column.id}
                      direction={sortBy === column.id ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.id)}
                    >
                      {column.label}
                    </TableSortLabel>
                  ) : (
                    column.label
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((item) => (
                <TableRow
                  key={keyExtractor(item)}
                  hover={!!onRowClick}
                  onClick={() => onRowClick?.(item)}
                  sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                >
                  {columns.map((column) => (
                    <TableCell key={column.id} align={column.align || 'left'}>
                      {column.renderCell 
                        ? column.renderCell(item) 
                        : item[column.id as keyof T] !== undefined 
                          ? String(item[column.id as keyof T])
                          : ''}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} align="center">
                  No data to display
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {pagination && filteredData.length > 0 && (
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={filteredData.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      )}
    </Paper>
  );
}