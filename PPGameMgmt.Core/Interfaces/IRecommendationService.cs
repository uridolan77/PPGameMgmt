using System.Collections.Generic;
using System.Threading.Tasks;
// Use namespace aliases to distinguish between ambiguous types
using CoreEntities = PPGameMgmt.Core.Entities;
using RecommendationEntities = PPGameMgmt.Core.Entities.Recommendations;

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
        Task<RecommendationEntities.Recommendation> GetPersonalizedRecommendationAsync(string playerId);
        
        /// <summary>
        /// Gets latest recommendation for a player
        /// </summary>
        Task<RecommendationEntities.Recommendation> GetLatestRecommendationAsync(string playerId);
        
        /// <summary>
        /// Gets game recommendations for a player
        /// </summary>
        Task<IEnumerable<RecommendationEntities.GameRecommendation>> GetGameRecommendationsAsync(string playerId, int count = 5);
        
        /// <summary>
        /// Gets bonus recommendation for a player
        /// </summary>
        Task<RecommendationEntities.BonusRecommendation> GetBonusRecommendationAsync(string playerId);
        
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
