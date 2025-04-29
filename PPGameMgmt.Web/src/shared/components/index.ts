export * from './LoadingSpinner';

// Re-export specialized versions of components
export const FullPageLoader = () => import('./LoadingSpinner').then(
  ({ LoadingSpinner }) => ({ default: () => <LoadingSpinner fullPage />})
);