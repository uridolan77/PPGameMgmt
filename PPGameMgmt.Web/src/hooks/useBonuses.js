import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bonusApi } from '../services/api';

// Hook for fetching all bonuses
export function useBonuses(type = null, segment = null, gameId = null) {
  return useQuery({
    queryKey: ['bonuses', { type, segment, gameId }],
    queryFn: async () => {
      const response = await bonusApi.getAll();
      let data = response.data || [];
      
      // Apply filters if provided
      if (type || segment || gameId) {
        data = data.filter(bonus => {
          let matches = true;
          if (type && bonus.type !== type) matches = false;
          if (segment && bonus.targetSegment !== segment) matches = false;
          if (gameId && bonus.relatedGameId !== gameId) matches = false;
          return matches;
        });
      }
      
      return data;
    }
  });
}

// Hook for fetching a single bonus
export function useBonus(bonusId) {
  return useQuery({
    queryKey: ['bonus', bonusId],
    queryFn: async () => {
      if (!bonusId) return null;
      const response = await bonusApi.getById(bonusId);
      return response.data;
    },
    enabled: !!bonusId
  });
}

// Hook for fetching active bonuses
export function useActiveBonuses() {
  return useQuery({
    queryKey: ['bonuses', 'active'],
    queryFn: async () => {
      const response = await bonusApi.getActive();
      return response.data || [];
    }
  });
}

// Mutation hook for creating a bonus
export function useCreateBonus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (bonusData) => bonusApi.create(bonusData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
    }
  });
}

// Mutation hook for updating a bonus
export function useUpdateBonus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }) => bonusApi.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['bonus', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
    }
  });
}

// Mutation hook for deleting a bonus
export function useDeleteBonus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id) => bonusApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['bonuses'] });
      queryClient.removeQueries({ queryKey: ['bonus', id] });
    }
  });
}

// Mutation hook for claiming a bonus
export function useClaimBonus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ playerId, bonusId }) => bonusApi.claim(playerId, bonusId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['playerBonusClaims', variables.playerId] });
      queryClient.invalidateQueries({ queryKey: ['bonus', variables.bonusId] });
    }
  });
}