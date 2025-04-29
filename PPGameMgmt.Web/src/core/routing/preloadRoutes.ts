/**
 * Utilities for preloading routes based on user navigation patterns
 */

// Track the routes that should be preloaded
let preloadableComponents: Map<string, () => Promise<any>> = new Map();

// Register a component for preloading
export function registerPreloadable(name: string, importFn: () => Promise<any>) {
  preloadableComponents.set(name, importFn);
}

// Manually trigger a preload of a component
export function preload(name: string): Promise<any> | undefined {
  const loadFn = preloadableComponents.get(name);
  if (loadFn) {
    return loadFn();
  }
  return undefined;
}

/**
 * Preload common route components when:
 * 1. Browser is idle (requestIdleCallback)
 * 2. User has been idle for a while (no interaction for X seconds)
 * 3. When hovering over a link
 */

// Preload routes during browser idle time
export function preloadOnIdle(priority: boolean = false) {
  // Use requestIdleCallback in modern browsers, fallback to setTimeout
  const scheduler = (window as any).requestIdleCallback || 
    ((cb: Function) => setTimeout(cb, 1000));
  
  const priorityTimeout = priority ? 1000 : 5000;
  
  scheduler(
    () => {
      // Get the keys in priority order
      const routes = Array.from(preloadableComponents.keys());
      
      // Start loading each component with a small delay between each
      routes.forEach((route, index) => {
        setTimeout(() => {
          preload(route);
        }, index * 300); // Stagger preloads to not block the main thread
      });
    },
    { timeout: priorityTimeout }
  );
}

// Track mouse hover over links to preload related routes
export function setupPreloadOnHover() {
  document.addEventListener('mouseover', (e) => {
    const target = e.target as HTMLElement;
    
    // Check if it's a link with data-preload attribute
    if (target.tagName === 'A' && target.hasAttribute('data-preload')) {
      const routeName = target.getAttribute('data-preload');
      if (routeName) {
        preload(routeName);
      }
    }
  });
}

// Preload routes when user is idle (no activity for a period)
let idleTimer: number;
export function setupPreloadOnUserIdle(idleTime: number = 5000) {
  // Reset timer on user interaction
  const resetTimer = () => {
    clearTimeout(idleTimer);
    idleTimer = window.setTimeout(() => {
      preloadOnIdle();
    }, idleTime);
  };
  
  // Listen for user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(
    event => document.addEventListener(event, resetTimer, { passive: true })
  );
  
  // Initial setup
  resetTimer();
}

// Initialize preloading setup
export function initializeRoutePreloading() {
  // Start with high-priority preload after initial render
  window.addEventListener('load', () => {
    // Wait a bit after load to not interfere with critical rendering
    setTimeout(() => {
      preloadOnIdle(true);
    }, 2000);
  });
  
  // Set up user idle tracking
  setupPreloadOnUserIdle();
  
  // Set up hover preloading
  setupPreloadOnHover();
}

export default {
  registerPreloadable,
  preload,
  preloadOnIdle,
  initializeRoutePreloading
};