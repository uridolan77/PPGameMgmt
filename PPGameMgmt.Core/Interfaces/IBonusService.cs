using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Bonuses;

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
        Task<Bonus> GetBonusAsync(string bonusId);
        
        /// <summary>
        /// Gets all active bonuses
        /// </summary>
        Task<IEnumerable<Bonus>> GetAllActiveBonusesAsync();
        
        /// <summary>
        /// Gets bonuses by type
        /// </summary>
        Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(BonusType type);
        
        /// <summary>
        /// Gets bonuses for a player segment
        /// </summary>
        Task<IEnumerable<Bonus>> GetBonusesForPlayerSegmentAsync(PlayerSegment segment);
        
        /// <summary>
        /// Gets bonuses for a game
        /// </summary>
        Task<IEnumerable<Bonus>> GetBonusesForGameAsync(string gameId);
        
        /// <summary>
        /// Gets bonus claims for a player
        /// </summary>
        Task<IEnumerable<BonusClaim>> GetPlayerBonusClaimsAsync(string playerId);
        
        /// <summary>
        /// Claims a bonus for a player
        /// </summary>
        Task<BonusClaim> ClaimBonusAsync(string playerId, string bonusId);
    }
}
