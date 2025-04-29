using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Models;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for BonusClaim repository operations
    /// </summary>
    public interface IBonusClaimRepository : IRepository<BonusClaim>
    {
        /// <summary>
        /// Gets a bonus claim by string ID (overload of the Guid version from IRepository)
        /// </summary>
        /// <param name="id">The bonus claim's string identifier</param>
        /// <returns>BonusClaim entity if found</returns>
        Task<BonusClaim> GetByIdAsync(string id);

        /// <summary>
        /// Gets all active bonus claims for a player
        /// </summary>
        /// <param name="playerId">The player's unique identifier</param>
        /// <returns>Collection of active bonus claims</returns>
        Task<IEnumerable<BonusClaim>> GetActiveClaimsByPlayerIdAsync(string playerId);

        /// <summary>
        /// Gets all claims for a specific bonus
        /// </summary>
        /// <param name="bonusId">The bonus's unique identifier</param>
        /// <returns>Collection of bonus claims</returns>
        Task<IEnumerable<BonusClaim>> GetClaimsByBonusIdAsync(string bonusId);

        /// <summary>
        /// Gets paged bonus claims for a player
        /// </summary>
        /// <param name="playerId">The player's unique identifier</param>
        /// <param name="parameters">Pagination parameters</param>
        /// <returns>Paged result containing bonus claims</returns>
        Task<PagedResult<BonusClaim>> GetClaimsByPlayerIdPagedAsync(string playerId, PaginationParameters parameters);

        /// <summary>
        /// Gets all claims with a specific status
        /// </summary>
        /// <param name="status">The status to filter by</param>
        /// <returns>Collection of bonus claims with the specified status</returns>
        Task<IEnumerable<BonusClaim>> GetClaimsByStatusAsync(BonusClaimStatus status);

        /// <summary>
        /// Updates the wagering progress for a bonus claim
        /// </summary>
        /// <param name="claimId">The claim's unique identifier</param>
        /// <param name="newProgress">The new wagering progress value</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task UpdateWageringProgressAsync(string claimId, decimal newProgress);

        /// <summary>
        /// Updates the status of a bonus claim
        /// </summary>
        /// <param name="claimId">The claim's unique identifier</param>
        /// <param name="newStatus">The new status</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task UpdateStatusAsync(string claimId, BonusClaimStatus newStatus);

        /// <summary>
        /// Checks if a bonus claim exists
        /// </summary>
        /// <param name="claimId">The claim's unique identifier</param>
        /// <returns>True if the claim exists, false otherwise</returns>
        Task<bool> ClaimExistsAsync(string claimId);
        
        /// <summary>
        /// Gets recent bonus claims for a player
        /// </summary>
        /// <param name="playerId">The player's unique identifier</param>
        /// <param name="daysToLookBack">Number of days to look back</param>
        /// <returns>Collection of recent bonus claims</returns>
        Task<IEnumerable<BonusClaim>> GetRecentClaimsByPlayerIdAsync(string playerId, int daysToLookBack = 30);
    }
}