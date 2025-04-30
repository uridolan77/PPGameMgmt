using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for bonus repository
    /// </summary>
    public interface IBonusRepository : IRepository<object>
    {
        // Add specific bonus repository methods here
    }



    /// <summary>
    /// Interface for recommendation repository
    /// </summary>
    public interface IRecommendationRepository : IRepository<object>
    {
        // Add specific recommendation repository methods here
    }

    /// <summary>
    /// Interface for player features repository
    /// </summary>
    public interface IPlayerFeaturesRepository : IRepository<object>
    {
        // Add specific player features repository methods here
    }
}