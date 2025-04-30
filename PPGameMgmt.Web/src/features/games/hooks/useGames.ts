import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Game, GameFilter } from '../types';
import { gameService } from '../services';
import { handleApiError } from '../../../shared/utils/errorHandling';

// Cache keys for React Query
const CACHE_KEYS = {
  GAMES: 'games',
  GAME: 'game',
}

// Stale times for caching
const STALE_TIMES = {
  STANDARD: 1000 * 60 * 5, // 5 minutes
}

/**
 * Custom hook for fetching a list of games with optional filtering
 */
export function useGames(filters?: GameFilter) {
  const queryClient = useQueryClient();

  // Main query to fetch games list
  const gamesQuery = useQuery({
    queryKey: [CACHE_KEYS.GAMES, filters],
    queryFn: () => gameService.getGames(filters),
    keepPreviousData: true,
    staleTime: STALE_TIMES.STANDARD,
    onError: (error) => handleApiError(error, 'Failed to load games'),
  });

  // Mutation for creating a new game
  const createGame = useMutation({
    mutationFn: (newGame: Omit<Game, 'id'>) => gameService.createGame(newGame),
    onSuccess: (data) => {
      // Invalidate games list cache
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
      // Update single game cache
      queryClient.setQueryData([CACHE_KEYS.GAME, data.id], data);
    },
    onError: (error) => handleApiError(error, 'Failed to create game'),
  });

  // Mutation for updating a game
  const updateGame = useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Game> }) => 
      gameService.updateGame(id, data),
    onSuccess: (updatedGame) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
      queryClient.setQueryData([CACHE_KEYS.GAME, updatedGame.id], updatedGame);
    },
    onError: (error) => handleApiError(error, 'Failed to update game'),
  });

  // Mutation for deleting a game
  const deleteGame = useMutation({
    mutationFn: (id: number) => gameService.deleteGame(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
      queryClient.removeQueries({ queryKey: [CACHE_KEYS.GAME, id] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete game'),
  });

  // Mutation for toggling game status
  const toggleGameStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => 
      gameService.updateGameStatus(id, isActive),
    onSuccess: (updatedGame) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
      queryClient.setQueryData([CACHE_KEYS.GAME, updatedGame.id], updatedGame);
    },
    // Enable optimistic updates for better UX
    onMutate: async ({ id, isActive }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [CACHE_KEYS.GAME, id] });
      
      // Snapshot the previous game
      const previousGame = queryClient.getQueryData([CACHE_KEYS.GAME, id]);
      
      // Optimistically update the cache
      if (previousGame) {
        queryClient.setQueryData([CACHE_KEYS.GAME, id], {
          ...previousGame,
          isActive
        });
      }
      
      return { previousGame };
    },
    onError: (error, { id }, context) => {
      // If the mutation fails, revert to the previous value
      if (context?.previousGame) {
        queryClient.setQueryData([CACHE_KEYS.GAME, id], context.previousGame);
      }
      handleApiError(error, 'Failed to update game status');
    }
  });
  
  return {
    games: gamesQuery.data || [],
    isLoading: gamesQuery.isLoading,
    isError: gamesQuery.isError,
    error: gamesQuery.error,
    createGame,
    updateGame,
    deleteGame,
    toggleGameStatus,
    refetch: gamesQuery.refetch
  };
}

/**
 * Custom hook for fetching a single game by ID
 */
export function useGame(id?: number | string) {
  const numericId = id ? parseInt(id.toString(), 10) : undefined;
  
  return useQuery({
    queryKey: [CACHE_KEYS.GAME, numericId],
    queryFn: () => gameService.getGame(numericId as number),
    enabled: !!numericId,
    staleTime: STALE_TIMES.STANDARD,
    onError: (error) => handleApiError(error, 'Failed to load game details'),
  });
}

/**
 * Custom hook for creating a new game
 */
export function useCreateGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (gameData: Omit<Game, 'id'>) => gameService.createGame(gameData),
    onSuccess: (newGame) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
      queryClient.setQueryData([CACHE_KEYS.GAME, newGame.id], newGame);
    },
    onError: (error) => handleApiError(error, 'Failed to create game'),
  });
}

/**
 * Custom hook for updating a game
 */
export function useUpdateGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: number, data: Partial<Game> }) => 
      gameService.updateGame(id, data),
    onSuccess: (updatedGame) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
      queryClient.setQueryData([CACHE_KEYS.GAME, updatedGame.id], updatedGame);
    },
    onError: (error) => handleApiError(error, 'Failed to update game'),
  });
}

/**
 * Custom hook for deleting a game
 */
export function useDeleteGame() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: number) => gameService.deleteGame(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
      queryClient.removeQueries({ queryKey: [CACHE_KEYS.GAME, id] });
    },
    onError: (error) => handleApiError(error, 'Failed to delete game'),
  });
}