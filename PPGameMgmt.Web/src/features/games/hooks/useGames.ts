import { useApiQuery, useApiMutation, createApiHelpers } from '../../../core/api';
import { Game, GameFilter } from '../types';
import { useQueryClient } from '@tanstack/react-query';

// Create API helpers for games resource
const gamesApi = {
  getList: createApiHelpers.getList<Game>('games'),
  getOne: createApiHelpers.getOne<Game>('games'),
  create: createApiHelpers.create<Game, Omit<Game, 'id'>>('games'),
  update: createApiHelpers.update<Game, Partial<Game>>('games'),
  remove: createApiHelpers.remove('games'),
  updateStatus: (id: number, isActive: boolean) => 
    createApiHelpers.patch<Game, { isActive: boolean }>('games')
      (id, { isActive })
};

// Hook for accessing game data and operations
export function useGames(filters?: GameFilter) {
  const queryClient = useQueryClient();

  // Query for fetching games list
  const gamesQuery = useApiQuery(
    ['games', filters], 
    () => gamesApi.getList(filters),
    {
      keepPreviousData: true,
      staleTime: 1000 * 60 * 5, // 5 minutes
    }
  );

  // Query function for getting a single game
  const getGame = (id: number) => {
    return useApiQuery(
      ['game', id],
      () => gamesApi.getOne(id),
      {
        enabled: !!id,
        staleTime: 1000 * 60 * 5, // 5 minutes
      }
    );
  };

  // Mutation for creating a new game
  const createGame = useApiMutation(
    (newGame: Omit<Game, 'id'>) => gamesApi.create(newGame),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['games'] });
        
        // Optionally, add the new game to the cache
        queryClient.setQueryData(['game', data.id], data);
      }
    }
  );

  // Mutation for updating a game
  const updateGame = useApiMutation(
    ({ id, gameData }: { id: number, gameData: Partial<Game> }) => 
      gamesApi.update(id, gameData),
    {
      onSuccess: (updatedGame) => {
        queryClient.invalidateQueries({ queryKey: ['games'] });
        queryClient.setQueryData(['game', updatedGame.id], updatedGame);
      }
    }
  );

  // Mutation for deleting a game
  const deleteGame = useApiMutation(
    (id: number) => gamesApi.remove(id),
    {
      onSuccess: (_data, id) => {
        queryClient.invalidateQueries({ queryKey: ['games'] });
        queryClient.removeQueries({ queryKey: ['game', id] });
      }
    }
  );

  // Mutation for toggling game status
  const toggleGameStatus = useApiMutation(
    ({ id, isActive }: { id: number; isActive: boolean }) => 
      gamesApi.updateStatus(id, isActive),
    {
      onSuccess: (updatedGame) => {
        queryClient.invalidateQueries({ queryKey: ['games'] });
        queryClient.setQueryData(['game', updatedGame.id], updatedGame);
      },
      // Enable optimistic updates for better UX
      onMutate: async ({ id, isActive }) => {
        // Cancel any outgoing refetches so they don't overwrite our optimistic update
        await queryClient.cancelQueries({ queryKey: ['game', id] });
        
        // Snapshot the previous game
        const previousGame = queryClient.getQueryData(['game', id]);
        
        // Optimistically update the cache
        if (previousGame) {
          queryClient.setQueryData(['game', id], {
            ...previousGame,
            isActive
          });
        }
        
        return { previousGame };
      },
      onError: (_error, { id }, context) => {
        // If the mutation fails, revert to the previous value
        if (context?.previousGame) {
          queryClient.setQueryData(['game', id], context.previousGame);
        }
      }
    }
  );
  
  return {
    games: gamesQuery.data || [],
    isLoading: gamesQuery.isLoading,
    isError: gamesQuery.isError,
    error: gamesQuery.error,
    getGame,
    createGame,
    updateGame,
    deleteGame,
    toggleGameStatus,
    refetch: gamesQuery.refetch
  };
}