/**
 * Development utilities for the application
 * These utilities are only active in development mode
 */

export { useRenderTracker } from './renderTracker';

/**
 * Log a performance measurement
 * Only active in development mode
 */
export function logPerformance(label: string, callback: () => void): void {
  if (process.env.NODE_ENV !== 'development') {
    callback();
    return;
  }
  
  console.time(label);
  callback();
  console.timeEnd(label);
}

/**
 * Log a debug message
 * Only active in development mode
 */
export function debug(message: string, ...args: any[]): void {
  if (process.env.NODE_ENV !== 'development') {
    return;
  }
  
  console.log(`[DEBUG] ${message}`, ...args);
}

/**
 * Create a development-only component wrapper
 * Only renders children in development mode
 */
export function DevOnly({ children }: { children: React.ReactNode }): React.ReactNode | null {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }
  
  return children;
}
