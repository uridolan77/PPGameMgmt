import { useRef, useEffect, useDebugValue } from 'react';

interface RenderTrackerOptions {
  /**
   * Component name to display in debugging
   */
  name?: string;
  
  /**
   * Maximum number of renders to track before warning
   */
  warnAtRenders?: number;
  
  /**
   * Whether to track props changes that cause renders
   */
  trackProps?: boolean;
  
  /**
   * Whether to log each render
   */
  logEachRender?: boolean;
}

/**
 * A hook to track component renders for performance debugging
 * 
 * @example
 * ```tsx
 * const MyComponent = (props) => {
 *   useRenderTracker({ name: 'MyComponent', trackProps: true });
 *   return <div>...</div>
 * }
 * ```
 */
export function useRenderTracker({
  name = 'Component',
  warnAtRenders = 5,
  trackProps = false,
  logEachRender = false,
}: RenderTrackerOptions = {}) {
  const renderCount = useRef(0);
  const prevProps = useRef<any>(null);
  const mountTime = useRef(Date.now());
  
  // Update render count and check if it exceeds threshold
  useEffect(() => {
    renderCount.current += 1;
    
    if (logEachRender) {
      console.log(`[${name}] render #${renderCount.current}`);
    }
    
    if (renderCount.current >= warnAtRenders) {
      console.warn(
        `[${name}] High render count: ${renderCount.current} renders. ` +
        `Consider optimizing with React.memo, useMemo, or useCallback.`
      );
    }
    
    // Track first paint time on first render
    if (renderCount.current === 1) {
      const timeToRender = Date.now() - mountTime.current;
      console.log(`[${name}] First render took ${timeToRender}ms`);
    }
  });
  
  // Track prop changes if enabled
  useEffect(() => {
    if (trackProps && prevProps.current) {
      const currentProps = arguments[0] || {};
      const changedProps = Object.entries(currentProps).filter(
        ([key, value]) => prevProps.current[key] !== value
      );
      
      if (changedProps.length > 0) {
        console.log(`[${name}] Re-rendered due to changes in:`, 
          changedProps.map(([key]) => key)
        );
      }
      
      prevProps.current = { ...currentProps };
    } else if (trackProps) {
      prevProps.current = { ...arguments[0] };
    }
  });
  
  // Initialize on mount
  useEffect(() => {
    console.log(`[${name}] Mounted`);
    
    return () => {
      console.log(
        `[${name}] Unmounted after ${renderCount.current} renders in ${
          Math.round((Date.now() - mountTime.current) / 10) / 100
        }s`
      );
    };
  }, [name]);
  
  // Make render count visible in React DevTools
  useDebugValue(`Renders: ${renderCount.current}`);
  
  return renderCount.current;
}

/**
 * A hook that helps identify why a component is re-rendering
 */
export function useWhyDidYouUpdate(componentName: string, props: Record<string, any>) {
  // Store previous props
  const prevProps = useRef<Record<string, any>>({});
  
  useEffect(() => {
    if (prevProps.current) {
      // Get all keys from current and previous props
      const allKeys = Object.keys({ ...prevProps.current, ...props });
      const changesObj: Record<string, { from: any; to: any }> = {};
      
      // Find props that changed
      allKeys.forEach(key => {
        if (prevProps.current[key] !== props[key]) {
          changesObj[key] = {
            from: prevProps.current[key],
            to: props[key]
          };
        }
      });
      
      // Log if there were changes
      if (Object.keys(changesObj).length) {
        console.log('[why-did-you-update]', componentName, changesObj);
      }
    }
    
    // Update previous props
    prevProps.current = props;
  });
}

export default useRenderTracker;