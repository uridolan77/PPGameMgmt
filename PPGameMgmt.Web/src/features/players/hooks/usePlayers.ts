import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation } from '../../../core/api';
import { playerApi } from '../services';
import { Player } from '../types';

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
 * Hook for fetching all players with optional segment filtering
 */
export function usePlayers(segment?: string) {
  return useApiQuery(
    [CACHE_KEYS.ALL_PLAYERS, { segment }],
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
    [CACHE_KEYS.FEATURES, playerId],
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
    [CACHE_KEYS.GAME_SESSIONS, playerId],
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
    [CACHE_KEYS.BONUS_CLAIMS, playerId],
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
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ALL_PLAYERS] });
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
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ALL_PLAYERS] });
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
      onError: (_error, { id }, context) => {
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
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.ALL_PLAYERS] });
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.PLAYER, id] });
        // Also clean up related queries when a player is deleted
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.FEATURES, id] });
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.GAME_SESSIONS, id] });
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.BONUS_CLAIMS, id] });
      }
    }
  );
}