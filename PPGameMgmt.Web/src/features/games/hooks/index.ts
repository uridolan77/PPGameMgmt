export {
  useGames,
  useGame,
  useCreateGame,
  useUpdateGame,
  useDeleteGame
} from './useGames';

// Export the API hook facades
export { useGameApi } from './useGameApi';

// Export the new V2 API hooks
export {
  useGamesQuery,
  useGameQuery,
  useCreateGameMutation,
  useUpdateGameMutation,
  useDeleteGameMutation,
  useToggleGameStatus,
  useGameApiV2
} from './useGameApiV2';