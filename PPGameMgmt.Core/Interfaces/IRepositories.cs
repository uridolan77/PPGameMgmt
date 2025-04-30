// Use namespace aliases to avoid ambiguous references
using BonusEntity = PPGameMgmt.Core.Entities.Bonuses.Bonus;
using RecommendationEntity = PPGameMgmt.Core.Entities.Recommendations.BonusRecommendation;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for bonus repository
    /// </summary>
    public interface IBonusRepository : Repositories.IRepository<BonusEntity>
    {
        // Add specific bonus repository methods here
    }

    /// <summary>
    /// Interface for recommendation repository
    /// </summary>
    public interface IRecommendationRepository : Repositories.IRepository<RecommendationEntity>
    {
        // Add specific recommendation repository methods here
    }

    /// <summary>
    /// Interface for player features repository
    /// </summary>
    public interface IPlayerFeaturesRepository : Repositories.IRepository<PlayerFeatures>
    {
        // Add specific player features repository methods here
    }
}