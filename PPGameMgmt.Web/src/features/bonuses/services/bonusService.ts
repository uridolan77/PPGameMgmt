import { createApiHelpers } from '../../../core/api';
import { DataCategory } from '../../../core/api/reactQueryConfig';
import { Bonus, BonusFilter, BonusClaim, BonusClaimFilter, BonusInput, BonusStats } from '../types';

/**
 * Bonus API service with methods to interact with the backend
 * Uses standardized createApiHelpers pattern for consistent API access
 */
export const bonusApi = {
  /**
   * Get a list of bonuses with optional filtering
   */
  getAll: (filters?: BonusFilter) =>
    createApiHelpers.getList<Bonus>('Bonuses', DataCategory.BONUS)(filters),

  /**
   * Get a single bonus by ID
   */
  getById: createApiHelpers.getOne<Bonus>('Bonuses', DataCategory.BONUS),

  /**
   * Create a new bonus
   */
  create: createApiHelpers.create<Bonus, BonusInput>('Bonuses'),

  /**
   * Update an existing bonus
   */
  update: createApiHelpers.update<Bonus, Partial<Bonus>>('Bonuses'),

  /**
   * Delete a bonus
   */
  remove: createApiHelpers.remove('Bonuses'),

  /**
   * Update bonus status (active/inactive)
   */
  updateStatus: (id: number, isActive: boolean) =>
    createApiHelpers.patch<Bonus>('Bonuses')(`${id}/status`, { isActive }),

  /**
   * Get bonus statistics
   */
  getStats: (id: number) =>
    createApiHelpers.getOne<BonusStats>(`Bonuses/${id}/stats`, DataCategory.BONUS)(id),

  /**
   * Get bonus claims with optional filtering
   */
  getClaims: (filters?: BonusClaimFilter) =>
    createApiHelpers.getList<BonusClaim>('BonusClaims', DataCategory.BONUS)(filters),

  /**
   * Get a specific bonus claim by ID
   */
  getClaimById: createApiHelpers.getOne<BonusClaim>('BonusClaims', DataCategory.BONUS),

  /**
   * Get all claims for a specific bonus
   */
  getClaimsByBonusId: (bonusId: number) =>
    createApiHelpers.getOne<BonusClaim[]>(`Bonuses/${bonusId}/claims`, DataCategory.BONUS)(bonusId),

  /**
   * Get all claims for a specific player
   */
  getClaimsByPlayerId: (playerId: number) =>
    createApiHelpers.getOne<BonusClaim[]>(`Players/${playerId}/bonus-claims`, DataCategory.BONUS)(playerId),

  /**
   * Create a new bonus claim
   */
  createClaim: createApiHelpers.create<BonusClaim, { bonusId: number; playerId: number }>('BonusClaims'),

  /**
   * Update bonus claim status
   */
  updateClaimStatus: (id: number, status: string) =>
    createApiHelpers.patch<BonusClaim>('BonusClaims')(`${id}/status`, { status })
};

// For backward compatibility
export const bonusService = bonusApi;