import { QueryClient } from '@tanstack/react-query';

// Data categories for different caching strategies
export enum DataCategory {
  AUTH = 'auth',
  USER = 'user',
  GAME = 'game',
  PLAYER = 'player',
  BONUS = 'bonus',
  RECOMMENDATION = 'recommendation',
  DASHBOARD = 'dashboard',
  STATIC = 'static',
}

// Cache time configurations for different data types
export const cacheTimes = {
  [DataCategory.AUTH]: 0, // Don't cache authentication data
  [DataCategory.USER]: 5 * 60 * 1000, // 5 minutes
  [DataCategory.GAME]: 10 * 60 * 1000, // 10 minutes
  [DataCategory.PLAYER]: 5 * 60 * 1000, // 5 minutes
  [DataCategory.BONUS]: 10 * 60 * 1000, // 10 minutes
  [DataCategory.RECOMMENDATION]: 30 * 60 * 1000, // 30 minutes
  [DataCategory.DASHBOARD]: 2 * 60 * 1000, // 2 minutes
  [DataCategory.STATIC]: 24 * 60 * 60 * 1000, // 24 hours
};

// Stale time configurations for different data types
export const staleTimes = {
  [DataCategory.AUTH]: 0, // Always refetch auth data
  [DataCategory.USER]: 30 * 1000, // 30 seconds
  [DataCategory.GAME]: 60 * 1000, // 1 minute
  [DataCategory.PLAYER]: 60 * 1000, // 1 minute
  [DataCategory.BONUS]: 2 * 60 * 1000, // 2 minutes
  [DataCategory.RECOMMENDATION]: 5 * 60 * 1000, // 5 minutes
  [DataCategory.DASHBOARD]: 30 * 1000, // 30 seconds
  [DataCategory.STATIC]: 12 * 60 * 60 * 1000, // 12 hours
};

// Helper to determine data category from query key
export const getCategoryFromKey = (queryKey: unknown[]): DataCategory => {
  if (!queryKey.length || typeof queryKey[0] !== 'string') {
    return DataCategory.USER; // Default
  }
  
  const key = queryKey[0].toLowerCase();
  
  if (key.includes('auth') || key.includes('login') || key.includes('token')) {
    return DataCategory.AUTH;
  } else if (key.includes('user') || key.includes('profile')) {
    return DataCategory.USER;
  } else if (key.includes('game')) {
    return DataCategory.GAME;
  } else if (key.includes('player')) {
    return DataCategory.PLAYER;
  } else if (key.includes('bonus')) {
    return DataCategory.BONUS;
  } else if (key.includes('recommendation')) {
    return DataCategory.RECOMMENDATION;
  } else if (key.includes('dashboard') || key.includes('stats')) {
    return DataCategory.DASHBOARD;
  } else if (key.includes('config') || key.includes('settings') || key.includes('static')) {
    return DataCategory.STATIC;
  }
  
  return DataCategory.USER;
};

// Create a configured QueryClient for optimal caching
export const createQueryClient = (): QueryClient => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Global default settings
        retry: 2,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
        staleTime: 60 * 1000, // 1 minute default stale time
        cacheTime: 10 * 60 * 1000, // 10 minutes default cache time
        refetchOnWindowFocus: true,
        refetchOnMount: true,
        refetchOnReconnect: true,
        // Smart refetching based on data category
        queryFn: async (context) => {
          const category = getCategoryFromKey(context.queryKey);
          
          // Override default stale time from context
          if (!context.meta?.skipCustomCacheSettings) {
            context.meta = {
              ...context.meta,
              cacheTime: cacheTimes[category],
              staleTime: staleTimes[category],
            };
          }
          
          // Execute the original query
          return context.originalFn();
        },
      },
      mutations: {
        // Global mutation settings
        retry: 1,
        retryDelay: 1000,
      },
    },
  });
};

// Default query client instance
export const queryClient = createQueryClient();

// Helper to create optimized query keys with category metadata
export const createQueryKey = <T extends string[]>(
  category: DataCategory,
  ...parts: T
): [...T, { category: DataCategory }] => {
  return [...parts, { category }];
};

// Helper to get cache settings for specific data types
export const getQueryOptions = (category: DataCategory) => {
  return {
    staleTime: staleTimes[category],
    cacheTime: cacheTimes[category],
    meta: {
      category,
    },
  };
};

export default queryClient;