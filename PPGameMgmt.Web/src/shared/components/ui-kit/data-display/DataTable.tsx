import React, { ReactNode, useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowDown, ArrowUp, Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { LoadingState } from '../feedback/LoadingState';
import { EmptyState } from '../feedback/EmptyState';

export type ColumnDefinition<T> = {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => ReactNode;
  cell?: (props: { row: T; getValue: () => any }) => ReactNode;
  enableSorting?: boolean;
  enableFiltering?: boolean;
  className?: string;
  headerClassName?: string;
};

export type SortingState = {
  id: string;
  desc: boolean;
} | null;

export interface DataTableProps<T> {
  columns: ColumnDefinition<T>[];
  data: T[];
  isLoading?: boolean;
  error?: Error | unknown;
  onRetry?: () => void;
  emptyState?: {
    title: string;
    description?: string;
    action?: {
      label: string;
      onClick: () => void;
    }
  };
  defaultSorting?: SortingState;
  enableSorting?: boolean;
  enableSearch?: boolean;
  searchPlaceholder?: string;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  className?: string;
  tableClassName?: string;
  rowClassName?: string | ((row: T, index: number) => string);
  onRowClick?: (row: T) => void;
  highlightOnHover?: boolean;
  stickyHeader?: boolean;
  caption?: string;
  id?: string;
  searchBoxPosition?: 'top' | 'bottom';
  extraHeaderContent?: ReactNode;
  renderRowSubComponent?: (row: T, index: number) => ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  isLoading = false,
  error,
  onRetry,
  emptyState = {
    title: 'No data available',
    description: 'Try changing your filters or adding new data',
  },
  defaultSorting = null,
  enableSorting = true,
  enableSearch = false,
  searchPlaceholder = 'Search...',
  onSearch,
  searchTerm: externalSearchTerm,
  className,
  tableClassName,
  rowClassName,
  onRowClick,
  highlightOnHover = true,
  stickyHeader = false,
  caption,
  id,
  searchBoxPosition = 'top',
  extraHeaderContent,
  renderRowSubComponent,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>(defaultSorting);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Use either controlled or uncontrolled search term
  const currentSearchTerm = externalSearchTerm ?? searchTerm;
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (onSearch) onSearch(value);
  };
  
  const clearSearch = () => {
    setSearchTerm('');
    if (onSearch) onSearch('');
  };

  const handleSort = (columnId: string) => {
    if (!enableSorting) return;
    
    setSorting(prev => {
      if (prev?.id === columnId) {
        // Toggle direction or clear if already desc
        return prev.desc ? null : { id: columnId, desc: true };
      }
      // New sort column, default to ascending
      return { id: columnId, desc: false };
    });
  };

  // Render loading state
  if (isLoading) {
    return <LoadingState variant="table" />;
  }

  // Render error state
  if (error) {
    return (
      <div className="border rounded-md p-6">
        <div className="text-center">
          <h3 className="text-lg font-medium text-red-500">Error loading data</h3>
          <p className="text-sm text-muted-foreground mt-1 mb-4">
            There was a problem fetching the data.
          </p>
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try again
            </Button>
          )}
        </div>
      </div>
    );
  }

  // Render empty state
  const isDataEmpty = !data || data.length === 0;
  
  const renderSearchBox = () => {
    if (!enableSearch) return null;
    
    return (
      <div className="relative w-full sm:w-auto">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder={searchPlaceholder}
          className="pl-10 pr-10 max-w-sm"
          value={currentSearchTerm}
          onChange={handleSearchChange}
        />
        {currentSearchTerm && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
            onClick={clearSearch}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Clear search</span>
          </Button>
        )}
      </div>
    );
  };

  return (
    <div className={cn("space-y-4", className)}>
      {(enableSearch && searchBoxPosition === 'top' || extraHeaderContent) && (
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
          {searchBoxPosition === 'top' && renderSearchBox()}
          {extraHeaderContent && <div>{extraHeaderContent}</div>}
        </div>
      )}
      
      <div className="rounded-md border overflow-hidden">
        <Table id={id} className={tableClassName}>
          {caption && <caption>{caption}</caption>}
          
          <TableHeader className={stickyHeader ? "sticky top-0 bg-background z-10" : ""}>
            <TableRow>
              {columns.map((column) => {
                const isSorted = sorting?.id === column.id;
                const isSortable = enableSorting && column.enableSorting !== false;
                
                return (
                  <TableHead
                    key={column.id}
                    className={cn(column.headerClassName, isSortable && "cursor-pointer select-none")}
                    onClick={isSortable ? () => handleSort(column.id) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {column.header}
                      {isSortable && isSorted && (
                        sorting.desc ? 
                          <ArrowDown className="ml-1 h-4 w-4" /> : 
                          <ArrowUp className="ml-1 h-4 w-4" />
                      )}
                    </div>
                  </TableHead>
                );
              })}
            </TableRow>
          </TableHeader>

          <TableBody>
            {isDataEmpty ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  <EmptyState
                    title={emptyState.title}
                    description={emptyState.description}
                    action={emptyState.action}
                    compact
                  />
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIndex) => {
                const getRowClassNames = typeof rowClassName === 'function' 
                  ? rowClassName(row, rowIndex)
                  : rowClassName || '';
                
                return (
                  <React.Fragment key={rowIndex}>
                    <TableRow 
                      className={cn(
                        getRowClassNames,
                        onRowClick && "cursor-pointer",
                        highlightOnHover && "hover:bg-muted/50",
                      )}
                      onClick={onRowClick ? () => onRowClick(row) : undefined}
                    >
                      {columns.map((column) => {
                        // Get cell value either via accessor function, key, or custom cell renderer
                        let value;
                        
                        if (column.accessorFn) {
                          value = column.accessorFn(row);
                        } else if (column.accessorKey) {
                          value = row[column.accessorKey];
                        }
                        
                        return (
                          <TableCell key={column.id} className={column.className}>
                            {column.cell 
                              ? column.cell({ row, getValue: () => value })
                              : value as ReactNode}
                          </TableCell>
                        );
                      })}
                    </TableRow>
                    {renderRowSubComponent && (
                      <TableRow className="bg-muted/30 border-t-0">
                        <TableCell colSpan={columns.length} className="p-2">
                          {renderRowSubComponent(row, rowIndex)}
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      
      {enableSearch && searchBoxPosition === 'bottom' && (
        <div className="flex justify-start mt-4">
          {renderSearchBox()}
        </div>
      )}
    </div>
  );
}