export * from './useBonuses';
export * from './useBonusClaims';

// Export the API hook facades
export { useBonusApi } from './useBonusApi';

// Export the new V2 API hooks
export {
  useBonusesQuery,
  useBonusQuery,
  useCreateBonusMutation,
  useUpdateBonusMutation,
  useDeleteBonusMutation,
  useBonusStats,
  useBonusClaimsQuery,
  useBonusClaimQuery,
  useBonusClaimsByPlayer,
  useBonusClaimsByBonus,
  useCreateBonusClaimMutation,
  useUpdateBonusClaimMutation,
  useDeleteBonusClaimMutation,
  useBonusApiV2
} from './useBonusApiV2';