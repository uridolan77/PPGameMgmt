import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, ApiError } from './index';
import { DataCategory } from './reactQueryConfig';

/**
 * Standard stale times for different data types
 */
export const STALE_TIMES = {
  STANDARD: 1000 * 60 * 5, // 5 minutes
  SHORT: 1000 * 60 * 2,    // 2 minutes
  LONG: 1000 * 60 * 15     // 15 minutes
};

/**
 * Creates a set of standardized API hooks for a specific entity type
 *
 * @param entityName The name of the entity (e.g., 'player', 'game', 'bonus')
 * @param apiService The API service for the entity
 * @param category The data category for cache optimization
 * @returns A set of standardized hooks for the entity
 */
export function createEntityHooks<
  TEntity extends { id: number | string },
  TCreateInput = Omit<TEntity, 'id'>,
  TUpdateInput = Partial<TEntity>
>(
  entityName: string,
  apiService: {
    getAll: (params?: any) => Promise<TEntity[]>;
    getById: (id: number) => Promise<TEntity>;
    create: (data: TCreateInput) => Promise<TEntity>;
    update: (id: number, data: TUpdateInput) => Promise<TEntity>;
    remove: (id: number) => Promise<void>;
    [key: string]: any;
  },
  category: DataCategory
) {
  // Cache keys for the entity
  const CACHE_KEYS = {
    ALL: entityName,
    DETAIL: `${entityName}-detail`,
  };

  return {
    /**
     * Hook for fetching all entities with optional filtering
     */
    useGetAll: (params?: any) =>
      useApiQuery(
        [CACHE_KEYS.ALL, params],
        () => apiService.getAll(params),
        {
          staleTime: STALE_TIMES.SHORT,
          category
        }
      ),

    /**
     * Hook for fetching a single entity by ID
     */
    useGetById: (id?: number | string) => {
      const numericId = id ? Number(id) : undefined;

      return useApiQuery(
        [CACHE_KEYS.DETAIL, numericId],
        () => apiService.getById(numericId as number),
        {
          enabled: !!numericId,
          staleTime: STALE_TIMES.STANDARD,
          category
        }
      );
    },

    /**
     * Hook for creating a new entity
     */
    useCreate: () => {
      const queryClient = useQueryClient();

      return useApiMutation<TEntity, TCreateInput>(
        (data) => apiService.create(data),
        {
          onSuccess: (newEntity) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ALL] });
            queryClient.setQueryData([CACHE_KEYS.DETAIL, newEntity.id], newEntity);
          }
        }
      );
    },

    /**
     * Hook for updating an entity
     */
    useUpdate: () => {
      const queryClient = useQueryClient();

      return useApiMutation<TEntity, { id: number; data: TUpdateInput }>(
        ({ id, data }) => apiService.update(id, data),
        {
          onSuccess: (updatedEntity) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ALL] });
            queryClient.setQueryData([CACHE_KEYS.DETAIL, updatedEntity.id], updatedEntity);
          }
        }
      );
    },

    /**
     * Hook for deleting an entity
     */
    useDelete: () => {
      const queryClient = useQueryClient();

      return useApiMutation<void, number>(
        (id) => apiService.remove(id),
        {
          onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ALL] });
            queryClient.removeQueries({ queryKey: [CACHE_KEYS.DETAIL, id] });
          }
        }
      );
    },

    /**
     * Create a custom query hook for this entity
     */
    createCustomQuery: <TData,>(
      name: string,
      queryFn: (id: number) => Promise<TData>
    ) => {
      return (id?: number) =>
        useApiQuery(
          [`${entityName}-${name}`, id],
          () => queryFn(id as number),
          {
            enabled: !!id,
            staleTime: STALE_TIMES.STANDARD,
            category
          }
        );
    },

    /**
     * Create a custom mutation hook for this entity
     */
    createCustomMutation: <TData, TVariables,>(
      mutationFn: (variables: TVariables) => Promise<TData>,
      options?: {
        invalidateQueries?: string[];
        updateQueries?: Array<{
          queryKey: unknown[];
          updater: (oldData: any, newData: TData) => any;
        }>;
      }
    ) => {
      const queryClient = useQueryClient();

      return () => useApiMutation<TData, TVariables>(
        mutationFn,
        {
          onSuccess: (data, variables) => {
            // Invalidate specified queries
            if (options?.invalidateQueries) {
              options.invalidateQueries.forEach(queryKey => {
                queryClient.invalidateQueries({ queryKey: [queryKey] });
              });
            }

            // Update specified queries
            if (options?.updateQueries) {
              options.updateQueries.forEach(({ queryKey, updater }) => {
                queryClient.setQueryData(queryKey, (oldData: any) =>
                  updater(oldData, data)
                );
              });
            }
          }
        }
      );
    }
  };
}
