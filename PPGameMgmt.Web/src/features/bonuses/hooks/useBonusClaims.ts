import { useApiQuery, useApiMutation, ApiError } from '../../../core/api';
import { CACHE_KEYS, STALE_TIMES } from '../../../core/api/cacheConfig';
import { BonusClaim, BonusClaimFilter } from '../types';
import { bonusApi } from '../services';
import { handleApiError } from '../../../core/error';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for fetching a list of bonus claims with optional filtering
 */
export function useBonusClaims(filters?: BonusClaimFilter) {
  const query = useApiQuery<BonusClaim[]>(
    [CACHE_KEYS.BONUS_CLAIMS, filters],
    () => bonusApi.getClaims(filters),
    {
      staleTime: STALE_TIMES.STANDARD,
    }
  );

  // Handle errors
  if (query.error) {
    handleApiError(query.error, 'Failed to load bonus claims');
  }

  return query;
}

/**
 * Custom hook for fetching a single bonus claim by ID
 */
export function useBonusClaim(id?: number | string) {
  const numericId = id ? parseInt(id.toString(), 10) : undefined;

  const query = useApiQuery<BonusClaim>(
    [CACHE_KEYS.BONUS_CLAIM, numericId],
    () => bonusApi.getClaimById(numericId as number),
    {
      enabled: !!numericId,
      staleTime: STALE_TIMES.STANDARD,
    }
  );

  // Handle errors
  if (query.error) {
    handleApiError(query.error, 'Failed to load bonus claim details');
  }

  return query;
}

/**
 * Custom hook for fetching all claims for a specific bonus
 */
export function useBonusClaimsByBonus(bonusId?: number | string) {
  const numericId = bonusId ? parseInt(bonusId.toString(), 10) : undefined;

  const query = useApiQuery<BonusClaim[]>(
    ['bonus-bonus-claims', numericId],
    () => bonusApi.getClaimsByBonusId(numericId as number),
    {
      enabled: !!numericId,
      staleTime: STALE_TIMES.STANDARD,
    }
  );

  // Handle errors
  if (query.error) {
    handleApiError(query.error, 'Failed to load bonus claims for this bonus');
  }

  return query;
}

/**
 * Custom hook for fetching all claims for a specific player
 */
export function useBonusClaimsByPlayer(playerId?: number | string) {
  const numericId = playerId ? parseInt(playerId.toString(), 10) : undefined;

  const query = useApiQuery<BonusClaim[]>(
    [CACHE_KEYS.PLAYER_BONUS_CLAIMS, numericId],
    () => bonusApi.getClaimsByPlayerId(numericId as number),
    {
      enabled: !!numericId,
      staleTime: STALE_TIMES.STANDARD,
    }
  );

  // Handle errors
  if (query.error) {
    handleApiError(query.error, 'Failed to load bonus claims for this player');
  }

  return query;
}

/**
 * Custom hook for creating a new bonus claim
 */
export function useCreateBonusClaim() {
  const queryClient = useQueryClient();

  return useApiMutation<BonusClaim, { bonusId: number; playerId: number }>(
    (claimData) => bonusApi.createClaim(claimData),
    {
      onSuccess: (newClaim) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS_CLAIMS] });
        queryClient.invalidateQueries({ queryKey: ['bonus-bonus-claims', newClaim.bonusId] });
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYER_BONUS_CLAIMS, newClaim.playerId] });

        // Also invalidate the bonus itself as the claim count may have changed
        queryClient.invalidateQueries({ queryKey: ['bonus', newClaim.bonusId] });

        // Set the new claim data in the cache
        queryClient.setQueryData([CACHE_KEYS.BONUS_CLAIM, newClaim.id], newClaim);
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to create bonus claim'),
    }
  );
}

/**
 * Custom hook for updating a bonus claim status
 */
export function useUpdateBonusClaimStatus() {
  const queryClient = useQueryClient();

  return useApiMutation<BonusClaim, { id: number; status: string }>(
    ({ id, status }) => bonusApi.updateClaimStatus(id, status),
    {
      onSuccess: (updatedClaim) => {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS_CLAIMS] });
        queryClient.invalidateQueries({ queryKey: ['bonus-bonus-claims', updatedClaim.bonusId] });
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYER_BONUS_CLAIMS, updatedClaim.playerId] });

        // Update the claim in the cache
        queryClient.setQueryData([CACHE_KEYS.BONUS_CLAIM, updatedClaim.id], updatedClaim);
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to update bonus claim status'),
    }
  );
}