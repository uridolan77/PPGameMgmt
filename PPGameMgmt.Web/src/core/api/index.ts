// Re-export the API client
export { apiClient } from './client';
export type { ApiClientConfig, RetryConfig } from './client';

// Re-export error types and API types
export { ApiError } from './types';
export type { PaginatedResponse, ApiResponse } from './types';

// Export React Query integration
export {
  useApiQuery,
  usePaginatedApiQuery,
  useApiMutation,
  createApiHelpers,
  ApiProvider
} from './reactQueryIntegration';

// Export cache configuration
export { CACHE_KEYS, STALE_TIMES, getStaleTime, getCacheTime } from './cacheConfig';

// Export hook factory
export { createEntityHooks } from './hookFactory';