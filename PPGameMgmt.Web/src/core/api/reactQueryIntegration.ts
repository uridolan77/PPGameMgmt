import { useQuery, useMutation, QueryKey, UseQueryOptions, UseMutationOptions, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { apiClient } from './client';
import { ApiError, PaginatedResponse } from './types';
import { queryClient, DataCategory, getQueryOptions } from './reactQueryConfig';

// Export the QueryClientProvider with our configured client
export const ApiProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

// Type definitions for our custom hooks
type QueryFn<TData> = () => Promise<TData>;

interface UseApiQueryOptions<TData> extends Omit<UseQueryOptions<TData, ApiError, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  // Options specific to our API client
  abortOnUnmount?: boolean;
  skipRetry?: boolean;
  category?: DataCategory; // Added category for cache optimization
}

interface UseApiMutationOptions<TData, TVariables> extends Omit<UseMutationOptions<TData, ApiError, TVariables>, 'mutationFn'> {
  // Options specific to our API client
  skipRetry?: boolean;
}

// Custom hook for queries that integrates with our API client
export function useApiQuery<TData>(
  queryKey: QueryKey,
  queryFn: QueryFn<TData>,
  options?: UseApiQueryOptions<TData>
) {
  const { 
    abortOnUnmount = true, 
    skipRetry, 
    category, 
    ...queryOptions 
  } = options || {};
  
  // Get optimal cache settings if category is provided
  const cacheSettings = category ? getQueryOptions(category) : {};
  
  return useQuery<TData, ApiError>({
    queryKey,
    queryFn: async ({ signal }) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
        
        // Merge abort signals if both exist
        const mergedSignal = signal 
          ? new AbortController().signal
          : controller.signal;
        
        if (signal) {
          // Forward abort from React Query
          signal.addEventListener('abort', () => controller.abort());
        }
        
        // If the query function is a direct API call, pass the abort signal
        if (queryFn.toString().includes('apiClient')) {
          const result = await queryFn();
          clearTimeout(timeoutId);
          return result;
        }
        
        // For regular function
        const result = await queryFn();
        clearTimeout(timeoutId);
        return result;
      } catch (error) {
        // Ensure errors are properly typed
        if (error instanceof ApiError) {
          throw error;
        }
        
        throw new ApiError(
          error.message || 'Unknown error',
          0,
          { originalError: error }
        );
      }
    },
    ...cacheSettings, // Apply optimal cache settings
    ...queryOptions,
  });
}

// Custom hook for paginated queries
export function usePaginatedApiQuery<TData>(
  queryKey: QueryKey,
  fetchFn: (page: number, pageSize: number) => Promise<PaginatedResponse<TData>>,
  page: number,
  pageSize: number,
  options?: UseApiQueryOptions<PaginatedResponse<TData>>
) {
  return useApiQuery<PaginatedResponse<TData>>(
    [...queryKey, page, pageSize],
    () => fetchFn(page, pageSize),
    options
  );
}

// Custom hook for mutations that integrates with our API client
export function useApiMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options?: UseApiMutationOptions<TData, TVariables>
) {
  const { skipRetry, ...mutationOptions } = options || {};
  
  return useMutation<TData, ApiError, TVariables>({
    mutationFn: async (variables) => {
      try {
        return await mutationFn(variables);
      } catch (error) {
        // Ensure errors are properly typed
        if (error instanceof ApiError) {
          throw error;
        }
        
        throw new ApiError(
          error.message || 'Unknown error',
          0,
          { originalError: error }
        );
      }
    },
    ...mutationOptions,
  });
}

// Helper functions to create common API query patterns with category optimization
export const createApiHelpers = {
  // Helper for getting a list of resources
  getList: <T>(resource: string, category?: DataCategory) => {
    return (params?: Record<string, any>, options?: { signal?: AbortSignal }) => 
      apiClient.get<T[]>(`/${resource}`, params, options);
  },
  
  // Helper for getting paginated resources
  getPaginated: <T>(resource: string, category?: DataCategory) => {
    return (page: number, pageSize: number, params?: Record<string, any>, options?: { signal?: AbortSignal }) => 
      apiClient.get<PaginatedResponse<T>>(`/${resource}`, { 
        page, 
        pageSize, 
        ...params 
      }, options);
  },
  
  // Helper for getting a single resource
  getOne: <T>(resource: string, category?: DataCategory) => {
    return (id: string | number, options?: { signal?: AbortSignal }) => 
      apiClient.get<T>(`/${resource}/${id}`, undefined, options);
  },
  
  // Helper for creating a resource
  create: <T, D = any>(resource: string) => {
    return (data: D, options?: { signal?: AbortSignal }) => 
      apiClient.post<T>(`/${resource}`, data, options);
  },
  
  // Helper for updating a resource
  update: <T, D = any>(resource: string) => {
    return (id: string | number, data: D, options?: { signal?: AbortSignal }) => 
      apiClient.put<T>(`/${resource}/${id}`, data, options);
  },
  
  // Helper for patching a resource
  patch: <T, D = any>(resource: string) => {
    return (id: string | number, data: D, options?: { signal?: AbortSignal }) => 
      apiClient.patch<T>(`/${resource}/${id}`, data, options);
  },
  
  // Helper for deleting a resource
  remove: <T = void>(resource: string) => {
    return (id: string | number, options?: { signal?: AbortSignal }) => 
      apiClient.delete<T>(`/${resource}/${id}`, options);
  }
};

// Export the query client for direct access
export { queryClient };