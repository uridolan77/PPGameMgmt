import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../core/api';
import { Game, GameFilter } from '../types';

export function useGames(filters?: GameFilter) {
  const queryClient = useQueryClient();
  
  // Fetch games list with optional filtering
  const gamesQuery = useQuery({
    queryKey: ['games', filters],
    queryFn: async () => {
      return apiClient.get<Game[]>('/api/games', filters);
    }
  });

  // Fetch a single game by ID
  const getGame = (id: number) => {
    return useQuery({
      queryKey: ['game', id],
      queryFn: async () => {
        return apiClient.get<Game>(`/api/games/${id}`);
      },
      enabled: !!id
    });
  };

  // Create a new game
  const createGame = useMutation({
    mutationFn: (newGame: Omit<Game, 'id'>) => {
      return apiClient.post<Game>('/api/games', newGame);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    }
  });

  // Update an existing game
  const updateGame = useMutation({
    mutationFn: (game: Game) => {
      return apiClient.put<Game>(`/api/games/${game.id}`, game);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game', data.id] });
    }
  });

  // Delete a game
  const deleteGame = useMutation({
    mutationFn: (id: number) => {
      return apiClient.delete<void>(`/api/games/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
    }
  });

  // Toggle game active status
  const toggleGameStatus = useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) => {
      return apiClient.patch<Game>(`/api/games/${id}/status`, { isActive });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['games'] });
      queryClient.invalidateQueries({ queryKey: ['game', data.id] });
    }
  });
  
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