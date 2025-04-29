import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Player interfaces
interface Player {
  id: number;
  username: string;
  email: string;
  playerLevel: number;
  isActive: boolean;
  segment?: string;
  lastLogin?: string;
}

interface PlayerFeature {
  id: number;
  name: string;
  isEnabled: boolean;
}

interface PlayerGameSession {
  id: number;
  gameId: number;
  gameName: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  betAmount: number;
  winAmount: number;
}

interface PlayerBonusClaim {
  id: number;
  bonusId: number;
  bonusName: string;
  claimDate: string;
  status: string;
  value: number;
}

// API Client with base URL
const API_URL = '/api';
const playerApi = {
  getAll: (segment?: string) => 
    axios.get(`${API_URL}/players${segment ? `?segment=${segment}` : ''}`),
  getById: (id: number) => 
    axios.get(`${API_URL}/players/${id}`),
  getFeatures: (id: number) => 
    axios.get(`${API_URL}/players/${id}/features`),
  getGameSessions: (id: number) => 
    axios.get(`${API_URL}/players/${id}/game-sessions`),
  getBonusClaims: (id: number) => 
    axios.get(`${API_URL}/players/${id}/bonus-claims`),
  create: (data: Omit<Player, 'id'>) => 
    axios.post(`${API_URL}/players`, data),
  update: (id: number, data: Partial<Player>) => 
    axios.put(`${API_URL}/players/${id}`, data),
  delete: (id: number) => 
    axios.delete(`${API_URL}/players/${id}`)
};

// Hook for fetching all players
export function usePlayers(segment?: string) {
  return useQuery<Player[]>({
    queryKey: ['players', { segment }],
    queryFn: async () => {
      const response = await playerApi.getAll(segment);
      return response.data || [];
    }
  });
}

// Hook for fetching a single player
export function usePlayer(playerId?: number) {
  return useQuery<Player | null>({
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
export function usePlayerFeatures(playerId?: number) {
  return useQuery<PlayerFeature[] | null>({
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
export function usePlayerGameSessions(playerId?: number) {
  return useQuery<PlayerGameSession[]>({
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
export function usePlayerBonusClaims(playerId?: number) {
  return useQuery<PlayerBonusClaim[]>({
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
    mutationFn: (playerData: Omit<Player, 'id'>) => playerApi.create(playerData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
    }
  });
}

// Mutation hook for updating a player
export function useUpdatePlayer() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Player> }) => playerApi.update(id, data),
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
    mutationFn: (id: number) => playerApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['players'] });
      queryClient.removeQueries({ queryKey: ['player', id] });
    }
  });
}