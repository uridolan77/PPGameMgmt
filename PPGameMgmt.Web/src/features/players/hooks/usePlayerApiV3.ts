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
  'Players',
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
  const result = api.getAll(params);

  // Add debugging to see what's happening with the data
  console.log('usePlayersQueryV3 result:', {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error
  });

  // Create a modified result with transformed data if needed
  const modifiedResult = {
    ...result,
    data: result.data && typeof result.data === 'object' ? (
      // Handle different response structures
      'value' in result.data ?
        result.data.value :
      'data' in result.data ?
        result.data.data :
      'isSuccess' in result.data && 'data' in result.data ?
        result.data.data :
      Array.isArray(result.data) ?
        result.data :
        result.data
    ) : result.data
  };

  // Additional logging to see the transformed data
  console.log('usePlayersQueryV3 transformed data:', modifiedResult.data);

  return modifiedResult;
}

export function usePlayerQueryV3(id?: number) {
  const api = usePlayerApiV3();
  const result = api.getById(id);

  // Add debugging to see what's happening with the data
  console.log('usePlayerQueryV3 result:', {
    data: result.data,
    isLoading: result.isLoading,
    isError: result.isError,
    error: result.error
  });

  return result;
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
    (id: string | number) => playerApi.getFeatures(typeof id === 'string' ? parseInt(id, 10) : id),
    {
      validateResponse: playerSchemas.playerFeature.array(),
    }
  )(playerId);
}

export function usePlayerGameSessionsV3(playerId?: number) {
  const api = usePlayerApiV3();
  return api.createCustomQuery(
    'game-sessions',
    (id: string | number) => playerApi.getGameSessions(typeof id === 'string' ? parseInt(id, 10) : id),
    {
      validateResponse: playerSchemas.gameSession.array(),
    }
  )(playerId);
}

export function usePlayerBonusClaimsV3(playerId?: number) {
  const api = usePlayerApiV3();
  return api.createCustomQuery(
    'bonus-claims',
    (id: string | number) => playerApi.getBonusClaims(typeof id === 'string' ? parseInt(id, 10) : id),
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
          queryKey: [CACHE_KEYS.PLAYER, 'detail'],
          updater: (_oldData, newData) => newData
        }
      ],
      successMessage: 'Player status updated successfully',
      errorMessage: 'Failed to update player status',
    }
  );
}

export default usePlayerApiV3;
