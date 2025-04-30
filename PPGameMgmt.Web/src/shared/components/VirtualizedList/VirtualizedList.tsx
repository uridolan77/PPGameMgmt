import React, { useEffect, useRef, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

export interface VirtualizedListProps<T> {
  /**
   * The data items to render
   */
  items: T[];
  
  /**
   * Function to render each item
   */
  renderItem: (item: T, index: number) => React.ReactNode;
  
  /**
   * Estimated height of each item in pixels
   */
  estimateSize?: number;
  
  /**
   * Optional class name for the container
   */
  className?: string;
  
  /**
   * Optional height for the container (default: 400px)
   */
  height?: number | string;
  
  /**
   * Optional width for the container (default: 100%)
   */
  width?: number | string;
  
  /**
   * Number of items to render outside of the visible area (default: 5)
   */
  overscan?: number;
  
  /**
   * Optional key extractor function
   */
  getItemKey?: (item: T, index: number) => string | number;
  
  /**
   * Optional loading state
   */
  isLoading?: boolean;
  
  /**
   * Optional empty state
   */
  isEmpty?: boolean;
  
  /**
   * Optional loading component
   */
  loadingComponent?: React.ReactNode;
  
  /**
   * Optional empty component
   */
  emptyComponent?: React.ReactNode;
}

/**
 * A virtualized list component that efficiently renders large lists
 * by only rendering items that are visible in the viewport.
 */
export function VirtualizedList<T>({
  items,
  renderItem,
  estimateSize = 50,
  className = '',
  height = 400,
  width = '100%',
  overscan = 5,
  getItemKey,
  isLoading = false,
  isEmpty = false,
  loadingComponent = <div className="p-4 text-center">Loading...</div>,
  emptyComponent = <div className="p-4 text-center">No items found</div>,
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [measureParentSize, setMeasureParentSize] = useState(false);
  
  // Initialize the virtualizer
  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => estimateSize,
    overscan,
    getItemKey: getItemKey,
  });
  
  // Measure parent size after initial render
  useEffect(() => {
    setMeasureParentSize(true);
  }, []);
  
  // Handle loading and empty states
  if (isLoading) {
    return <div className={className}>{loadingComponent}</div>;
  }
  
  if (isEmpty || items.length === 0) {
    return <div className={className}>{emptyComponent}</div>;
  }
  
  return (
    <div
      ref={parentRef}
      className={`overflow-auto ${className}`}
      style={{
        height,
        width,
      }}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => (
          <div
            key={virtualItem.key}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualItem.size}px`,
              transform: `translateY(${virtualItem.start}px)`,
            }}
          >
            {renderItem(items[virtualItem.index], virtualItem.index)}
          </div>
        ))}
      </div>
    </div>
  );
}

export default VirtualizedList;
