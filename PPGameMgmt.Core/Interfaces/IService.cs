using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Models; // Added reference to Models namespace for pagination classes

namespace PPGameMgmt.Core.Interfaces
{
    public interface IPlayerService
    {
        Task<Player> GetPlayerAsync(string playerId);
        Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment);
        Task<PagedResult<Player>> GetPlayersBySegmentPagedAsync(PlayerSegment segment, PaginationParameters parameters);
        Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment);
        Task<IEnumerable<Player>> GetActivePlayers(int daysActive);
        Task<PagedResult<Player>> GetActivePlayersPagedAsync(int daysActive, PaginationParameters parameters);
        Task<bool> IsPlayerActive(string playerId, int days);
        Task<decimal> GetPlayerValueAsync(string playerId);
        Task<PlayerFeatures> GetPlayerFeaturesAsync(string playerId);
        Task<Player> AddPlayerAsync(Player player);
    }

    public interface IGameService
    {
        Task<Game> GetGameAsync(string gameId);
        Task<IEnumerable<Game>> GetAllGamesAsync();
        Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type);
        Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category);
        Task<IEnumerable<Game>> GetPopularGamesAsync(int count);
        Task<IEnumerable<Game>> GetNewReleasesAsync(int count);
        Task<IEnumerable<Game>> SearchGamesAsync(string searchTerm);
        Task<Game> UpdateGameAsync(Game game);
    }


    public interface IMLModelService
    {
        Task InitializeModelsAsync();
        Task<bool> AreModelsReadyAsync();
        Task<DateTime> GetLastModelUpdateTimeAsync();
        Task RetrainModelsAsync(bool forceRetrain = false);
        Task EvaluateModelPerformanceAsync();

        // Add missing methods required by service implementations
        //Task<IEnumerable<GameRecommendation>> PredictTopGamesAsync(PlayerFeatures playerFeatures, int count);
        //Task<BonusRecommendation> PredictBestBonusAsync(PlayerFeatures playerFeatures);
    }
}