import { ApiClient } from './client';

// Create API client using environment variables
export const apiClient = new ApiClient({
  baseUrl: import.meta.env.VITE_API_URL || 'https://localhost:7210/api',
});

// Export types
export * from './types';
export * from './client';