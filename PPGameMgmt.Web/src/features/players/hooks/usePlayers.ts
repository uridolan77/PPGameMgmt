import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, createApiHelpers } from '../../../core/api';

// Player interfaces
interface Player {
  id: number;
  username: string;
  email: string;
  playerLevel: number;
  segment: string | null;
  lastLogin: string | null;
  isActive: boolean;
}

interface PlayerFeature {
  id: number;
  playerId: number;
  name: string;
  isEnabled: boolean;
  settings: Record<string, any>;
}

interface PlayerGameSession {
  id: number;
  playerId: number;
  gameId: number;
  gameName: string;
  startTime: string;
  duration: number; // in seconds
  betAmount: number;
  winAmount: number;
}

interface PlayerBonusClaim {
  id: number;
  playerId: number;
  bonusId: number;
  bonusName: string;
  claimDate: string;
  expiryDate: string;
  value: number;
  status: 'Active' | 'Used' | 'Expired';
}

// Create API helpers for player resources
const playerApi = {
  getAll: (segment?: string) => 
    createApiHelpers.getList<Player>('players')({ segment }),
  getById: createApiHelpers.getOne<Player>('players'),
  create: createApiHelpers.create<Player, Omit<Player, 'id'>>('players'),
  update: createApiHelpers.update<Player, Partial<Player>>('players'),
  remove: createApiHelpers.remove('players'),
  getFeatures: (id: number) => 
    createApiHelpers.getOne<PlayerFeature[]>(`players/${id}/features`)(id),
  getGameSessions: (id: number) => 
    createApiHelpers.getOne<PlayerGameSession[]>(`players/${id}/game-sessions`)(id),
  getBonusClaims: (id: number) => 
    createApiHelpers.getOne<PlayerBonusClaim[]>(`players/${id}/bonus-claims`)(id)
};

// Hook for fetching all players
export function usePlayers(segment?: string) {
  return useApiQuery(
    ['players', { segment }],
    () => playerApi.getAll(segment),
    {
      staleTime: 1000 * 60 * 2, // 2 minutes
    }
  );
}

// Hook for fetching a single player
export function usePlayer(playerId?: number) {
  return useApiQuery(
    ['player', playerId],
    () => playerApi.getById(playerId as number),
    {
      enabled: !!playerId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
}

// Hook for fetching player features
export function usePlayerFeatures(playerId?: number) {
  return useApiQuery(
    ['player-features', playerId],
    () => playerApi.getFeatures(playerId as number),
    {
      enabled: !!playerId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
}

// Hook for fetching player game sessions
export function usePlayerGameSessions(playerId?: number) {
  return useApiQuery(
    ['player-game-sessions', playerId],
    () => playerApi.getGameSessions(playerId as number),
    {
      enabled: !!playerId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
}

// Hook for fetching player bonus claims
export function usePlayerBonusClaims(playerId?: number) {
  return useApiQuery(
    ['player-bonus-claims', playerId],
    () => playerApi.getBonusClaims(playerId as number),
    {
      enabled: !!playerId,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );
}

// Mutation hook for creating a player
export function useCreatePlayer() {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    (playerData: Omit<Player, 'id'>) => playerApi.create(playerData),
    {
      onSuccess: (newPlayer) => {
        queryClient.invalidateQueries({ queryKey: ['players'] });
        queryClient.setQueryData(['player', newPlayer.id], newPlayer);
      }
    }
  );
}

// Mutation hook for updating a player
export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    ({ id, data }: { id: number, data: Partial<Player> }) => playerApi.update(id, data),
    {
      onSuccess: (updatedPlayer) => {
        queryClient.invalidateQueries({ queryKey: ['player', updatedPlayer.id] });
        queryClient.invalidateQueries({ queryKey: ['players'] });
      },
      // Add optimistic updates for better UX
      onMutate: async ({ id, data }) => {
        // Cancel any outgoing refetches
        await queryClient.cancelQueries({ queryKey: ['player', id] });
        
        // Snapshot the current value
        const previousPlayer = queryClient.getQueryData(['player', id]);
        
        // Optimistically update to the new value
        if (previousPlayer) {
          queryClient.setQueryData(['player', id], {
            ...previousPlayer,
            ...data
          });
        }
        
        return { previousPlayer };
      },
      onError: (_error, { id }, context) => {
        // If the mutation fails, roll back
        if (context?.previousPlayer) {
          queryClient.setQueryData(['player', id], context.previousPlayer);
        }
      }
    }
  );
}

// Mutation hook for deleting a player
export function useDeletePlayer() {
  const queryClient = useQueryClient();
  
  return useApiMutation(
    (id: number) => playerApi.remove(id),
    {
      onSuccess: (_data, id) => {
        queryClient.invalidateQueries({ queryKey: ['players'] });
        queryClient.removeQueries({ queryKey: ['player', id] });
      }
    }
  );
}