using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Recommendations;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for recommendation service
    /// </summary>
    public interface IRecommendationService
    {
        /// <summary>
        /// Gets personalized recommendation for a player
        /// </summary>
        Task<Recommendation> GetPersonalizedRecommendationAsync(string playerId);
        
        /// <summary>
        /// Gets latest recommendation for a player
        /// </summary>
        Task<Recommendation> GetLatestRecommendationAsync(string playerId);
        
        /// <summary>
        /// Gets game recommendations for a player
        /// </summary>
        Task<IEnumerable<GameRecommendation>> GetGameRecommendationsAsync(string playerId, int count = 5);
        
        /// <summary>
        /// Gets bonus recommendation for a player
        /// </summary>
        Task<BonusRecommendation> GetBonusRecommendationAsync(string playerId);
        
        /// <summary>
        /// Records that a recommendation was displayed to a player
        /// </summary>
        Task RecordRecommendationDisplayedAsync(string recommendationId);
        
        /// <summary>
        /// Records that a recommendation was clicked by a player
        /// </summary>
        Task RecordRecommendationClickedAsync(string recommendationId);
        
        /// <summary>
        /// Records that a recommendation was accepted by a player
        /// </summary>
        Task RecordRecommendationAcceptedAsync(string recommendationId);
    }
}
