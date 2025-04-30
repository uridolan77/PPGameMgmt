/**
 * Enhanced player API hooks using the new createFeatureApi factory
 * This provides a more consistent, maintainable, and type-safe API for player-related operations
 */

import { createFeatureApi } from '../../../core/api';
import { ErrorDomain } from '../../../core/error';
import { playerApi } from '../services';
import { playerSchemas } from '../schemas/playerSchemas';
import { CACHE_KEYS } from '../../../core/api/cacheConfig';

// Create the enhanced player API hook
const usePlayerApiV3 = createFeatureApi(
  'players',
  playerApi,
  {
    entity: playerSchemas.player,
    createInput: playerSchemas.createPlayer,
    updateInput: playerSchemas.updatePlayer,
    params: playerSchemas.queryParams,
  },
  ErrorDomain.PLAYER
);

// Export the hook
export { usePlayerApiV3 };

// Create and export individual hooks for specific operations
export function usePlayersQueryV3(params?: any) {
  const api = usePlayerApiV3();
  return api.getAll(params);
}

export function usePlayerQueryV3(id?: number) {
  const api = usePlayerApiV3();
  return api.getById(id);
}

export function useCreatePlayerMutationV3() {
  const api = usePlayerApiV3();
  return api.create();
}

export function useUpdatePlayerMutationV3() {
  const api = usePlayerApiV3();
  return api.update();
}

export function useDeletePlayerMutationV3() {
  const api = usePlayerApiV3();
  return api.delete();
}

// Create custom hooks for player-specific operations
export function usePlayerFeaturesV3(playerId?: number) {
  const api = usePlayerApiV3();
  return api.createCustomQuery(
    'features',
    (id) => playerApi.getFeatures(id),
    {
      validateResponse: playerSchemas.playerFeature.array(),
    }
  )(playerId);
}

export function usePlayerGameSessionsV3(playerId?: number) {
  const api = usePlayerApiV3();
  return api.createCustomQuery(
    'game-sessions',
    (id) => playerApi.getGameSessions(id),
    {
      validateResponse: playerSchemas.gameSession.array(),
    }
  )(playerId);
}

export function usePlayerBonusClaimsV3(playerId?: number) {
  const api = usePlayerApiV3();
  return api.createCustomQuery(
    'bonus-claims',
    (id) => playerApi.getBonusClaims(id),
    {
      validateResponse: playerSchemas.bonusClaim.array(),
    }
  )(playerId);
}

/**
 * Hook for toggling a player's active status
 */
export function useTogglePlayerStatusV3() {
  const api = usePlayerApiV3();
  
  return api.createCustomMutation(
    'toggle-status',
    ({ id, isActive }: { id: number; isActive: boolean }) => 
      playerApi.update(id, { isActive }),
    {
      invalidateQueries: [CACHE_KEYS.PLAYERS],
      updateQueries: [
        {
          queryKey: [CACHE_KEYS.PLAYER, 'detail', id],
          updater: (oldData, newData) => newData
        }
      ],
      successMessage: 'Player status updated successfully',
      errorMessage: 'Failed to update player status',
    }
  );
}

export default usePlayerApiV3;
