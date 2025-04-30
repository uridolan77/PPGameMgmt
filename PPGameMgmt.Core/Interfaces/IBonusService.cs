using System.Collections.Generic;
using System.Threading.Tasks;
// Use namespace aliases to distinguish between ambiguous types
using CoreEntities = PPGameMgmt.Core.Entities;
using BonusEntities = PPGameMgmt.Core.Entities.Bonuses;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for bonus service
    /// </summary>
    public interface IBonusService
    {
        /// <summary>
        /// Gets a bonus by ID
        /// </summary>
        Task<BonusEntities.Bonus> GetBonusAsync(string bonusId);
        
        /// <summary>
        /// Gets all active bonuses
        /// </summary>
        Task<IEnumerable<BonusEntities.Bonus>> GetAllActiveBonusesAsync();
        
        /// <summary>
        /// Gets bonuses by type
        /// </summary>
        Task<IEnumerable<BonusEntities.Bonus>> GetBonusesByTypeAsync(BonusEntities.BonusType type);
        
        /// <summary>
        /// Gets bonuses for a player segment
        /// </summary>
        Task<IEnumerable<BonusEntities.Bonus>> GetBonusesForPlayerSegmentAsync(CoreEntities.PlayerSegment segment);
        
        /// <summary>
        /// Gets bonuses for a game
        /// </summary>
        Task<IEnumerable<BonusEntities.Bonus>> GetBonusesForGameAsync(string gameId);
        
        /// <summary>
        /// Gets bonus claims for a player
        /// </summary>
        Task<IEnumerable<BonusEntities.BonusClaim>> GetPlayerBonusClaimsAsync(string playerId);
        
        /// <summary>
        /// Claims a bonus for a player
        /// </summary>
        Task<BonusEntities.BonusClaim> ClaimBonusAsync(string playerId, string bonusId);
    }
}
