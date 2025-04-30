/**
 * Virtualized List Component
 * 
 * Uses react-window for efficiently rendering large lists by only
 * rendering items that are visible in the viewport.
 */
import React from 'react';
import { FixedSizeList, VariableSizeList } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';

interface FixedVirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  itemHeight: number;
  height?: number | string;
  width?: number | string;
  className?: string;
  overscanCount?: number;
}

interface VariableSizedVirtualizedListProps<T> extends Omit<FixedVirtualizedListProps<T>, 'itemHeight'> {
  getItemHeight: (index: number) => number;
}

/**
 * Fixed Size Virtualized List - for lists where all items have the same height
 */
export function FixedVirtualizedList<T>({ 
  items, 
  renderItem, 
  itemHeight = 80,
  height = '100%',
  width = '100%',
  className = '',
  overscanCount = 5
}: FixedVirtualizedListProps<T>) {
  const innerElementType = React.forwardRef<HTMLDivElement>(
    ({ style, ...rest }, ref) => (
      <div
        ref={ref}
        style={{
          ...style,
          position: 'relative',
          width: '100%',
          height: `${items.length * itemHeight}px`
        }}
        {...rest}
      />
    )
  );

  return (
    <div style={{ height, width }} className={className}>
      <AutoSizer>
        {({ height: autoHeight, width: autoWidth }) => (
          <FixedSizeList
            height={autoHeight}
            width={autoWidth}
            itemCount={items.length}
            itemSize={itemHeight}
            overscanCount={overscanCount}
            innerElementType={innerElementType}
          >
            {({ index, style }) => (
              <div style={style}>
                {renderItem(items[index], index)}
              </div>
            )}
          </FixedSizeList>
        )}
      </AutoSizer>
    </div>
  );
}

/**
 * Variable Size Virtualized List - for lists where items have different heights
 */
export function VariableSizeVirtualizedList<T>({
  items, 
  renderItem, 
  getItemHeight,
  height = '100%',
  width = '100%',
  className = '',
  overscanCount = 5
}: VariableSizedVirtualizedListProps<T>) {
  return (
    <div style={{ height, width }} className={className}>
      <AutoSizer>
        {({ height: autoHeight, width: autoWidth }) => (
          <VariableSizeList
            height={autoHeight}
            width={autoWidth}
            itemCount={items.length}
            itemSize={getItemHeight}
            overscanCount={overscanCount}
          >
            {({ index, style }) => (
              <div style={style}>
                {renderItem(items[index], index)}
              </div>
            )}
          </VariableSizeList>
        )}
      </AutoSizer>
    </div>
  );
}