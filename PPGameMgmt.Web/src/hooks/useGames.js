import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import gameService from '../services/gameService';

// Query keys
export const gameKeys = {
  all: ['games'],
  detail: (id) => [...gameKeys.all, 'detail', id],
  sessions: (id) => [...gameKeys.all, 'sessions', id],
  popularityStats: (id) => [...gameKeys.all, 'popularity-stats', id],
  revenueStats: (id) => [...gameKeys.all, 'revenue-stats', id],
};

// Hooks for fetching games
export function useGames() {
  return useQuery({
    queryKey: gameKeys.all,
    queryFn: gameService.getAllGames,
  });
}

export function useGame(id) {
  return useQuery({
    queryKey: gameKeys.detail(id),
    queryFn: () => gameService.getGameById(id),
    enabled: !!id,
  });
}

export function useGameSessions(gameId) {
  return useQuery({
    queryKey: gameKeys.sessions(gameId),
    queryFn: () => gameService.getGameSessions(gameId),
    enabled: !!gameId,
  });
}

export function useGamePopularityStats(gameId) {
  return useQuery({
    queryKey: gameKeys.popularityStats(gameId),
    queryFn: () => gameService.getGamePopularityStats(gameId),
    enabled: !!gameId,
  });
}

export function useGameRevenueStats(gameId) {
  return useQuery({
    queryKey: gameKeys.revenueStats(gameId),
    queryFn: () => gameService.getGameRevenueStats(gameId),
    enabled: !!gameId,
  });
}

// Mutation hooks for modifying games
export function useCreateGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: gameService.createGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
    },
  });
}

export function useUpdateGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, gameData }) => gameService.updateGame(id, gameData),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: gameKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
    },
  });
}

export function useDeleteGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: gameService.deleteGame,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameKeys.all });
    },
  });
}