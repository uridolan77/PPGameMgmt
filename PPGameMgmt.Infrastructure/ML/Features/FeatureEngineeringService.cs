using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Interfaces.Repositories;

namespace PPGameMgmt.Infrastructure.ML.Features
{
    public class FeatureEngineeringService : IFeatureEngineeringService
    {
        private readonly IDistributedCache _cache;
        private readonly ILogger<FeatureEngineeringService> _logger;
        private readonly IPlayerRepository _playerRepository;
        private readonly IGameSessionRepository _gameSessionRepository;
        private readonly Core.Interfaces.Repositories.IBonusClaimRepository _bonusClaimRepository;
        private readonly BackgroundFeatureProcessor _backgroundProcessor;

        // Cache options
        private static readonly DistributedCacheEntryOptions _cacheOptions = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(4),
            SlidingExpiration = TimeSpan.FromHours(1)
        };

        // Cache key prefix
        private const string CACHE_KEY_PREFIX = "player-features:";

        public FeatureEngineeringService(
            IDistributedCache cache,
            ILogger<FeatureEngineeringService> logger,
            IPlayerRepository playerRepository,
            IGameSessionRepository gameSessionRepository,
            Core.Interfaces.Repositories.IBonusClaimRepository bonusClaimRepository,
            BackgroundFeatureProcessor backgroundProcessor)
        {
            _cache = cache;
            _logger = logger;
            _playerRepository = playerRepository;
            _gameSessionRepository = gameSessionRepository;
            _bonusClaimRepository = bonusClaimRepository;
            _backgroundProcessor = backgroundProcessor;
        }

        /// <summary>
        /// Gets cached player features if available
        /// </summary>
        public async Task<PlayerFeatures> GetCachedFeaturesAsync(string playerId)
        {
            try
            {
                var cacheKey = $"{CACHE_KEY_PREFIX}{playerId}";
                var cachedFeatures = await _cache.GetStringAsync(cacheKey);

                if (string.IsNullOrEmpty(cachedFeatures))
                {
                    return null;
                }

                return JsonSerializer.Deserialize<PlayerFeatures>(cachedFeatures);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving cached features for player {PlayerId}", playerId);
                return null;
            }
        }

        /// <summary>
        /// Extracts features for a player - now using cache first approach
        /// </summary>
        public async Task<PlayerFeatures> ExtractFeaturesAsync(string playerId)
        {
            // Try to get from cache first
            var cachedFeatures = await GetCachedFeaturesAsync(playerId);
            if (cachedFeatures != null)
            {
                return cachedFeatures;
            }

            // If not in cache, extract features (this could be computationally expensive)
            _logger.LogInformation("Extracting features for player {PlayerId}", playerId);

            var player = await _playerRepository.GetByIdAsync(playerId);
            if (player == null)
            {
                throw new KeyNotFoundException($"Player with ID {playerId} not found");
            }

            // Feature extraction logic - in a real app this would be much more complex
            var recentSessions = await _gameSessionRepository.GetRecentSessionsByPlayerIdAsync(playerId, 30);
            var recentClaims = await _bonusClaimRepository.GetRecentClaimsByPlayerIdAsync(playerId, 30);

            // Calculate features
            var features = new PlayerFeatures
            {
                PlayerId = playerId,
                AverageSessionDuration = recentSessions.Any()
                    ? TimeSpan.FromMinutes(recentSessions.Average(s => s.EndTime.HasValue
                        ? (s.EndTime.Value - s.StartTime).TotalMinutes
                        : 0))
                    : TimeSpan.Zero,
                PreferredGameGenre = CalculatePreferredGenre(recentSessions),
                SessionFrequency = CalculateSessionFrequency(recentSessions),
                TypicalDepositAmount = player.AverageDepositAmount,
                TotalBonusesClaimed = recentClaims.Count(),
                PreferredPlayingTimeOfDay = CalculatePreferredPlayingTime(recentSessions),
                LastActive = recentSessions.Any()
                    ? recentSessions.Max(s => s.EndTime ?? s.StartTime)
                    : player.LastLoginDate,
                TimestampUtc = DateTime.UtcNow
            };

            // Cache the results
            await UpdateFeaturesCacheAsync(playerId, features);

            return features;
        }

        /// <summary>
        /// Updates the features cache for a player
        /// </summary>
        public async Task UpdateFeaturesCacheAsync(string playerId)
        {
            try
            {
                // Queue the feature recalculation to run in the background
                _backgroundProcessor.QueueFeatureExtraction(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error queueing feature update for player {PlayerId}", playerId);
                throw;
            }
        }

        /// <summary>
        /// Private method to update cache with provided features
        /// </summary>
        private async Task UpdateFeaturesCacheAsync(string playerId, PlayerFeatures features)
        {
            try
            {
                var cacheKey = $"{CACHE_KEY_PREFIX}{playerId}";
                var serializedFeatures = JsonSerializer.Serialize(features);

                await _cache.SetStringAsync(cacheKey, serializedFeatures, _cacheOptions);
                _logger.LogInformation("Updated feature cache for player {PlayerId}", playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error updating feature cache for player {PlayerId}", playerId);
            }
        }

        /// <summary>
        /// Invalidates cached features for a player
        /// </summary>
        public async Task InvalidateFeaturesAsync(string playerId)
        {
            try
            {
                var cacheKey = $"{CACHE_KEY_PREFIX}{playerId}";
                await _cache.RemoveAsync(cacheKey);
                _logger.LogInformation("Invalidated feature cache for player {PlayerId}", playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error invalidating feature cache for player {PlayerId}", playerId);
                throw;
            }
        }

        // Helper methods for feature calculation
        private string CalculatePreferredGenre(IEnumerable<GameSession> sessions)
        {
            // Implementation to determine most played genre
            return sessions
                .GroupBy(s => s.Game.Genre)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefault() ?? "Unknown";
        }

        private double CalculateSessionFrequency(IEnumerable<GameSession> sessions)
        {
            // Calculate average sessions per week
            if (!sessions.Any()) return 0;

            var firstSession = sessions.Min(s => s.StartTime);
            var lastSession = sessions.Max(s => s.EndTime ?? s.StartTime);

            // Check if all sessions have the same timestamp or if we can't determine a proper range
            if (lastSession <= firstSession)
                return sessions.Count(); // All sessions in same time or invalid data

            var timeSpan = lastSession - firstSession;
            var totalWeeks = timeSpan.TotalDays / 7;

            return totalWeeks > 0 ? sessions.Count() / totalWeeks : sessions.Count();
        }

        private string CalculatePreferredPlayingTime(IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any()) return "Unknown";

            // Categorize by time of day
            var timeCategories = sessions
                .GroupBy(s =>
                {
                    var hour = s.StartTime.Hour;
                    if (hour >= 5 && hour < 12) return "Morning";
                    if (hour >= 12 && hour < 17) return "Afternoon";
                    if (hour >= 17 && hour < 22) return "Evening";
                    return "Night";
                })
                .OrderByDescending(g => g.Count());

            return timeCategories.First().Key;
        }
    }
}