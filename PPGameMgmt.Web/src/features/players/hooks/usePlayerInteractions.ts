import { useQueryClient } from '@tanstack/react-query';
import { useApiMutation } from '../../../core/api';
import { CACHE_KEYS } from '../../../core/api/cacheConfig';
import { playerApi } from '../services';
import { usePlayer, usePlayerGameSessions } from './usePlayers';

/**
 * Hook for managing player interactions
 * Provides functionality for interactions like sending messages, rewards, etc.
 */
export function usePlayerInteractions(playerId?: number) {
  const { data: player } = usePlayer(playerId);
  const { data: gameSessions } = usePlayerGameSessions(playerId);
  const queryClient = useQueryClient();
  
  // Send a message to the player
  const sendMessage = useApiMutation(
    (message: string) => playerApi.sendMessage(playerId as number, message),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYER, playerId] });
      }
    }
  );
  
  // Award bonus to the player
  const awardBonus = useApiMutation(
    (bonusData: { amount: number, reason: string }) => 
      playerApi.awardBonus(playerId as number, bonusData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYER, playerId] });
        queryClient.invalidateQueries({ queryKey: [CACHE_KEYS.PLAYER_BONUS_CLAIMS, playerId] });
      }
    }
  );
  
  // Check if the player is currently active in any game
  const isActiveInGame = !!gameSessions?.some(session => session.isActive);
  
  return {
    player,
    isActiveInGame,
    sendMessage,
    awardBonus,
  };
}

export default usePlayerInteractions;