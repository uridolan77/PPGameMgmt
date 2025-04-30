import { useNavigate } from 'react-router-dom';
import { useStore } from '../../../core,store';
import { useDeletePlayer, useUpdatePlayer } from './usePlayers';
import { Player } from '../types';
import { handleApiError } from '../../../core,error';

/**
 * Custom hook providing common player-related actions and navigation
 */
export function usePlayerActions() {
  const navigate = useNavigate();
  const { ui } = useStore();
  const deletePlayer = useDeletePlayer();
  const updatePlayer = useUpdatePlayer();

  /**
   * Navigate to the player detail page
   */
  const goToPlayerDetail = (playerId: number) => {
    navigate(`/players/${playerId}`);
  };

  /**
   * Navigate to the player edit page
   */
  const goToPlayerEdit = (playerId: number) => {
    navigate(`/players/edit/${playerId}`);
  };

  /**
   * Navigate to the players list page
   */
  const goToPlayersList = () => {
    navigate('/players');
  };

  /**
   * Toggle a player's active status
   */
  const togglePlayerStatus = (player: Player) => {
    const newStatus = !player.isActive;

    updatePlayer.mutate(
      {
        id: player.id,
        data: { isActive: newStatus }
      },
      {
        onSuccess: () => {
          ui.addNotification({
            type: 'success',
            message: `Player ${player.username} ${newStatus ? 'activated' : 'deactivated'} successfully.`,
            autoClose: true,
          });
        },
        onError: (error) => {
          handleApiError(error, 'Failed to update player status');
        },
      }
    );
  };

  /**
   * Delete a player with confirmation
   */
  const confirmDeletePlayer = (player: Player) => {
    // In a real app, we would show a confirmation dialog here
    if (window.confirm(`Are you sure you want to delete ${player.username}?`)) {
      deletePlayer.mutate(player.id, {
        onSuccess: () => {
          ui.addNotification({
            type: 'success',
            message: `Player ${player.username} deleted successfully.`,
            autoClose: true,
          });
          goToPlayersList();
        },
        onError: (error) => {
          handleApiError(error, 'Failed to delete player');
        },
      });
    }
  };

  return {
    goToPlayerDetail,
    goToPlayerEdit,
    goToPlayersList,
    togglePlayerStatus,
    confirmDeletePlayer,
    isDeleting: deletePlayer.isPending,
    isUpdating: updatePlayer.isPending,
  };
}