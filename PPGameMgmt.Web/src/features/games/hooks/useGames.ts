import { useApiQuery, useApiMutation, ApiError } from '../../../core/api';
import { CACHE_KEYS, STALE_TIMES } from '../../../core/api/cacheConfig';
import { Game, GameFilter } from '../types';
import { gameApi } from '../services';
import { handleApiError, ErrorDomain } from '../../../core/error';
import { useQueryClient } from '@tanstack/react-query';

/**
 * Custom hook for fetching a list of games with optional filtering
 */
export function useGames(filters?: GameFilter) {
  const queryClient = useQueryClient();

  // Main query to fetch games list
  const gamesQuery = useApiQuery<Game[]>(
    [CACHE_KEYS.GAMES, filters],
    () => gameApi.getAll(filters),
    {
      staleTime: STALE_TIMES.STANDARD,
    }
  );

  // Handle errors with more detailed information
  if (gamesQuery.error) {
    console.error('Error in useGames hook:', gamesQuery.error);
    handleApiError(gamesQuery.error, 'Failed to load games', {
      domain: ErrorDomain.GAME,
      showToast: true,
      logError: true
    });
  }

  // Mutation for creating a new game
  const createGame = useApiMutation<Game, Omit<Game, 'id'>>(
    (newGame) => gameApi.create(newGame),
    {
      onSuccess: (data) => {
        // Invalidate games list cache
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
        // Update single game cache
        queryClient.setQueryData([CACHE_KEYS.GAME, data.id], data);
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to create game'),
    }
  );

  // Mutation for updating a game
  const updateGame = useApiMutation<Game, { id: string, data: Partial<Game> }>(
    ({ id, data }) => gameApi.update(id, data),
    {
      onSuccess: (updatedGame) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
        queryClient.setQueryData([CACHE_KEYS.GAME, updatedGame.id], updatedGame);
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to update game'),
    }
  );

  // Mutation for deleting a game
  const deleteGame = useApiMutation<void, string>(
    (id) => gameApi.remove(id),
    {
      onSuccess: (_data, id) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.GAME, id] });
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to delete game'),
    }
  );

  // Mutation for toggling game status
  const toggleGameStatus = useApiMutation<Game, { id: string; isActive: boolean }>(
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
  );

  // Ensure games is always an array
  let games: Game[] = [];

  if (gamesQuery.data) {
    // Handle different response structures
    if (Array.isArray(gamesQuery.data)) {
      games = gamesQuery.data;
    } else if (gamesQuery.data && typeof gamesQuery.data === 'object') {
      const responseData = gamesQuery.data as any; // Type assertion to avoid TypeScript errors

      // Handle response with 'value' property
      if ('value' in responseData && Array.isArray(responseData.value)) {
        games = responseData.value;
      }
      // Handle response with 'data' property
      else if ('data' in responseData && Array.isArray(responseData.data)) {
        games = responseData.data;
      }
      // Handle response with isSuccess and data properties
      else if ('isSuccess' in responseData && 'data' in responseData && Array.isArray(responseData.data)) {
        games = responseData.data;
      }
    }
  }

  console.log('useGames processed games:', games);

  return {
    games,
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
export function useGame(id?: string) {
  const query = useApiQuery<Game>(
    [CACHE_KEYS.GAME, id],
    () => gameApi.getById(id as string),
    {
      enabled: !!id,
      staleTime: STALE_TIMES.STANDARD,
    }
  );

  // Handle errors with more detailed information
  if (query.error) {
    console.error('Error in useGame hook:', query.error);
    handleApiError(query.error, 'Failed to load game details', {
      domain: ErrorDomain.GAME,
      showToast: true,
      logError: true
    });
  }

  return query;
}

/**
 * Custom hook for creating a new game
 */
export function useCreateGame() {
  const queryClient = useQueryClient();

  return useApiMutation<Game, Omit<Game, 'id'>>(
    (gameData) => gameApi.create(gameData),
    {
      onSuccess: (newGame) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
        queryClient.setQueryData([CACHE_KEYS.GAME, newGame.id], newGame);
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to create game'),
    }
  );
}

/**
 * Custom hook for updating a game
 */
export function useUpdateGame() {
  const queryClient = useQueryClient();

  return useApiMutation<Game, { id: string, data: Partial<Game> }>(
    ({ id, data }) => gameApi.update(id, data),
    {
      onSuccess: (updatedGame) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
        queryClient.setQueryData([CACHE_KEYS.GAME, updatedGame.id], updatedGame);
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to update game'),
    }
  );
}

/**
 * Custom hook for deleting a game
 */
export function useDeleteGame() {
  const queryClient = useQueryClient();

  return useApiMutation<void, string>(
    (id) => gameApi.remove(id),
    {
      onSuccess: (_data, id) => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.GAMES] });
        queryClient.removeQueries({ queryKey: [CACHE_KEYS.GAME, id] });
      },
      onError: (error: ApiError) => handleApiError(error, 'Failed to delete game'),
    }
  );
}