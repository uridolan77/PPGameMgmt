import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BonusClaimFilter } from '../types';
import { bonusService } from '../services';
import { handleApiError } from '../../../shared/utils/errorHandling';

// Cache keys for React Query
const CACHE_KEYS = {
  BONUS_CLAIMS: 'bonus-claims',
  BONUS_CLAIM: 'bonus-claim',
  PLAYER_BONUS_CLAIMS: 'player-bonus-claims',
  BONUS_BONUS_CLAIMS: 'bonus-bonus-claims',
};

// Stale times for caching
const STALE_TIMES = {
  STANDARD: 1000 * 60 * 5, // 5 minutes
};

/**
 * Custom hook for fetching a list of bonus claims with optional filtering
 */
export function useBonusClaims(filters?: BonusClaimFilter) {
  return useQuery({
    queryKey: [CACHE_KEYS.BONUS_CLAIMS, filters],
    queryFn: () => bonusService.getBonusClaims(filters),
    staleTime: STALE_TIMES.STANDARD,
    onError: (error) => handleApiError(error, 'Failed to load bonus claims'),
  });
}

/**
 * Custom hook for fetching a single bonus claim by ID
 */
export function useBonusClaim(id?: number | string) {
  const numericId = id ? parseInt(id.toString(), 10) : undefined;
  
  return useQuery({
    queryKey: [CACHE_KEYS.BONUS_CLAIM, numericId],
    queryFn: () => bonusService.getBonusClaim(numericId as number),
    enabled: !!numericId,
    staleTime: STALE_TIMES.STANDARD,
    onError: (error) => handleApiError(error, 'Failed to load bonus claim details'),
  });
}

/**
 * Custom hook for fetching all claims for a specific bonus
 */
export function useBonusClaimsByBonus(bonusId?: number | string) {
  const numericId = bonusId ? parseInt(bonusId.toString(), 10) : undefined;
  
  return useQuery({
    queryKey: [CACHE_KEYS.BONUS_BONUS_CLAIMS, numericId],
    queryFn: () => bonusService.getBonusClaimsByBonusId(numericId as number),
    enabled: !!numericId,
    staleTime: STALE_TIMES.STANDARD,
    onError: (error) => handleApiError(error, 'Failed to load bonus claims for this bonus'),
  });
}

/**
 * Custom hook for fetching all claims for a specific player
 */
export function useBonusClaimsByPlayer(playerId?: number | string) {
  const numericId = playerId ? parseInt(playerId.toString(), 10) : undefined;
  
  return useQuery({
    queryKey: [CACHE_KEYS.PLAYER_BONUS_CLAIMS, numericId],
    queryFn: () => bonusService.getBonusClaimsByPlayerId(numericId as number),
    enabled: !!numericId,
    staleTime: STALE_TIMES.STANDARD,
    onError: (error) => handleApiError(error, 'Failed to load bonus claims for this player'),
  });
}

/**
 * Custom hook for creating a new bonus claim
 */
export function useCreateBonusClaim() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (claimData: { bonusId: number; playerId: number }) => 
      bonusService.createBonusClaim(claimData),
    onSuccess: (newClaim) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS_CLAIMS] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS_BONUS_CLAIMS, newClaim.bonusId] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYER_BONUS_CLAIMS, newClaim.playerId] });
      
      // Also invalidate the bonus itself as the claim count may have changed
      queryClient.invalidateQueries({ queryKey: ['bonus', newClaim.bonusId] });
      
      // Set the new claim data in the cache
      queryClient.setQueryData([CACHE_KEYS.BONUS_CLAIM, newClaim.id], newClaim);
    },
    onError: (error) => handleApiError(error, 'Failed to create bonus claim'),
  });
}

/**
 * Custom hook for updating a bonus claim status
 */
export function useUpdateBonusClaimStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      bonusService.updateBonusClaimStatus(id, status),
    onSuccess: (updatedClaim) => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS_CLAIMS] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.BONUS_BONUS_CLAIMS, updatedClaim.bonusId] });
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYER_BONUS_CLAIMS, updatedClaim.playerId] });
      
      // Update the claim in the cache
      queryClient.setQueryData([CACHE_KEYS.BONUS_CLAIM, updatedClaim.id], updatedClaim);
    },
    onError: (error) => handleApiError(error, 'Failed to update bonus claim status'),
  });
}