import { useQuery, useMutation, QueryKey, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import { apiClient } from './client';
import { ApiError, PaginatedResponse } from './types';

// Type definitions for our custom hooks
type QueryFn<TData> = () => Promise<TData>;

interface UseApiQueryOptions<TData> extends Omit<UseQueryOptions<TData, ApiError, TData, QueryKey>, 'queryKey' | 'queryFn'> {
  // Options specific to our API client
  abortOnUnmount?: boolean;
  skipRetry?: boolean;
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
  const { abortOnUnmount = true, skipRetry, ...queryOptions } = options || {};
  
  return useQuery<TData, ApiError>({
    queryKey,
    queryFn: async ({ signal }) => {
      try {
        // If the query function is a direct API call, pass the abort signal
        if (queryFn.toString().includes('apiClient')) {
          return await queryFn();
        } 
        
        // For regular function, we don't have a clean way to pass the signal
        return await queryFn();
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

// Helper functions to create common API query patterns
export const createApiHelpers = {
  // Helper for getting a list of resources
  getList: <T>(resource: string) => {
    return (params?: Record<string, any>) => 
      apiClient.get<T[]>(`/${resource}`, params);
  },
  
  // Helper for getting paginated resources
  getPaginated: <T>(resource: string) => {
    return (page: number, pageSize: number, params?: Record<string, any>) => 
      apiClient.get<PaginatedResponse<T>>(`/${resource}`, { 
        page, 
        pageSize, 
        ...params 
      });
  },
  
  // Helper for getting a single resource
  getOne: <T>(resource: string) => {
    return (id: string | number) => 
      apiClient.get<T>(`/${resource}/${id}`);
  },
  
  // Helper for creating a resource
  create: <T, D = any>(resource: string) => {
    return (data: D) => 
      apiClient.post<T>(`/${resource}`, data);
  },
  
  // Helper for updating a resource
  update: <T, D = any>(resource: string) => {
    return (id: string | number, data: D) => 
      apiClient.put<T>(`/${resource}/${id}`, data);
  },
  
  // Helper for patching a resource
  patch: <T, D = any>(resource: string) => {
    return (id: string | number, data: D) => 
      apiClient.patch<T>(`/${resource}/${id}`, data);
  },
  
  // Helper for deleting a resource
  remove: <T = void>(resource: string) => {
    return (id: string | number) => 
      apiClient.delete<T>(`/${resource}/${id}`);
  }
};