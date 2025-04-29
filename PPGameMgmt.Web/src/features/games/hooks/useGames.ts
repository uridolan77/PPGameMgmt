import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

// Game interfaces
interface Game {
  id: string;
  name: string;
  provider: string;
  category: string;
  type: string;
  releaseDate: string;
  popularity: number;
  status: 'active' | 'inactive' | 'maintenance';
  description?: string;
  genre?: string;
  developer?: string;
  publisher?: string;
  features?: string[];
  rtp?: number;
  volatility?: string;
  minBet?: number;
  maxBet?: number;
  maxWin?: string;
  platforms?: string[];
  languages?: string[];
}

interface GameSession {
  id: string;
  playerId: string;
  playerName: string;
  startTime: string;
  endTime: string | null;
  duration: number;
  betAmount: number;
  winAmount: number;
}

interface StatPoint {
  date: string;
  value: number;
}

// API functions
const API_URL = '/api';
const gameService = {
  getAllGames: async () => {
    const response = await axios.get(`${API_URL}/games`);
    return response.data;
  },
  
  getGameById: async (id: string) => {
    const response = await axios.get(`${API_URL}/games/${id}`);
    return response.data;
  },
  
  getGameSessions: async (gameId: string) => {
    const response = await axios.get(`${API_URL}/games/${gameId}/sessions`);
    return response.data;
  },
  
  getGamePopularityStats: async (gameId: string) => {
    const response = await axios.get(`${API_URL}/games/${gameId}/popularity-stats`);
    return response.data;
  },
  
  getGameRevenueStats: async (gameId: string) => {
    const response = await axios.get(`${API_URL}/games/${gameId}/revenue-stats`);
    return response.data;
  },
  
  createGame: async (gameData: Omit<Game, 'id'>) => {
    const response = await axios.post(`${API_URL}/games`, gameData);
    return response.data;
  },
  
  updateGame: async (id: string, gameData: Partial<Game>) => {
    const response = await axios.put(`${API_URL}/games/${id}`, gameData);
    return response.data;
  },
  
  deleteGame: async (id: string) => {
    const response = await axios.delete(`${API_URL}/games/${id}`);
    return response.data;
  }
};

// Query keys
export const gameKeys = {
  all: ['games'] as const,
  detail: (id: string) => [...gameKeys.all, 'detail', id] as const,
  sessions: (id: string) => [...gameKeys.all, 'sessions', id] as const,
  popularityStats: (id: string) => [...gameKeys.all, 'popularity-stats', id] as const,
  revenueStats: (id: string) => [...gameKeys.all, 'revenue-stats', id] as const,
};

// Hooks for fetching games
export function useGames() {
  return useQuery<Game[]>({
    queryKey: gameKeys.all,
    queryFn: gameService.getAllGames,
  });
}

export function useGame(id?: string) {
  return useQuery<Game>({
    queryKey: gameKeys.detail(id || ''),
    queryFn: () => gameService.getGameById(id || ''),
    enabled: !!id,
  });
}

export function useGameSessions(gameId?: string) {
  return useQuery<GameSession[]>({
    queryKey: gameKeys.sessions(gameId || ''),
    queryFn: () => gameService.getGameSessions(gameId || ''),
    enabled: !!gameId,
  });
}

export function useGamePopularityStats(gameId?: string) {
  return useQuery<StatPoint[]>({
    queryKey: gameKeys.popularityStats(gameId || ''),
    queryFn: () => gameService.getGamePopularityStats(gameId || ''),
    enabled: !!gameId,
  });
}

export function useGameRevenueStats(gameId?: string) {
  return useQuery<StatPoint[]>({
    queryKey: gameKeys.revenueStats(gameId || ''),
    queryFn: () => gameService.getGameRevenueStats(gameId || ''),
    enabled: !!gameId,
  });
}

// Mutation hooks for modifying games
export function useCreateGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (gameData: Omit<Game, 'id'>) => gameService.createGame(gameData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, gameData }: { id: string, gameData: Partial<Game> }) => 
      gameService.updateGame(id, gameData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => gameService.deleteGame(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
    },
  });
}