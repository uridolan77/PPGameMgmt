/**
 * A virtualized list component for efficiently rendering large data sets
 */
import React, { useRef, useEffect, useState } from 'react';
import { VirtualizedListProps } from '../../../types/componentTypes';
import { LoadingIndicator } from '../feedback/LoadingIndicator';
import { ErrorDisplay } from '../feedback/ErrorDisplay';
import { EmptyState } from '../feedback/EmptyState';

export function VirtualizedList<T>({
  data,
  isLoading = false,
  error,
  renderItem,
  itemHeight,
  height,
  width = '100%',
  overscanCount = 5,
  emptyState,
  loadingState,
  errorState,
  className = '',
}: VirtualizedListProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);
  
  // Handle scroll event
  const handleScroll = () => {
    if (containerRef.current) {
      setScrollTop(containerRef.current.scrollTop);
    }
  };
  
  // Add scroll event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);
  
  // Show loading state
  if (isLoading) {
    if (loadingState) {
      return <>{loadingState}</>;
    }
    
    return <LoadingIndicator />;
  }
  
  // Show error state
  if (error) {
    if (errorState) {
      return <>{errorState}</>;
    }
    
    return (
      <ErrorDisplay 
        error={error} 
        context="data" 
      />
    );
  }
  
  // Show empty state
  if (!data || data.length === 0) {
    if (emptyState) {
      return <>{emptyState}</>;
    }
    
    return (
      <EmptyState 
        title="No data found" 
        description="There are no items to display." 
      />
    );
  }
  
  // Calculate visible items
  const totalHeight = data.length * itemHeight;
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscanCount);
  const endIndex = Math.min(
    data.length - 1,
    Math.floor((scrollTop + height) / itemHeight) + overscanCount
  );
  
  // Render visible items
  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    const item = data[i];
    const style = {
      position: 'absolute',
      top: i * itemHeight,
      left: 0,
      right: 0,
      height: itemHeight,
    } as React.CSSProperties;
    
    visibleItems.push(renderItem(item, i, style));
  }
  
  return (
    <div
      ref={containerRef}
      style={{
        height,
        width,
        overflow: 'auto',
        position: 'relative',
      }}
      className={className}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems}
      </div>
    </div>
  );
}

export default VirtualizedList;
