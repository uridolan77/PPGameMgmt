/**
 * Refactored game API hooks using the new hook factory
 * This provides a more consistent and maintainable API for game-related operations
 */

import { createEntityHooks, ApiError } from '../../../core/api';
import { DataCategory } from '../../../core/api/reactQueryConfig';
import { gameApi } from '../services';
import { Game, GameFilter } from '../types';
import { handleApiError } from '../../../core/error';
import { useQueryClient } from '@tanstack/react-query';
import { CACHE_KEYS } from '../../../core/api/cacheConfig';

// Create the base game hooks using the hook factory
const gameHooks = createEntityHooks<Game>(
  'games',
  gameApi,
  DataCategory.GAME
);

// Export the base hooks with more descriptive names
export const useGamesQuery = gameHooks.useGetAll;
export const useGameQuery = gameHooks.useGetById;
export const useCreateGameMutation = gameHooks.useCreate;
export const useUpdateGameMutation = gameHooks.useUpdate;
export const useDeleteGameMutation = gameHooks.useDelete;

/**
 * Hook for toggling a game's active status
 */
export function useToggleGameStatus() {
  const queryClient = useQueryClient();
  
  return gameHooks.createCustomMutation<Game, { id: number; isActive: boolean }>(
    ({ id, isActive }) => gameApi.updateStatus(id, isActive),
    {
      invalidateQueries: [CACHE_KEYS.GAMES],
      updateQueries: [
        {
          queryKey: [CACHE_KEYS.GAME, 'detail', id],
          updater: (oldData, newData) => newData
        }
      ]
    }
  )();
}

/**
 * Unified API hook for all game-related operations
 * This provides a single entry point for all game API operations
 */
export function useGameApiV2() {
  return {
    getGames: useGamesQuery,
    getGame: useGameQuery,
    createGame: useCreateGameMutation,
    updateGame: useUpdateGameMutation,
    deleteGame: useDeleteGameMutation,
    toggleGameStatus: useToggleGameStatus
  };
}

export default useGameApiV2;
