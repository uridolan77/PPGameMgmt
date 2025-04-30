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

// Export the V2 API hooks
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

// Export the enhanced V3 API hooks with validation
export {
  usePlayerApiV3,
  usePlayersQueryV3,
  usePlayerQueryV3,
  usePlayerFeaturesV3,
  usePlayerGameSessionsV3,
  usePlayerBonusClaimsV3,
  useCreatePlayerMutationV3,
  useUpdatePlayerMutationV3,
  useDeletePlayerMutationV3,
  useTogglePlayerStatusV3
} from './usePlayerApiV3';