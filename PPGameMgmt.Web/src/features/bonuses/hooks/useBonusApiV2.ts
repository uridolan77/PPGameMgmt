/**
 * Refactored bonus API hooks using the new hook factory
 * This provides a more consistent and maintainable API for bonus-related operations
 */

import { createEntityHooks, ApiError } from '../../../core/api';
import { DataCategory } from '../../../core/api/reactQueryConfig';
import { bonusApi } from '../services';
import { Bonus, BonusFilter, BonusClaim, BonusClaimFilter, BonusStats } from '../types';
import { handleApiError } from '../../../core/error';
import { useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from '../../../core/api/cacheConfig';

// Create the base bonus hooks using the hook factory
const bonusHooks = createEntityHooks<Bonus>(
  'Bonuses',
  bonusApi,
  DataCategory.BONUS
);

// Create the base bonus claim hooks using the hook factory
const bonusClaimHooks = createEntityHooks<BonusClaim, Omit<BonusClaim, 'id'>, Partial<BonusClaim>>(
  'BonusClaims',
  {
    getAll: (params?: BonusClaimFilter) => bonusApi.getClaims(params),
    getById: (id: number) => bonusApi.getClaimById(id),
    create: (data: Omit<BonusClaim, 'id'>) => bonusApi.createClaim(data),
    update: (id: number, data: Partial<BonusClaim>) => bonusApi.updateClaim(id, data),
    remove: (id: number) => bonusApi.removeClaim(id)
  },
  DataCategory.BONUS
);

// Export the base hooks with more descriptive names
export const useBonusesQuery = bonusHooks.useGetAll;
export const useBonusQuery = bonusHooks.useGetById;
export const useCreateBonusMutation = bonusHooks.useCreate;
export const useUpdateBonusMutation = bonusHooks.useUpdate;
export const useDeleteBonusMutation = bonusHooks.useDelete;

export const useBonusClaimsQuery = bonusClaimHooks.useGetAll;
export const useBonusClaimQuery = bonusClaimHooks.useGetById;
export const useCreateBonusClaimMutation = bonusClaimHooks.useCreate;
export const useUpdateBonusClaimMutation = bonusClaimHooks.useUpdate;
export const useDeleteBonusClaimMutation = bonusClaimHooks.useDelete;

/**
 * Hook for fetching bonus stats
 */
export function useBonusStats(bonusId?: number) {
  return bonusHooks.createCustomQuery<BonusStats>(
    'stats',
    (id) => bonusApi.getStats(id)
  )(bonusId);
}

/**
 * Hook for fetching bonus claims by player
 */
export function useBonusClaimsByPlayer(playerId?: number) {
  return bonusClaimHooks.createCustomQuery<BonusClaim[]>(
    'by-player',
    (id) => bonusApi.getClaimsByPlayerId(id)
  )(playerId);
}

/**
 * Hook for fetching bonus claims by bonus
 */
export function useBonusClaimsByBonus(bonusId?: number) {
  return bonusClaimHooks.createCustomQuery<BonusClaim[]>(
    'by-bonus',
    (id) => bonusApi.getClaimsByBonusId(id)
  )(bonusId);
}

/**
 * Unified API hook for all bonus-related operations
 * This provides a single entry point for all bonus API operations
 */
export function useBonusApiV2() {
  return {
    // Bonus operations
    getBonuses: useBonusesQuery,
    getBonus: useBonusQuery,
    getBonusStats: useBonusStats,
    createBonus: useCreateBonusMutation,
    updateBonus: useUpdateBonusMutation,
    deleteBonus: useDeleteBonusMutation,

    // Bonus claim operations
    getBonusClaims: useBonusClaimsQuery,
    getBonusClaim: useBonusClaimQuery,
    getBonusClaimsByPlayer: useBonusClaimsByPlayer,
    getBonusClaimsByBonus: useBonusClaimsByBonus,
    createBonusClaim: useCreateBonusClaimMutation,
    updateBonusClaim: useUpdateBonusClaimMutation,
    deleteBonusClaim: useDeleteBonusClaimMutation
  };
}

export default useBonusApiV2;
