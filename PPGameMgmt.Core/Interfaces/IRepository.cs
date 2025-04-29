using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Models;

namespace PPGameMgmt.Core.Interfaces
{
    public interface IRepository<T> where T : class
    {
        Task<T> GetByIdAsync(string id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<PagedResult<T>> GetPagedAsync(PaginationParameters parameters);
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<PagedResult<T>> FindPagedAsync(Expression<Func<T, bool>> predicate, PaginationParameters parameters);
        Task AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(T entity);
    }

    public interface IPlayerRepository : IRepository<Player>
    {
        Task<Player> GetPlayerWithSessionsAndBonusesAsync(string playerId);
        Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment);
        Task<PagedResult<Player>> GetPlayersBySegmentPagedAsync(PlayerSegment segment, PaginationParameters parameters);
        Task<IEnumerable<Player>> GetActivePlayers(int daysActive);
        Task<PagedResult<Player>> GetActivePlayersPagedAsync(int daysActive, PaginationParameters parameters);
        Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment);
    }

    public interface IGameRepository : IRepository<Game>
    {
        Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type);
        Task<PagedResult<Game>> GetGamesByTypePagedAsync(GameType type, PaginationParameters parameters);
        Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category);
        Task<PagedResult<Game>> GetGamesByCategoryPagedAsync(GameCategory category, PaginationParameters parameters);
        Task<IEnumerable<Game>> GetPopularGamesAsync(int count);
        Task<PagedResult<Game>> GetPopularGamesPagedAsync(PaginationParameters parameters);
        Task<IEnumerable<Game>> GetNewReleasesAsync(int count);
        Task<PagedResult<Game>> GetNewReleasesPagedAsync(PaginationParameters parameters);
    }

    public interface IBonusRepository : IRepository<Bonus>
    {
        Task<IEnumerable<Bonus>> GetActiveGlobalBonusesAsync();
        Task<PagedResult<Bonus>> GetActiveGlobalBonusesPagedAsync(PaginationParameters parameters);
        Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(BonusType type);
        Task<PagedResult<Bonus>> GetBonusesByTypePagedAsync(BonusType type, PaginationParameters parameters);
        Task<IEnumerable<Bonus>> GetBonusesForPlayerSegmentAsync(PlayerSegment segment);
        Task<PagedResult<Bonus>> GetBonusesForPlayerSegmentPagedAsync(PlayerSegment segment, PaginationParameters parameters);
        Task<IEnumerable<Bonus>> GetBonusesForGameAsync(string gameId);
        Task<PagedResult<Bonus>> GetBonusesForGamePagedAsync(string gameId, PaginationParameters parameters);
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