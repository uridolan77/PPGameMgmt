import { useApiQuery, useApiMutation, ApiError } from '../../../core/api';
import { CACHE_KEYS, STALE_TIMES } from '../../../core/api/cacheConfig';
import { Bonus, BonusFilter, BonusStats } from '../types';
import { bonusApi } from '../services';
import { handleApiError } from '../../../core/error';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for fetching a list of bonuses with optional filtering
 */
export function useBonuses(filters?: BonusFilter) {
  const query = useApiQuery<Bonus[]>(
    [CACHE_KEYS.BONUSES, filters],
    () => bonusApi.getAll(filters),
    {
      staleTime: STALE_TIMES.STANDARD,
    }
  );

  // Handle errors
  if (query.error) {
    handleApiError(query.error, 'Failed to load bonuses');
  }

  return query;
}

/**
 * Custom hook for fetching a single bonus by ID
 */
export function useBonus(id?: number | string) {
  const numericId = id ? parseInt(id.toString(), 10) : undefined;

  const query = useApiQuery<Bonus>(
    [CACHE_KEYS.BONUS, numericId],
    () => bonusApi.getById(numericId as number),
    {
      enabled: !!numericId,
      staleTime: STALE_TIMES.STANDARD,
    }
  );

  // Handle errors
  if (query.error) {
    handleApiError(query.error, 'Failed to load bonus details');
  }

  return query;
}

/**
 * Custom hook for fetching bonus statistics
 */
export function useBonusStats(id?: number | string) {
  const numericId = id ? parseInt(id.toString(), 10) : undefined;

  const query = useApiQuery<BonusStats>(
    [CACHE_KEYS.BONUS_STATS, numericId],
    () => bonusApi.getStats(numericId as number),
    {
      enabled: !!numericId,
      staleTime: STALE_TIMES.STANDARD,
    }
  );

  // Handle errors
  if (query.error) {
    handleApiError(query.error, 'Failed to load bonus statistics');
  }

  return query;
}

/**
 * Custom hook for creating a new bonus
 */
export function useCreateBonus() {
  const queryClient = useQueryClient();

  return useApiMutation<Bonus, Omit<Bonus, 'id' | 'currentClaims'>>(
    (bonusData) => bonusApi.create(bonusData),
    {
      onSuccess: (newBonus) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
        queryClient.setQueryData([CACHE_KEYS.BONUS, newBonus.id], newBonus);
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to create bonus'),
    }
  );
}

/**
 * Custom hook for updating a bonus
 */
export function useUpdateBonus() {
  const queryClient = useQueryClient();

  return useApiMutation<Bonus, { id: number, data: Partial<Bonus> }>(
    ({ id, data }) => bonusApi.update(id, data),
    {
      onSuccess: (updatedBonus) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
        queryClient.setQueryData([CACHE_KEYS.BONUS, updatedBonus.id], updatedBonus);
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to update bonus'),
    }
  );
}

/**
 * Custom hook for toggling bonus status (active/inactive)
 */
export function useToggleBonusStatus() {
  const queryClient = useQueryClient();

  return useApiMutation<Bonus, { id: number; isActive: boolean }>(
    ({ id, isActive }) => bonusApi.updateStatus(id, isActive),
    {
      onSuccess: (updatedBonus) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
        queryClient.setQueryData([CACHE_KEYS.BONUS, updatedBonus.id], updatedBonus);
      },
      onMutate: async ({ id, isActive }) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: [CACHE_KEYS.BONUS, id] });

        // Snapshot the previous bonus
        const previousBonus = queryClient.getQueryData<Bonus>([CACHE_KEYS.BONUS, id]);

        // Optimistically update the cache
        if (previousBonus) {
          queryClient.setQueryData<Bonus>([CACHE_KEYS.BONUS, id], {
            ...previousBonus,
            isActive
          });
        }

        return { previousBonus };
      },
      onError: (error: ApiError, { id }, context: any) => {
        // If the mutation fails, revert to the previous value
        if (context?.previousBonus) {
          queryClient.setQueryData([CACHE_KEYS.BONUS, id], context.previousBonus);
        }
        handleApiError(error, 'Failed to update bonus status');
      }
    }
  );
}

/**
 * Custom hook for deleting a bonus
 */
export function useDeleteBonus() {
  const queryClient = useQueryClient();

  return useApiMutation<void, number>(
    (id) => bonusApi.remove(id),
    {
      onSuccess: (_data, id) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.BONUS, id] });
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to delete bonus'),
    }
  );
}