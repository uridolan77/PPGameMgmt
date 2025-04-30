/**
 * @deprecated This API client is deprecated. Please import from 'src/core/api' instead,
 * which uses the new fetch-based implementation with better caching, retry logic, and error handling.
 */

import { apiClient as newApiClient } from './client';
export const apiClient = newApiClient;

// Re-export to maintain backward compatibility
export default newApiClient;