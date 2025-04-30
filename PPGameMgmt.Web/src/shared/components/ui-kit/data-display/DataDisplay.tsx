/**
 * A generic data display component that handles loading, error, and empty states
 */
import React from 'react';
import { DataDisplayProps } from '../../../types/componentTypes';
import { LoadingIndicator } from '../feedback/LoadingIndicator';
import { ErrorDisplay } from '../feedback/ErrorDisplay';
import { EmptyState } from '../feedback/EmptyState';

export function DataDisplay<T>({
  data,
  isLoading = false,
  error,
  renderItem,
  emptyState,
  loadingState,
  errorState,
  className = '',
}: DataDisplayProps<T>) {
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
  
  // Render data
  return (
    <div className={className}>
      {data.map((item, index) => renderItem(item, index))}
    </div>
  );
}

export default DataDisplay;
