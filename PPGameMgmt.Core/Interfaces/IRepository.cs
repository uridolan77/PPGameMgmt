using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<T> GetByIdAsync(string id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
    }

    public interface IPlayerRepository : IRepository<Player>
    {
        Task<Player> GetPlayerWithSessionsAndBonusesAsync(string playerId);
        Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment);
        Task<IEnumerable<Player>> GetActivePlayers(int daysActive);
        Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment);
    }

    public interface IGameRepository : IRepository<Game>
    {
        Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type);
        Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category);
        Task<IEnumerable<Game>> GetPopularGamesAsync(int count);
        Task<IEnumerable<Game>> GetNewReleasesAsync(int count);
    }

    public interface IBonusRepository : IRepository<Bonus>
    {
        Task<IEnumerable<Bonus>> GetActiveGlobalBonusesAsync();
        Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(BonusType type);
        Task<IEnumerable<Bonus>> GetBonusesForPlayerSegmentAsync(PlayerSegment segment);
        Task<IEnumerable<Bonus>> GetBonusesForGameAsync(string gameId);
    }

    public interface IGameSessionRepository : IRepository<GameSession>
    {
        Task<IEnumerable<GameSession>> GetSessionsByPlayerAsync(string playerId, int limit = 100);
        Task<IEnumerable<GameSession>> GetRecentSessionsAsync(int hours, int limit = 1000);
        Task<IEnumerable<GameSession>> GetSessionsByGameAsync(string gameId, int limit = 100);
        Task<IEnumerable<GameSession>> GetSessionsByDateRangeAsync(DateTime start, DateTime end);
        Task<IEnumerable<GameSession>> GetSessionsByPlayerIdAsync(string playerId);
        Task<IEnumerable<GameSession>> GetRecentSessionsByPlayerIdAsync(string playerId, int days);
    }

    public interface IBonusClaimRepository : IRepository<BonusClaim>
    {
        Task<IEnumerable<BonusClaim>> GetClaimsByPlayerAsync(string playerId);
        Task<IEnumerable<BonusClaim>> GetActiveClaimsByPlayerAsync(string playerId);
        Task<IEnumerable<BonusClaim>> GetClaimsByBonusAsync(string bonusId);
        Task<IEnumerable<BonusClaim>> GetRecentClaimsAsync(int days);
        Task<IEnumerable<BonusClaim>> GetByPlayerIdAsync(string playerId);
        Task<IEnumerable<BonusClaim>> GetRecentClaimsByPlayerIdAsync(string playerId, int days);
    }

    public interface IPlayerFeaturesRepository : IRepository<PlayerFeatures>
    {
        Task<PlayerFeatures> GetLatestFeaturesForPlayerAsync(string playerId);
        Task<IEnumerable<PlayerFeatures>> GetFeaturesForPlayersAsync(IEnumerable<string> playerIds);
        Task<IEnumerable<PlayerFeatures>> GetFeaturesForSegmentAsync(PlayerSegment segment);
    }

    public interface IRecommendationRepository : IRepository<Recommendation>
    {
        Task<Recommendation> GetLatestRecommendationForPlayerAsync(string playerId);
        Task<IEnumerable<Recommendation>> GetRecommendationHistoryForPlayerAsync(string playerId, int limit = 10);
        Task<IEnumerable<Recommendation>> GetPendingRecommendationsAsync();
        Task<IEnumerable<Recommendation>> GetSuccessfulRecommendationsAsync(int days);
    }
}