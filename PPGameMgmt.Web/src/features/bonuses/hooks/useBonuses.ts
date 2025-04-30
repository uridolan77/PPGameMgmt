import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bonus, BonusFilter } from '../types';
import { bonusService } from '../services';
import { handleApiError } from '../../../shared/utils/errorHandling';

// Cache keys for React Query
const CACHE_KEYS = {
  BONUSES: 'bonuses',
  BONUS: 'bonus',
  BONUS_STATS: 'bonusStats',
};

// Stale times for caching
const STALE_TIMES = {
  STANDARD: 1000 * 60 * 5, // 5 minutes
};

/**
 * Custom hook for fetching a list of bonuses with optional filtering
 */
export function useBonuses(filters?: BonusFilter) {
  return useQuery({
    queryKey: [CACHE_KEYS.BONUSES, filters],
    queryFn: () => bonusService.getBonuses(filters),
    staleTime: STALE_TIMES.STANDARD,
    onError: (error) => handleApiError(error, 'Failed to load bonuses'),
  });
}

/**
 * Custom hook for fetching a single bonus by ID
 */
export function useBonus(id?: number | string) {
  const numericId = id ? parseInt(id.toString(), 10) : undefined;
  
  return useQuery({
    queryKey: [CACHE_KEYS.BONUS, numericId],
    queryFn: () => bonusService.getBonus(numericId as number),
    enabled: !!numericId,
    staleTime: STALE_TIMES.STANDARD,
    onError: (error) => handleApiError(error, 'Failed to load bonus details'),
  });
}

/**
 * Custom hook for fetching bonus statistics
 */
export function useBonusStats(id?: number | string) {
  const numericId = id ? parseInt(id.toString(), 10) : undefined;
  
  return useQuery({
    queryKey: [CACHE_KEYS.BONUS_STATS, numericId],
    queryFn: () => bonusService.getBonusStats(numericId as number),
    enabled: !!numericId,
    staleTime: STALE_TIMES.STANDARD,
    onError: (error) => handleApiError(error, 'Failed to load bonus statistics'),
  });
}

/**
 * Custom hook for creating a new bonus
 */
export function useCreateBonus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bonusData: Omit<Bonus, 'id' | 'currentClaims'>) => 
      bonusService.createBonus(bonusData),
    onSuccess: (newBonus) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
      queryClient.setQueryData([CACHE_KEYS.BONUS, newBonus.id], newBonus);
    },
    onError: (error) => handleApiError(error, 'Failed to create bonus'),
  });
}

/**
 * Custom hook for updating a bonus
 */
export function useUpdateBonus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Bonus> }) => 
      bonusService.updateBonus(id, data),
    onSuccess: (updatedBonus) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
      queryClient.setQueryData([CACHE_KEYS.BONUS, updatedBonus.id], updatedBonus);
    },
    onError: (error) => handleApiError(error, 'Failed to update bonus'),
  });
}

/**
 * Custom hook for toggling bonus status (active/inactive)
 */
export function useToggleBonusStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      bonusService.updateBonusStatus(id, isActive),
    onSuccess: (updatedBonus) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
      queryClient.setQueryData([CACHE_KEYS.BONUS, updatedBonus.id], updatedBonus);
    },
    onMutate: async ({ id, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [CACHE_KEYS.BONUS, id] });
      
      // Snapshot the previous bonus
      const previousBonus = queryClient.getQueryData([CACHE_KEYS.BONUS, id]);
      
      // Optimistically update the cache
      if (previousBonus) {
        queryClient.setQueryData([CACHE_KEYS.BONUS, id], {
          ...previousBonus,
          isActive
        });
      }
      
      return { previousBonus };
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, revert to the previous value
      if (context?.previousBonus) {
        queryClient.setQueryData([CACHE_KEYS.BONUS, id], context.previousBonus);
      }
      handleApiError(error, 'Failed to update bonus status');
    }
  });
}

/**
 * Custom hook for deleting a bonus
 */
export function useDeleteBonus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => bonusService.deleteBonus(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
      queryClient.removeQueries({ queryKey: [CACHE_KEYS.BONUS, id] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete bonus'),
  });
}