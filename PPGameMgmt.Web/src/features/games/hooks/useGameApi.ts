import { useQueryClient } from '@tanstack/react-query';
import { useApiQuery, useApiMutation, ApiError } from '../../../core/api';
import { gameApi } from '../services';
import { Game, GameFilter } from '../types';
import { DataCategory } from '../../../core/api/reactQueryConfig';
import { handleApiError } from '../../../core/error/globalErrorHandler';

// Constants for query configuration
const CACHE_KEYS = {
  GAMES: 'games',
  GAME: 'game',
  GAME_STATS: 'game-stats',
  GAME_REVIEWS: 'game-reviews'
};

const STALE_TIMES = {
  STANDARD: 1000 * 60 * 5, // 5 minutes
  SHORT: 1000 * 60 * 2,    // 2 minutes
  LONG: 1000 * 60 * 15     // 15 minutes
};

/**
 * A dedicated API hook facade for game-related API operations
 * This provides a consistent interface for all game-related data fetching
 */
export function useGameApi() {
  const queryClient = useQueryClient();
  
  return {
    /**
     * Get all games with optional filtering
     */
    getGames: (filters?: GameFilter) => 
      useApiQuery<Game[]>(
        [CACHE_KEYS.GAMES, filters],
        () => gameApi.getAll(filters),
        {
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.GAME
        }
      ),
    
    /**
     * Get a single game by ID
     */
    getGame: (gameId?: number | string) => {
      const numericId = gameId ? parseInt(gameId.toString(), 10) : undefined;
      
      return useApiQuery<Game>(
        [CACHE_KEYS.GAME, numericId],
        () => gameApi.getById(numericId as number),
        {
          enabled: !!numericId,
          staleTime: STALE_TIMES.STANDARD,
          category: DataCategory.GAME
        }
      );
    },
    
    /**
     * Create a new game
     */
    createGame: () => 
      useApiMutation<Game, Omit<Game, 'id'>>(
        (gameData) => gameApi.create(gameData),
        {
          onSuccess: (newGame) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
            queryClient.setQueryData([CACHE_KEYS.GAME, newGame.id], newGame);
          },
          onError: (error: ApiError) => handleApiError(error, 'Failed to create game')
        }
      ),
    
    /**
     * Update an existing game
     */
    updateGame: () => 
      useApiMutation<Game, { id: number, data: Partial<Game> }>(
        ({ id, data }) => gameApi.update(id, data),
        {
          onSuccess: (updatedGame) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
            queryClient.setQueryData([CACHE_KEYS.GAME, updatedGame.id], updatedGame);
          },
          onError: (error: ApiError) => handleApiError(error, 'Failed to update game')
        }
      ),
    
    /**
     * Delete a game
     */
    deleteGame: () => 
      useApiMutation<void, number>(
        (id) => gameApi.remove(id),
        {
          onSuccess: (_data, id) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
            queryClient.removeQueries({ queryKey: [CACHE_KEYS.GAME, id] });
          },
          onError: (error: ApiError) => handleApiError(error, 'Failed to delete game')
        }
      ),
    
    /**
     * Toggle game status (active/inactive)
     */
    toggleGameStatus: () => 
      useApiMutation<Game, { id: number; isActive: boolean }>(
        ({ id, isActive }) => gameApi.updateStatus(id, isActive),
        {
          onSuccess: (updatedGame) => {
            queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
            queryClient.setQueryData([CACHE_KEYS.GAME, updatedGame.id], updatedGame);
          },
          // Enable optimistic updates for better UX
          onMutate: async ({ id, isActive }) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: [CACHE_KEYS.GAME, id] });
            
            // Snapshot the previous game
            const previousGame = queryClient.getQueryData<Game>([CACHE_KEYS.GAME, id]);
            
            // Optimistically update the cache
            if (previousGame) {
              queryClient.setQueryData<Game>([CACHE_KEYS.GAME, id], {
                ...previousGame,
                isActive
              });
            }
            
            return { previousGame };
          },
          onError: (error: ApiError, { id }, context: any) => {
            // If the mutation fails, revert to the previous value
            if (context?.previousGame) {
              queryClient.setQueryData([CACHE_KEYS.GAME, id], context.previousGame);
            }
            handleApiError(error, 'Failed to update game status');
          }
        }
      )
  };
}

export default useGameApi;
