import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { recommendationApi } from '../services/api';

// Hook for fetching all recommendations for a player
export function usePlayerRecommendations(playerId) {
  return useQuery({
    queryKey: ['recommendations', playerId],
    queryFn: async () => {
      if (!playerId) return { games: [], bonuses: [] };
      const response = await recommendationApi.getForPlayer(playerId);
      return response.data || { games: [], bonuses: [] };
    },
    enabled: !!playerId
  });
}

// Hook for fetching game recommendations for a player
export function useGameRecommendations(playerId) {
  return useQuery({
    queryKey: ['recommendations', 'games', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      const response = await recommendationApi.getGameRecommendations(playerId);
      return response.data || [];
    },
    enabled: !!playerId
  });
}

// Hook for fetching bonus recommendations for a player
export function useBonusRecommendations(playerId) {
  return useQuery({
    queryKey: ['recommendations', 'bonuses', playerId],
    queryFn: async () => {
      if (!playerId) return [];
      const response = await recommendationApi.getBonusRecommendations(playerId);
      return response.data || [];
    },
    enabled: !!playerId
  });
}

// Mutation hook for recording recommendation clicks
export function useRecordRecommendationClick() {
  return useMutation({
    mutationFn: (recommendationId) => 
      fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:7001/api'}/recommendations/${recommendationId}/click`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      })
  });
}

// Mutation hook for recording recommendation acceptances
export function useRecordRecommendationAcceptance() {
  return useMutation({
    mutationFn: (recommendationId) => 
      fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:7001/api'}/recommendations/${recommendationId}/accept`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      })
  });
}

// Hook to refresh recommendations for a player
export function useRefreshRecommendations() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (playerId) => 
      fetch(`${import.meta.env.VITE_API_URL || 'https://localhost:7001/api'}/recommendations/player/${playerId}/refresh`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
          'Content-Type': 'application/json'
        }
      }),
    onSuccess: (_, playerId) => {
      // Invalidate all recommendations for this player
      queryClient.invalidateQueries({ queryKey: ['recommendations', playerId] });
      queryClient.invalidateQueries({ queryKey: ['recommendations', 'games', playerId] });
      queryClient.invalidateQueries({ queryKey: ['recommendations', 'bonuses', playerId] });
    }
  });
}