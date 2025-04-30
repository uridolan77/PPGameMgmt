using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Bonuses;
using PPGameMgmt.Core.Entities.Recommendations;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for bonus optimization service
    /// </summary>
    public interface IBonusOptimizationService
    {
        /// <summary>
        /// Gets the optimal bonus for a player
        /// </summary>
        Task<Entities.Recommendations.BonusRecommendation> GetOptimalBonusAsync(string playerId);

        /// <summary>
        /// Determines if a bonus is appropriate for a player
        /// </summary>
        Task<bool> IsBonusAppropriateForPlayerAsync(string playerId, string bonusId);

        /// <summary>
        /// Ranks bonuses for a player based on suitability
        /// </summary>
        Task<IEnumerable<Entities.Bonuses.Bonus>> RankBonusesForPlayerAsync(string playerId);
    }
}
