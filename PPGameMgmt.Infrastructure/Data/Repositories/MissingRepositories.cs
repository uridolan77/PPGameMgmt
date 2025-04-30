using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;
using BonusEntity = PPGameMgmt.Core.Entities.Bonuses.Bonus;
using RecommendationEntity = PPGameMgmt.Core.Entities.Recommendations.BonusRecommendation;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    /// <summary>
    /// Repository implementation for Bonus entity
    /// </summary>
    public class BonusRepository : Repository<BonusEntity>, IBonusRepository
    {
        public BonusRepository(CasinoDbContext context, ILogger<BonusRepository>? logger = null)
            : base(context, logger)
        {
        }

        // No need to implement additional methods as the base Repository<BonusEntity> class
        // already implements all the methods required by IBonusRepository
    }

    /// <summary>
    /// Repository implementation for BonusRecommendation entity
    /// </summary>
    public class RecommendationRepository : Repository<RecommendationEntity>, IRecommendationRepository
    {
        public RecommendationRepository(CasinoDbContext context, ILogger<RecommendationRepository>? logger = null)
            : base(context, logger)
        {
        }

        // No need to implement additional methods as the base Repository<RecommendationEntity> class
        // already implements all the methods required by IRecommendationRepository
    }

    /// <summary>
    /// Repository implementation for PlayerFeatures entity
    /// </summary>
    public class PlayerFeaturesRepository : Repository<PlayerFeatures>, IPlayerFeaturesRepository
    {
        public PlayerFeaturesRepository(CasinoDbContext context, ILogger<PlayerFeaturesRepository>? logger = null)
            : base(context, logger)
        {
        }

        // No need to implement additional methods as the base Repository<PlayerFeatures> class
        // already implements all the methods required by IPlayerFeaturesRepository
    }
}