using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Interfaces
{
    public interface IPlayerService
    {
        Task<Player> GetPlayerAsync(string playerId);
        Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment);
        Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment);
        Task<IEnumerable<Player>> GetActivePlayers(int daysActive);
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
    }

    public interface IBonusService
    {
        Task<Bonus> GetBonusAsync(string bonusId);
        Task<IEnumerable<Bonus>> GetAllActiveBonusesAsync();
        Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(BonusType type);
        Task<IEnumerable<Bonus>> GetBonusesForPlayerSegmentAsync(PlayerSegment segment);
        Task<IEnumerable<Bonus>> GetBonusesForGameAsync(string gameId);
        Task<IEnumerable<BonusClaim>> GetPlayerBonusClaimsAsync(string playerId);
        Task<BonusClaim> ClaimBonusAsync(string playerId, string bonusId);
    }

    public interface IRecommendationService
    {
        Task<Recommendation> GetPersonalizedRecommendationAsync(string playerId);
        Task<Recommendation> GetLatestRecommendationAsync(string playerId);
        Task<IEnumerable<GameRecommendation>> GetGameRecommendationsAsync(string playerId, int count = 5);
        Task<BonusRecommendation> GetBonusRecommendationAsync(string playerId);
        Task RecordRecommendationDisplayedAsync(string recommendationId);
        Task RecordRecommendationClickedAsync(string recommendationId);
        Task RecordRecommendationAcceptedAsync(string recommendationId);
    }

    public interface IBonusOptimizationService
    {
        Task<BonusRecommendation> GetOptimalBonusAsync(string playerId);
        Task<BonusRecommendation> GetOptimalBonusAsync(PlayerFeatures playerFeatures);
        Task<IEnumerable<Bonus>> RankBonusesForPlayerAsync(string playerId);
        Task<bool> IsBonusAppropriateForPlayerAsync(string playerId, string bonusId);
        Task<decimal> PredictBonusConversionRateAsync(string playerId, string bonusId);
    }

    public interface IMLModelService
    {
        Task InitializeModelsAsync();
        Task<bool> AreModelsReadyAsync();
        Task<DateTime> GetLastModelUpdateTimeAsync();
        Task RetrainModelsAsync(bool forceRetrain = false);
        Task EvaluateModelPerformanceAsync();
        
        // Add missing methods required by service implementations
        Task<IEnumerable<GameRecommendation>> PredictTopGamesAsync(PlayerFeatures playerFeatures, int count);
        Task<BonusRecommendation> PredictBestBonusAsync(PlayerFeatures playerFeatures);
    }
}