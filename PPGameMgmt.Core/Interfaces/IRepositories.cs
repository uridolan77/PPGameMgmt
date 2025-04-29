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
    /// Interface for game session repository
    /// </summary>
    public interface IGameSessionRepository : IRepository<object>
    {
        // Add specific game session repository methods here
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

    /// <summary>
    /// Interface for outbox repository (for outbox pattern)
    /// </summary>
    public interface IOutboxRepository
    {
        Task AddMessageAsync(object message);
        Task<IEnumerable<object>> GetPendingMessagesAsync(int batchSize);
        Task MarkMessageAsProcessedAsync(Guid id);
    }
}