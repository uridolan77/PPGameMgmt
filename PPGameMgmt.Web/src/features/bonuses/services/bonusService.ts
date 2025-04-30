import { apiClient } from '../../../core/api';
import { Bonus, BonusFilter, BonusClaim, BonusClaimFilter, BonusInput, BonusStats } from '../types';

const BONUSES_ENDPOINT = '/bonuses';
const BONUS_CLAIMS_ENDPOINT = '/bonus-claims';

/**
 * Bonus API service with methods to interact with the backend
 */
export const bonusService = {
  /**
   * Get a list of bonuses with optional filtering
   */
  getBonuses: async (filters?: BonusFilter): Promise<Bonus[]> => {
    const response = await apiClient.get(BONUSES_ENDPOINT, { params: filters });
    return response.data;
  },

  /**
   * Get a single bonus by ID
   */
  getBonus: async (id: number): Promise<Bonus> => {
    const response = await apiClient.get(`${BONUSES_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Create a new bonus
   */
  createBonus: async (bonusData: BonusInput): Promise<Bonus> => {
    const response = await apiClient.post(BONUSES_ENDPOINT, bonusData);
    return response.data;
  },

  /**
   * Update an existing bonus
   */
  updateBonus: async (id: number, bonusData: Partial<Bonus>): Promise<Bonus> => {
    const response = await apiClient.put(`${BONUSES_ENDPOINT}/${id}`, bonusData);
    return response.data;
  },

  /**
   * Update bonus status (active/inactive)
   */
  updateBonusStatus: async (id: number, isActive: boolean): Promise<Bonus> => {
    const response = await apiClient.patch(`${BONUSES_ENDPOINT}/${id}/status`, { isActive });
    return response.data;
  },

  /**
   * Delete a bonus
   */
  deleteBonus: async (id: number): Promise<void> => {
    await apiClient.delete(`${BONUSES_ENDPOINT}/${id}`);
  },

  /**
   * Get bonus statistics
   */
  getBonusStats: async (id: number): Promise<BonusStats> => {
    const response = await apiClient.get(`${BONUSES_ENDPOINT}/${id}/stats`);
    return response.data;
  },

  /**
   * Get bonus claims with optional filtering
   */
  getBonusClaims: async (filters?: BonusClaimFilter): Promise<BonusClaim[]> => {
    const response = await apiClient.get(BONUS_CLAIMS_ENDPOINT, { params: filters });
    return response.data;
  },

  /**
   * Get a specific bonus claim by ID
   */
  getBonusClaim: async (id: number): Promise<BonusClaim> => {
    const response = await apiClient.get(`${BONUS_CLAIMS_ENDPOINT}/${id}`);
    return response.data;
  },

  /**
   * Get all claims for a specific bonus
   */
  getBonusClaimsByBonusId: async (bonusId: number): Promise<BonusClaim[]> => {
    const response = await apiClient.get(`${BONUSES_ENDPOINT}/${bonusId}/claims`);
    return response.data;
  },

  /**
   * Get all claims for a specific player
   */
  getBonusClaimsByPlayerId: async (playerId: number): Promise<BonusClaim[]> => {
    const response = await apiClient.get(`/players/${playerId}/bonus-claims`);
    return response.data;
  },

  /**
   * Create a new bonus claim
   */
  createBonusClaim: async (claimData: { bonusId: number; playerId: number }): Promise<BonusClaim> => {
    const response = await apiClient.post(BONUS_CLAIMS_ENDPOINT, claimData);
    return response.data;
  },

  /**
   * Update bonus claim status
   */
  updateBonusClaimStatus: async (id: number, status: string): Promise<BonusClaim> => {
    const response = await apiClient.patch(`${BONUS_CLAIMS_ENDPOINT}/${id}/status`, { status });
    return response.data;
  }
};