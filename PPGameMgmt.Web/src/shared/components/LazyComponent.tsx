import React, { Suspense } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  minDelay?: number; // Minimum delay before showing the content (prevents flashing)
}

/**
 * A wrapper component for React.Suspense with a customizable fallback
 * 
 * Use this component to wrap lazily loaded components to provide a consistent
 * loading experience throughout the application.
 * 
 * @example
 * const LazyComponent = React.lazy(() => import('./Component'));
 * 
 * // In your render method:
 * <LazyLoad fallback={<CustomLoadingIndicator />}>
 *   <LazyComponent />
 * </LazyLoad>
 */
export function LazyLoad({ children, fallback, minDelay = 0 }: LazyLoadProps) {
  return (
    <Suspense fallback={fallback || <DefaultLoadingFallback />}>
      {minDelay > 0 ? (
        <MinimumLoadTime delay={minDelay}>{children}</MinimumLoadTime>
      ) : (
        children
      )}
    </Suspense>
  );
}

/**
 * Default loading indicator if no fallback is provided
 */
function DefaultLoadingFallback() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-t-2 border-primary"></div>
    </div>
  );
}

/**
 * Wrapper that ensures content isn't shown until a minimum delay has passed
 * This prevents loading flashes for fast connections
 */
function MinimumLoadTime({ 
  children, 
  delay 
}: { 
  children: React.ReactNode; 
  delay: number 
}) {
  const [ready, setReady] = React.useState(false);
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setReady(true);
    }, delay);
    
    return () => clearTimeout(timer);
  }, [delay]);
  
  return ready ? <>{children}</> : <DefaultLoadingFallback />;
}

/**
 * Creates a lazily loaded component with standardized loading behavior
 * 
 * @example
 * const GameDetailsPanel = createLazyComponent(() => 
 *   import('../components/GameDetailsPanel')
 * );
 * 
 * // Then in your render method, just use it as a normal component:
 * <GameDetailsPanel gameId={gameId} />
 */
export function createLazyComponent<T extends React.ComponentType<any>>(
  factory: () => Promise<{ default: T }>,
  fallback?: React.ReactNode,
  minDelay?: number
) {
  const LazyComponent = React.lazy(factory);
  
  // Return a component that wraps the lazy component with our LazyLoad
  return (props: React.ComponentProps<T>) => (
    <LazyLoad fallback={fallback} minDelay={minDelay}>
      <LazyComponent {...props} />
    </LazyLoad>
  );
}