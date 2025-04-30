/**
 * A standardized table component that uses the DataDisplay component
 */
import React, { useState } from 'react';
import { TableProps } from '../../../types/componentTypes';
import { DataDisplay } from './DataDisplay';
import { cn } from '../../../../core/theme';
import {
  Table as ShadcnTable,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';

export function Table<T>({
  data,
  isLoading = false,
  error,
  columns,
  caption,
  striped = false,
  hoverable = true,
  bordered = false,
  compact = false,
  onRowClick,
  onSelect,
  selectable = false,
  selectedItems = [],
  getItemId = (item: any) => item.id,
  emptyState,
  loadingState,
  errorState,
  className = '',
}: TableProps<T>) {
  const [selected, setSelected] = useState<T[]>(selectedItems);
  
  // Handle row selection
  const handleSelect = (item: T, isSelected: boolean) => {
    let newSelected: T[];
    
    if (isSelected) {
      newSelected = [...selected, item];
    } else {
      newSelected = selected.filter(
        (selectedItem) => getItemId(selectedItem) !== getItemId(item)
      );
    }
    
    setSelected(newSelected);
    
    if (onSelect) {
      onSelect(newSelected);
    }
  };
  
  // Handle select all
  const handleSelectAll = (isSelected: boolean) => {
    const newSelected = isSelected ? [...data] : [];
    setSelected(newSelected);
    
    if (onSelect) {
      onSelect(newSelected);
    }
  };
  
  // Check if an item is selected
  const isSelected = (item: T) => {
    return selected.some(
      (selectedItem) => getItemId(selectedItem) === getItemId(item)
    );
  };
  
  // Check if all items are selected
  const isAllSelected = data.length > 0 && selected.length === data.length;
  
  // Generate table row class names
  const getRowClassName = (item: T, index: number) => {
    return cn(
      striped && index % 2 === 0 && 'bg-muted/50',
      hoverable && 'hover:bg-muted/50',
      onRowClick && 'cursor-pointer',
      isSelected(item) && 'bg-primary/10',
    );
  };
  
  // Render a table row
  const renderRow = (item: T, index: number) => {
    return (
      <TableRow
        key={getItemId(item).toString()}
        className={getRowClassName(item, index)}
        onClick={() => {
          if (onRowClick) {
            onRowClick(item, index);
          }
        }}
      >
        {selectable && (
          <TableCell
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <Checkbox
              checked={isSelected(item)}
              onCheckedChange={(checked) => handleSelect(item, !!checked)}
            />
          </TableCell>
        )}
        
        {columns
          .filter((column) => column.visible !== false)
          .map((column) => (
            <TableCell
              key={column.id}
              className={column.className}
              style={{ width: column.width }}
            >
              {column.accessor(item)}
            </TableCell>
          ))}
      </TableRow>
    );
  };
  
  return (
    <DataDisplay
      data={data}
      isLoading={isLoading}
      error={error}
      renderItem={renderRow}
      emptyState={emptyState}
      loadingState={loadingState}
      errorState={errorState}
      className={className}
    >
      {(items) => (
        <div className="w-full overflow-auto">
          <ShadcnTable className={cn(
            bordered && 'border',
            compact && 'table-compact',
          )}>
            {caption && <TableCaption>{caption}</TableCaption>}
            
            <TableHeader>
              <TableRow>
                {selectable && (
                  <TableHead className="w-[40px]">
                    <Checkbox
                      checked={isAllSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                )}
                
                {columns
                  .filter((column) => column.visible !== false)
                  .map((column) => (
                    <TableHead
                      key={column.id}
                      className={column.className}
                      style={{ width: column.width }}
                    >
                      {column.header}
                    </TableHead>
                  ))}
              </TableRow>
            </TableHeader>
            
            <TableBody>
              {items.map((item, index) => renderRow(item, index))}
            </TableBody>
          </ShadcnTable>
        </div>
      )}
    </DataDisplay>
  );
}

export default Table;
