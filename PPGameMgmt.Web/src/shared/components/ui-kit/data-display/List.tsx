/**
 * A standardized list component that uses the DataDisplay component
 */
import React from 'react';
import { ListProps } from '../../../types/componentTypes';
import { DataDisplay } from './DataDisplay';
import { cn } from '../../../../core/theme';
import { Separator } from '@/components/ui/separator';

export function List<T>({
  data,
  isLoading = false,
  error,
  renderItem,
  layout = 'vertical',
  divided = false,
  onItemClick,
  emptyState,
  loadingState,
  errorState,
  className = '',
}: ListProps<T>) {
  // Generate list class names
  const listClassName = cn(
    layout === 'horizontal' ? 'flex flex-row' : 'flex flex-col',
    className
  );
  
  // Render a list item
  const renderListItem = (item: T, index: number) => {
    const isLast = index === data.length - 1;
    const itemContent = renderItem(item, index);
    
    const itemClassName = cn(
      'list-item',
      layout === 'horizontal' && 'mr-4',
      layout === 'vertical' && 'mb-4',
      onItemClick && 'cursor-pointer'
    );
    
    const handleClick = () => {
      if (onItemClick) {
        onItemClick(item, index);
      }
    };
    
    return (
      <React.Fragment key={index}>
        <div
          className={itemClassName}
          onClick={handleClick}
        >
          {itemContent}
        </div>
        
        {divided && !isLast && (
          layout === 'vertical' ? (
            <Separator className="my-2" />
          ) : (
            <Separator orientation="vertical" className="mx-2 h-full" />
          )
        )}
      </React.Fragment>
    );
  };
  
  return (
    <DataDisplay
      data={data}
      isLoading={isLoading}
      error={error}
      renderItem={renderListItem}
      emptyState={emptyState}
      loadingState={loadingState}
      errorState={errorState}
      className={listClassName}
    />
  );
}

export default List;
