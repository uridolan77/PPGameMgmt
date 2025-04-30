import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, ApiError } from '../../../core/api';
import { CACHE_KEYS, STALE_TIMES } from '../../../core/api/cacheConfig';
import { bonusApi } from '../services';
import { Bonus, BonusFilter, BonusClaim, BonusClaimFilter, BonusStats } from '../types';
import { DataCategory } from '../../../core/api/reactQueryConfig';
import { handleApiError } from '../../../core/error';

/**
 * A dedicated API hook facade for bonus-related API operations
 * This provides a consistent interface for all bonus-related data fetching
 */
export function useBonusApi() {
  const queryClient = useQueryClient();

  return {
    /**
     * Get all bonuses with optional filtering
     */
    getBonuses: (filters?: BonusFilter) =>
      useApiQuery<Bonus[]>(
        [CACHE_KEYS.BONUSES, filters],
        () => bonusApi.getAll(filters),
        {
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.BONUS
        }
      ),

    /**
     * Get a single bonus by ID
     */
    getBonus: (bonusId?: number | string) => {
      const numericId = bonusId ? parseInt(bonusId.toString(), 10) : undefined;

      return useApiQuery<Bonus>(
        [CACHE_KEYS.BONUS, numericId],
        () => bonusApi.getById(numericId as number),
        {
          enabled: !!numericId,
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.BONUS
        }
      );
    },

    /**
     * Get bonus statistics
     */
    getBonusStats: (bonusId?: number | string) => {
      const numericId = bonusId ? parseInt(bonusId.toString(), 10) : undefined;

      return useApiQuery<BonusStats>(
        [CACHE_KEYS.BONUS_STATS, numericId],
        () => bonusApi.getStats(numericId as number),
        {
          enabled: !!numericId,
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.BONUS
        }
      );
    },

    /**
     * Get all bonus claims with optional filtering
     */
    getBonusClaims: (filters?: BonusClaimFilter) =>
      useApiQuery<BonusClaim[]>(
        [CACHE_KEYS.BONUS_CLAIMS, filters],
        () => bonusApi.getClaims(filters),
        {
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.BONUS
        }
      ),

    /**
     * Get a single bonus claim by ID
     */
    getBonusClaim: (claimId?: number | string) => {
      const numericId = claimId ? parseInt(claimId.toString(), 10) : undefined;

      return useApiQuery<BonusClaim>(
        [CACHE_KEYS.BONUS_CLAIM, numericId],
        () => bonusApi.getClaimById(numericId as number),
        {
          enabled: !!numericId,
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.BONUS
        }
      );
    },

    /**
     * Get all claims for a specific bonus
     */
    getBonusClaimsByBonus: (bonusId?: number | string) => {
      const numericId = bonusId ? parseInt(bonusId.toString(), 10) : undefined;

      return useApiQuery<BonusClaim[]>(
        [CACHE_KEYS.BONUS_BONUS_CLAIMS, numericId],
        () => bonusApi.getClaimsByBonusId(numericId as number),
        {
          enabled: !!numericId,
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.BONUS
        }
      );
    },

    /**
     * Get all claims for a specific player
     */
    getBonusClaimsByPlayer: (playerId?: number | string) => {
      const numericId = playerId ? parseInt(playerId.toString(), 10) : undefined;

      return useApiQuery<BonusClaim[]>(
        [CACHE_KEYS.PLAYER_BONUS_CLAIMS, numericId],
        () => bonusApi.getClaimsByPlayerId(numericId as number),
        {
          enabled: !!numericId,
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.BONUS
        }
      );
    },

    /**
     * Create a new bonus
     */
    createBonus: () =>
      useApiMutation<Bonus, Omit<Bonus, 'id' | 'currentClaims'>>(
        (bonusData) => bonusApi.create(bonusData),
        {
          onSuccess: (newBonus) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
            queryClient.setQueryData([CACHE_KEYS.BONUS, newBonus.id], newBonus);
          },
          onError: (error: ApiError) => handleApiError(error, 'Failed to create bonus')
        }
      ),

    /**
     * Update an existing bonus
     */
    updateBonus: () =>
      useApiMutation<Bonus, { id: number, data: Partial<Bonus> }>(
        ({ id, data }) => bonusApi.update(id, data),
        {
          onSuccess: (updatedBonus) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
            queryClient.setQueryData([CACHE_KEYS.BONUS, updatedBonus.id], updatedBonus);
          },
          onError: (error: ApiError) => handleApiError(error, 'Failed to update bonus')
        }
      ),

    /**
     * Delete a bonus
     */
    deleteBonus: () =>
      useApiMutation<void, number>(
        (id) => bonusApi.remove(id),
        {
          onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUSES] });
            queryClient.removeQueries({ queryKey: [CACHE_KEYS.BONUS, id] });
          },
          onError: (error: ApiError) => handleApiError(error, 'Failed to delete bonus')
        }
      ),

    /**
     * Toggle bonus status (active/inactive)
     */
    toggleBonusStatus: () =>
      useApiMutation<Bonus, { id: number; isActive: boolean }>(
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
      ),

    /**
     * Create a new bonus claim
     */
    createBonusClaim: () =>
      useApiMutation<BonusClaim, { bonusId: number; playerId: number }>(
        (claimData) => bonusApi.createClaim(claimData),
        {
          onSuccess: (newClaim) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS_CLAIMS] });
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS_BONUS_CLAIMS, newClaim.bonusId] });
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYER_BONUS_CLAIMS, newClaim.playerId] });

            // Also invalidate the bonus itself as the claim count may have changed
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS, newClaim.bonusId] });

            // Set the new claim data in the cache
            queryClient.setQueryData([CACHE_KEYS.BONUS_CLAIM, newClaim.id], newClaim);
          },
          onError: (error: ApiError) => handleApiError(error, 'Failed to create bonus claim')
        }
      ),

    /**
     * Update a bonus claim status
     */
    updateBonusClaimStatus: () =>
      useApiMutation<BonusClaim, { id: number; status: string }>(
        ({ id, status }) => bonusApi.updateClaimStatus(id, status),
        {
          onSuccess: (updatedClaim) => {
            // Invalidate relevant queries
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS_CLAIMS] });
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS_BONUS_CLAIMS, updatedClaim.bonusId] });
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYER_BONUS_CLAIMS, updatedClaim.playerId] });

            // Update the claim in the cache
            queryClient.setQueryData([CACHE_KEYS.BONUS_CLAIM, updatedClaim.id], updatedClaim);
          },
          onError: (error: ApiError) => handleApiError(error, 'Failed to update bonus claim status')
        }
      )
  };
}

export default useBonusApi;
