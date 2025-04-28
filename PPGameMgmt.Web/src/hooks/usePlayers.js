import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { playerApi } from '../services/api';

// Hook for fetching all players
export function usePlayers(segment = null) {
  return useQuery({
    queryKey: ['players', { segment }],
    queryFn: async () => {
      const response = await playerApi.getAll(segment);
      return response.data || [];
    }
  });
}

// Hook for fetching a single player
export function usePlayer(playerId) {
  return useQuery({
    queryKey: ['player', playerId],
    queryFn: async () => {
      if (!playerId) return null;
      const response = await playerApi.getById(playerId);
      return response.data;
    },
    enabled: !!playerId
  });
}

// Hook for fetching player features
export function usePlayerFeatures(playerId) {
  return useQuery({
    queryKey: ['playerFeatures', playerId],
    queryFn: async () => {
      if (!playerId) return null;
      const response = await playerApi.getFeatures(playerId);
      return response.data;
    },
    enabled: !!playerId
  });
}

// Hook for fetching player game sessions
export function usePlayerGameSessions(playerId) {
  return useQuery({
    queryKey: ['playerGameSessions', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      const response = await playerApi.getGameSessions(playerId);
      return response.data || [];
    },
    enabled: !!playerId
  });
}

// Hook for fetching player bonus claims
export function usePlayerBonusClaims(playerId) {
  return useQuery({
    queryKey: ['playerBonusClaims', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      const response = await playerApi.getBonusClaims(playerId);
      return response.data || [];
    },
    enabled: !!playerId
  });
}

// Mutation hook for creating a player
export function useCreatePlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (playerData) => playerApi.create(playerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    }
  });
}

// Mutation hook for updating a player
export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => playerApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['player', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['players'] });
    }
  });
}

// Mutation hook for deleting a player
export function useDeletePlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => playerApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.removeQueries({ queryKey: ['player', id] });
    }
  });
}