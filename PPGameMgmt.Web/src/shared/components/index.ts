import React from 'react';
export * from './LoadingSpinner';
export * from './LoadingIndicator';
export * from './OptimizedImage';

// Re-export specialized versions of components
export const FullPageLoader = () => import('./LoadingSpinner').then(
  (module) => ({ default: () => React.createElement(module.LoadingSpinner, { fullPage: true }) })
);