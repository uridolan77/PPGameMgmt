using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Recommendations;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Services
{
    /// <summary>
    /// Decorator for RecommendationService that adds caching
    /// </summary>
    public class CachedRecommendationService : IRecommendationService
    {
        private readonly IRecommendationService _recommendationService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<CachedRecommendationService> _logger;

        // Cache keys
        private const string RECOMMENDATION_PERSONALIZED_CACHE_KEY = "recommendation:personalized:{0}";
        private const string RECOMMENDATION_LATEST_CACHE_KEY = "recommendation:latest:{0}";
        private const string GAME_RECOMMENDATIONS_CACHE_KEY = "recommendation:games:{0}:{1}";
        private const string BONUS_RECOMMENDATION_CACHE_KEY = "recommendation:bonus:{0}";

        // Cache durations
        private static readonly TimeSpan RECOMMENDATION_CACHE_DURATION = TimeSpan.FromMinutes(30);
        private static readonly TimeSpan GAME_RECOMMENDATIONS_CACHE_DURATION = TimeSpan.FromMinutes(15);
        private static readonly TimeSpan BONUS_RECOMMENDATION_CACHE_DURATION = TimeSpan.FromMinutes(15);

        public CachedRecommendationService(
            IRecommendationService recommendationService,
            ICacheService cacheService,
            ILogger<CachedRecommendationService> logger)
        {
            _recommendationService = recommendationService ?? throw new ArgumentNullException(nameof(recommendationService));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Recommendation> GetPersonalizedRecommendationAsync(string playerId)
        {
            try
            {
                var cacheKey = string.Format(RECOMMENDATION_PERSONALIZED_CACHE_KEY, playerId);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _recommendationService.GetPersonalizedRecommendationAsync(playerId),
                    RECOMMENDATION_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetPersonalizedRecommendationAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _recommendationService.GetPersonalizedRecommendationAsync(playerId);
            }
        }

        public async Task<Recommendation> GetLatestRecommendationAsync(string playerId)
        {
            try
            {
                var cacheKey = string.Format(RECOMMENDATION_LATEST_CACHE_KEY, playerId);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _recommendationService.GetLatestRecommendationAsync(playerId),
                    RECOMMENDATION_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetLatestRecommendationAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _recommendationService.GetLatestRecommendationAsync(playerId);
            }
        }

        public async Task<IEnumerable<GameRecommendation>> GetGameRecommendationsAsync(string playerId, int count = 5)
        {
            try
            {
                var cacheKey = string.Format(GAME_RECOMMENDATIONS_CACHE_KEY, playerId, count);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _recommendationService.GetGameRecommendationsAsync(playerId, count),
                    GAME_RECOMMENDATIONS_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetGameRecommendationsAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _recommendationService.GetGameRecommendationsAsync(playerId, count);
            }
        }

        public async Task<BonusRecommendation> GetBonusRecommendationAsync(string playerId)
        {
            try
            {
                var cacheKey = string.Format(BONUS_RECOMMENDATION_CACHE_KEY, playerId);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _recommendationService.GetBonusRecommendationAsync(playerId),
                    BONUS_RECOMMENDATION_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetBonusRecommendationAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _recommendationService.GetBonusRecommendationAsync(playerId);
            }
        }

        public async Task RecordRecommendationDisplayedAsync(string recommendationId)
        {
            await _recommendationService.RecordRecommendationDisplayedAsync(recommendationId);
            // No cache invalidation needed as this doesn't change the recommendation itself
        }

        public async Task RecordRecommendationClickedAsync(string recommendationId)
        {
            await _recommendationService.RecordRecommendationClickedAsync(recommendationId);
            // No cache invalidation needed as this doesn't change the recommendation itself
        }

        public async Task RecordRecommendationAcceptedAsync(string recommendationId)
        {
            await _recommendationService.RecordRecommendationAcceptedAsync(recommendationId);

            // We don't know which player this recommendation belongs to, so we can't invalidate specific caches
            // In a real implementation, we would store the player ID with the recommendation ID to enable targeted cache invalidation
            _logger.LogInformation("Recommendation {RecommendationId} was accepted, but cache invalidation is not possible without player ID", recommendationId);
        }
    }
}
