/**
 * A standardized grid component that uses the DataDisplay component
 */
import React from 'react';
import { GridProps } from '../../../types/componentTypes';
import { DataDisplay } from './DataDisplay';
import { cn } from '../../../../core/theme';

export function Grid<T>({
  data,
  isLoading = false,
  error,
  renderItem,
  columns = {
    xs: 1,
    sm: 2,
    md: 3,
    lg: 4,
    xl: 5,
  },
  gap = '1rem',
  onItemClick,
  emptyState,
  loadingState,
  errorState,
  className = '',
}: GridProps<T>) {
  // Generate grid class names
  const gridClassName = cn(
    'grid',
    columns.xs && `grid-cols-${columns.xs}`,
    columns.sm && `sm:grid-cols-${columns.sm}`,
    columns.md && `md:grid-cols-${columns.md}`,
    columns.lg && `lg:grid-cols-${columns.lg}`,
    columns.xl && `xl:grid-cols-${columns.xl}`,
    `gap-[${gap}]`,
    className
  );
  
  // Render a grid item
  const renderGridItem = (item: T, index: number) => {
    const itemContent = renderItem(item, index);
    
    if (onItemClick) {
      return (
        <div
          key={index}
          className="cursor-pointer"
          onClick={() => onItemClick(item, index)}
        >
          {itemContent}
        </div>
      );
    }
    
    return <div key={index}>{itemContent}</div>;
  };
  
  return (
    <DataDisplay
      data={data}
      isLoading={isLoading}
      error={error}
      renderItem={renderGridItem}
      emptyState={emptyState}
      loadingState={loadingState}
      errorState={errorState}
      className={gridClassName}
    />
  );
}

export default Grid;
