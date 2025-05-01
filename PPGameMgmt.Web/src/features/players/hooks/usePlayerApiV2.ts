/**
 * Refactored player API hooks using the new hook factory
 * This provides a more consistent and maintainable API for player-related operations
 */

import { createEntityHooks, ApiError } from '../../../core/api';
import { DataCategory } from '../../../core/api/reactQueryConfig';
import { playerApi } from '../services';
import { Player, PlayerFeature, GameSession, BonusClaim } from '../types';
import { handleApiError } from '../../../core/error';
import { useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from '../../../core/api/cacheConfig';

// Create the base player hooks using the hook factory
const playerHooks = createEntityHooks<Player>(
  'Players',
  playerApi,
  DataCategory.PLAYER
);

// Export the base hooks with more descriptive names
export const usePlayersQuery = playerHooks.useGetAll;
export const usePlayerQuery = playerHooks.useGetById;
export const useCreatePlayerMutation = playerHooks.useCreate;
export const useUpdatePlayerMutation = playerHooks.useUpdate;
export const useDeletePlayerMutation = playerHooks.useDelete;

// Create custom hooks for player-specific operations
export function usePlayerFeatures(playerId?: number) {
  return playerHooks.createCustomQuery<PlayerFeature[]>(
    'features',
    (id) => playerApi.getFeatures(id)
  )(playerId);
}

export function usePlayerGameSessions(playerId?: number) {
  return playerHooks.createCustomQuery<GameSession[]>(
    'game-sessions',
    (id) => playerApi.getGameSessions(id)
  )(playerId);
}

export function usePlayerBonusClaims(playerId?: number) {
  return playerHooks.createCustomQuery<BonusClaim[]>(
    'bonus-claims',
    (id) => playerApi.getBonusClaims(id)
  )(playerId);
}

/**
 * Hook for toggling a player's active status
 */
export function useTogglePlayerStatus() {
  const queryClient = useQueryClient();

  return playerHooks.createCustomMutation<Player, { id: number; isActive: boolean }>(
    ({ id, isActive }) => playerApi.update(id, { isActive }),
    {
      invalidateQueries: [CACHE_KEYS.PLAYERS],
      updateQueries: [
        {
          queryKey: [CACHE_KEYS.PLAYER, 'detail', id],
          updater: (oldData, newData) => newData
        }
      ]
    }
  )();
}

/**
 * Unified API hook for all player-related operations
 * This provides a single entry point for all player API operations
 */
export function usePlayerApi() {
  return {
    getPlayers: usePlayersQuery,
    getPlayer: usePlayerQuery,
    getPlayerFeatures: usePlayerFeatures,
    getPlayerGameSessions: usePlayerGameSessions,
    getPlayerBonusClaims: usePlayerBonusClaims,
    createPlayer: useCreatePlayerMutation,
    updatePlayer: useUpdatePlayerMutation,
    deletePlayer: useDeletePlayerMutation,
    togglePlayerStatus: useTogglePlayerStatus
  };
}

export default usePlayerApi;
