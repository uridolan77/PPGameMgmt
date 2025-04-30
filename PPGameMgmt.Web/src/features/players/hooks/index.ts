export {
  usePlayers,
  usePlayer,
  usePlayerFeatures,
  usePlayerGameSessions,
  usePlayerBonusClaims,
  useCreatePlayer,
  useUpdatePlayer,
  useDeletePlayer
} from './usePlayers';

export { usePlayerActions } from './usePlayerActions';

// Export the API hook facades
export { usePlayerApi } from './usePlayerApi';

// Export the new V2 API hooks
export {
  usePlayersQuery,
  usePlayerQuery,
  usePlayerFeatures as usePlayerFeaturesV2,
  usePlayerGameSessions as usePlayerGameSessionsV2,
  usePlayerBonusClaims as usePlayerBonusClaimsV2,
  useCreatePlayerMutation,
  useUpdatePlayerMutation,
  useDeletePlayerMutation,
  useTogglePlayerStatus,
  usePlayerApi as usePlayerApiV2
} from './usePlayerApiV2';