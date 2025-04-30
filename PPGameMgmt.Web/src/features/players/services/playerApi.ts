import { createApiHelpers } from '../../../core/api';
import { Player, PlayerFeature, GameSession, BonusClaim } from '../types';

/**
 * Player API service with all player-related endpoints
 */
export const playerApi = {
  /**
   * Get all players with optional segment filtering
   */
  getAll: (segment?: string) => 
    createApiHelpers.getList<Player>('players')({ segment }),
    
  /**
   * Get a single player by ID
   */
  getById: createApiHelpers.getOne<Player>('players'),
  
  /**
   * Create a new player
   */
  create: createApiHelpers.create<Player, Omit<Player, 'id'>>('players'),
  
  /**
   * Update an existing player
   */
  update: createApiHelpers.update<Player, Partial<Player>>('players'),
  
  /**
   * Delete a player
   */
  remove: createApiHelpers.remove('players'),
  
  /**
   * Get all features for a specific player
   */
  getFeatures: (id: number) => 
    createApiHelpers.getOne<PlayerFeature[]>(`players/${id}/features`)(id),
    
  /**
   * Get all game sessions for a specific player
   */
  getGameSessions: (id: number) => 
    createApiHelpers.getOne<GameSession[]>(`players/${id}/game-sessions`)(id),
    
  /**
   * Get all bonus claims for a specific player
   */
  getBonusClaims: (id: number) => 
    createApiHelpers.getOne<BonusClaim[]>(`players/${id}/bonus-claims`)(id)
};