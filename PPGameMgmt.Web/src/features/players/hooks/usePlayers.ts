import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '../../../core/api';
import { CACHE_KEYS, STALE_TIMES } from '../../../core/api/cacheConfig';
import { playerApi } from '../services';
import { Player } from '../types';
import { handleApiError } from '../../../core/error';

/**
 * Hook for fetching all players with optional segment filtering
 */
export function usePlayers(segment?: string) {
  return useApiQuery(
    [CACHE_KEYS.PLAYERS, { segment }],
    () => playerApi.getAll(segment),
    {
      staleTime: STALE_TIMES.SHORT,
    }
  );
}

/**
 * Hook for fetching a single player by ID
 */
export function usePlayer(playerId?: number) {
  return useApiQuery(
    [CACHE_KEYS.PLAYER, playerId],
    () => playerApi.getById(playerId as number),
    {
      enabled: !!playerId,
      staleTime: STALE_TIMES.STANDARD,
    }
  );
}

/**
 * Hook for fetching player features
 */
export function usePlayerFeatures(playerId?: number) {
  return useApiQuery(
    [CACHE_KEYS.PLAYER_FEATURES, playerId],
    () => playerApi.getFeatures(playerId as number),
    {
      enabled: !!playerId,
      staleTime: STALE_TIMES.STANDARD,
    }
  );
}

/**
 * Hook for fetching player game sessions
 */
export function usePlayerGameSessions(playerId?: number) {
  return useApiQuery(
    [CACHE_KEYS.PLAYER_GAME_SESSIONS, playerId],
    () => playerApi.getGameSessions(playerId as number),
    {
      enabled: !!playerId,
      staleTime: STALE_TIMES.STANDARD,
    }
  );
}

/**
 * Hook for fetching player bonus claims
 */
export function usePlayerBonusClaims(playerId?: number) {
  return useApiQuery(
    [CACHE_KEYS.PLAYER_BONUS_CLAIMS, playerId],
    () => playerApi.getBonusClaims(playerId as number),
    {
      enabled: !!playerId,
      staleTime: STALE_TIMES.STANDARD,
    }
  );
}

/**
 * Mutation hook for creating a new player
 */
export function useCreatePlayer() {
  const queryClient = useQueryClient();

  return useApiMutation(
    (playerData: Omit<Player, 'id'>) => playerApi.create(playerData),
    {
      onSuccess: (newPlayer) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYERS] });
        queryClient.setQueryData([CACHE_KEYS.PLAYER, newPlayer.id], newPlayer);
      }
    }
  );
}

/**
 * Mutation hook for updating an existing player
 */
export function useUpdatePlayer() {
  const queryClient = useQueryClient();

  return useApiMutation(
    ({ id, data }: { id: number, data: Partial<Player> }) => playerApi.update(id, data),
    {
      onSuccess: (updatedPlayer) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYER, updatedPlayer.id] });
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYERS] });
      },
      // Add optimistic updates for better UX
      onMutate: async ({ id, data }) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: [CACHE_KEYS.PLAYER, id] });

        // Snapshot the current value
        const previousPlayer = queryClient.getQueryData([CACHE_KEYS.PLAYER, id]);

        // Optimistically update to the new value
        if (previousPlayer) {
          queryClient.setQueryData([CACHE_KEYS.PLAYER, id], {
            ...previousPlayer,
            ...data
          });
        }

        return { previousPlayer };
      },
      onError: (_error, { id }, context: any) => {
        // If the mutation fails, roll back
        if (context?.previousPlayer) {
          queryClient.setQueryData([CACHE_KEYS.PLAYER, id], context.previousPlayer);
        }
      }
    }
  );
}

/**
 * Mutation hook for deleting a player
 */
export function useDeletePlayer() {
  const queryClient = useQueryClient();

  return useApiMutation(
    (id: number) => playerApi.remove(id),
    {
      onSuccess: (_data, id) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYERS] });
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.PLAYER, id] });
        // Also clean up related queries when a player is deleted
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.PLAYER_FEATURES, id] });
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.PLAYER_GAME_SESSIONS, id] });
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.PLAYER_BONUS_CLAIMS, id] });
      }
    }
  );
}