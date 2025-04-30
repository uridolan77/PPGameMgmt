/**
 * Standardized React Query hooks for data fetching
 * 
 * These hooks provide a consistent pattern for data fetching across the application
 * and abstract away common React Query configuration details.
 */
import { 
  UseQueryOptions, 
  UseMutationOptions,
  useQuery,
  useMutation,
  useQueryClient
} from '@tanstack/react-query';
import { apiClient } from './client';

/**
 * Hook for fetching a single entity by ID
 * 
 * @example
 * const { data: game, isLoading } = useEntityQuery<Game>('games', gameId);
 */
export function useEntityQuery<T>(
  entityType: string,
  id?: string | number,
  options?: Omit<UseQueryOptions<T, Error, T, [string, string | number | undefined]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [entityType, id],
    queryFn: () => apiClient.get<T>(`/${entityType}/${id}`),
    enabled: !!id,
    ...options
  });
}

/**
 * Hook for fetching a list of entities with optional filtering
 * 
 * @example
 * const { data: games, isLoading } = useEntityList<Game[]>(
 *   'games', 
 *   { category: 'action', status: 'active' }
 * );
 */
export function useEntityList<T>(
  entityType: string,
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<T, Error, T, [string, Record<string, any> | undefined]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: [entityType, params],
    queryFn: () => apiClient.get<T>(`/${entityType}`, params),
    ...options
  });
}

/**
 * Hook for fetching a paginated list of entities
 * 
 * @example
 * const { 
 *   data: playersResponse,
 *   isLoading,
 *   fetchNextPage,
 *   hasNextPage
 * } = usePaginatedEntityList('players', { status: 'active' });
 */
export function usePaginatedEntityList<T>(
  entityType: string,
  params?: Record<string, any>,
  options?: Omit<UseQueryOptions<T, Error, T, [string, string, Record<string, any> | undefined]>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: ['paginated', entityType, params],
    queryFn: () => apiClient.get<T>(`/${entityType}`, {
      ...params,
      page: params?.page || 1,
      pageSize: params?.pageSize || 20
    }),
    ...options
  });
}

/**
 * Hook for creating a new entity
 * 
 * @example
 * const { mutate: createGame, isLoading } = useCreateEntity<Game>('games');
 * 
 * // Usage
 * createGame(newGame, {
 *   onSuccess: (game) => {
 *     // Do something with the created game
 *   }
 * });
 */
export function useCreateEntity<T, TData = T>(
  entityType: string,
  options?: Omit<UseMutationOptions<T, Error, TData>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TData) => apiClient.post<T>(`/${entityType}`, data),
    onSuccess: () => {
      // Invalidate the entity list query to refresh data
      queryClient.invalidateQueries({ queryKey: [entityType] });
      queryClient.invalidateQueries({ queryKey: ['paginated', entityType] });
    },
    ...options
  });
}

/**
 * Hook for updating an existing entity
 * 
 * @example
 * const { mutate: updateGame, isLoading } = useUpdateEntity<Game>('games');
 * 
 * // Usage
 * updateGame({ id: '123', ...gameUpdates });
 */
export function useUpdateEntity<T extends { id: string | number }, TData = Partial<T>>(
  entityType: string,
  options?: Omit<UseMutationOptions<T, Error, TData & { id: string | number }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TData & { id: string | number }) => {
      const { id, ...updateData } = data;
      return apiClient.put<T>(`/${entityType}/${id}`, updateData);
    },
    onSuccess: (data) => {
      // Update the entity in the cache
      if ('id' in data) {
        queryClient.setQueryData([entityType, data.id], data);
      }
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: [entityType] });
      queryClient.invalidateQueries({ queryKey: ['paginated', entityType] });
    },
    ...options
  });
}

/**
 * Hook for deleting an entity
 * 
 * @example
 * const { mutate: deleteGame, isLoading } = useDeleteEntity('games');
 * 
 * // Usage
 * deleteGame('123');
 */
export function useDeleteEntity<T = void>(
  entityType: string,
  options?: Omit<UseMutationOptions<T, Error, string | number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string | number) => apiClient.delete<T>(`/${entityType}/${id}`),
    onSuccess: (_, id) => {
      // Remove the entity from the cache
      queryClient.removeQueries({ queryKey: [entityType, id] });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: [entityType] });
      queryClient.invalidateQueries({ queryKey: ['paginated', entityType] });
    },
    ...options
  });
}