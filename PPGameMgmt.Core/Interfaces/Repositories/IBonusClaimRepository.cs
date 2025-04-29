using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities.Bonuses;
using PPGameMgmt.Core.Models;

namespace PPGameMgmt.Core.Interfaces.Repositories
{
    public interface IBonusClaimRepository : IRepository<BonusClaim>
    {
        Task<BonusClaim> GetByIdAsync(string id);
        Task<IEnumerable<BonusClaim>> GetActiveClaimsByPlayerIdAsync(string playerId);
        Task<IEnumerable<BonusClaim>> GetClaimsByBonusIdAsync(string bonusId);
        Task<PagedResult<BonusClaim>> GetClaimsByPlayerIdPagedAsync(string playerId, PaginationParameters parameters);
        Task<IEnumerable<BonusClaim>> GetClaimsByStatusAsync(BonusClaimStatus status);
        Task UpdateWageringProgressAsync(string claimId, decimal newProgress);
        Task UpdateStatusAsync(string claimId, BonusClaimStatus status);
        Task<bool> ClaimExistsAsync(string claimId);
        Task<IEnumerable<BonusClaim>> GetRecentClaimsByPlayerIdAsync(string playerId, int daysToLookBack = 30);
    }
}
