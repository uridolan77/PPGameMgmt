using System;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.Interfaces
{
    public interface IUnitOfWork : IDisposable
    {
        IPlayerRepository Players { get; }
        IGameRepository Games { get; }
        IBonusRepository Bonuses { get; }
        IGameSessionRepository GameSessions { get; }
        IBonusClaimRepository BonusClaims { get; }
        IPlayerFeaturesRepository PlayerFeatures { get; }
        IRecommendationRepository Recommendations { get; }

        Task<int> SaveChangesAsync();
        Task BeginTransactionAsync();
        Task CommitTransactionAsync();
        Task RollbackTransactionAsync();
    }
}
