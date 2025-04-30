import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '../../../core/api';
import { playerApi } from '../services';
import { Player, PlayerFeature, GameSession, BonusClaim } from '../types';
import { DataCategory } from '../../../core/api/reactQueryConfig';
import { handleApiError } from '../../../core/error/globalErrorHandler';

// Constants for query configuration
const CACHE_KEYS = {
  ALL_PLAYERS: 'players',
  PLAYER: 'player',
  FEATURES: 'player-features',
  GAME_SESSIONS: 'player-game-sessions',
  BONUS_CLAIMS: 'player-bonus-claims'
};

const STALE_TIMES = {
  STANDARD: 1000 * 60 * 5, // 5 minutes
  SHORT: 1000 * 60 * 2,    // 2 minutes
  LONG: 1000 * 60 * 15     // 15 minutes
};

/**
 * A dedicated API hook facade for player-related API operations
 * This provides a consistent interface for all player-related data fetching
 */
export function usePlayerApi() {
  const queryClient = useQueryClient();
  
  return {
    /**
     * Get all players with optional segment filtering
     */
    getPlayers: (segment?: string) => 
      useApiQuery(
        [CACHE_KEYS.ALL_PLAYERS, { segment }],
        () => playerApi.getAll(segment),
        {
          staleTime: STALE_TIMES.SHORT,
          category: DataCategory.PLAYER
        }
      ),
    
    /**
     * Get a single player by ID
     */
    getPlayer: (playerId?: number) => 
      useApiQuery(
        [CACHE_KEYS.PLAYER, playerId],
        () => playerApi.getById(playerId as number),
        {
          enabled: !!playerId,
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.PLAYER
        }
      ),
    
    /**
     * Get player features
     */
    getPlayerFeatures: (playerId?: number) => 
      useApiQuery(
        [CACHE_KEYS.FEATURES, playerId],
        () => playerApi.getFeatures(playerId as number),
        {
          enabled: !!playerId,
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.PLAYER
        }
      ),
    
    /**
     * Get player game sessions
     */
    getPlayerGameSessions: (playerId?: number) => 
      useApiQuery(
        [CACHE_KEYS.GAME_SESSIONS, playerId],
        () => playerApi.getGameSessions(playerId as number),
        {
          enabled: !!playerId,
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.PLAYER
        }
      ),
    
    /**
     * Get player bonus claims
     */
    getPlayerBonusClaims: (playerId?: number) => 
      useApiQuery(
        [CACHE_KEYS.BONUS_CLAIMS, playerId],
        () => playerApi.getBonusClaims(playerId as number),
        {
          enabled: !!playerId,
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.PLAYER
        }
      ),
    
    /**
     * Create a new player
     */
    createPlayer: () => 
      useApiMutation<Player, Omit<Player, 'id'>>(
        (playerData) => playerApi.create(playerData),
        {
          onSuccess: (newPlayer) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ALL_PLAYERS] });
            queryClient.setQueryData([CACHE_KEYS.PLAYER, newPlayer.id], newPlayer);
          },
          onError: (error) => handleApiError(error, 'Failed to create player')
        }
      ),
    
    /**
     * Update an existing player
     */
    updatePlayer: () => 
      useApiMutation<Player, { id: number, data: Partial<Player> }>(
        ({ id, data }) => playerApi.update(id, data),
        {
          onSuccess: (updatedPlayer) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ALL_PLAYERS] });
            queryClient.setQueryData([CACHE_KEYS.PLAYER, updatedPlayer.id], updatedPlayer);
          },
          onError: (error) => handleApiError(error, 'Failed to update player')
        }
      ),
    
    /**
     * Delete a player
     */
    deletePlayer: () => 
      useApiMutation<void, number>(
        (id) => playerApi.remove(id),
        {
          onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ALL_PLAYERS] });
            queryClient.removeQueries({ queryKey: [CACHE_KEYS.PLAYER, id] });
            // Also clean up related queries when a player is deleted
            queryClient.removeQueries({ queryKey: [CACHE_KEYS.FEATURES, id] });
            queryClient.removeQueries({ queryKey: [CACHE_KEYS.GAME_SESSIONS, id] });
            queryClient.removeQueries({ queryKey: [CACHE_KEYS.BONUS_CLAIMS, id] });
          },
          onError: (error) => handleApiError(error, 'Failed to delete player')
        }
      )
  };
}

export default usePlayerApi;
