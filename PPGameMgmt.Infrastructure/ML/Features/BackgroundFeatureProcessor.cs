using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Infrastructure.ML.Features
{
    public class BackgroundFeatureProcessor : BackgroundService
    {
        private readonly ILogger<BackgroundFeatureProcessor> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly ConcurrentQueue<string> _featureExtractionQueue = new();
        private readonly SemaphoreSlim _signal = new(0);
        private readonly IDistributedCache _cache;
        
        // Cache options - same as in FeatureEngineeringService
        private static readonly DistributedCacheEntryOptions _cacheOptions = new()
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromHours(4),
            SlidingExpiration = TimeSpan.FromHours(1)
        };

        // Cache key prefix - should match FeatureEngineeringService
        private const string CACHE_KEY_PREFIX = "player-features:";

        public BackgroundFeatureProcessor(
            ILogger<BackgroundFeatureProcessor> logger,
            IServiceProvider serviceProvider,
            IDistributedCache cache)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _cache = cache;
        }

        public void QueueFeatureExtraction(string playerId)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }

            _featureExtractionQueue.Enqueue(playerId);
            _signal.Release();
            
            _logger.LogInformation("Queued feature extraction for player {PlayerId}", playerId);
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Background feature processor started");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    // Wait for work or timeout after 30 seconds to check for cancellation
                    await _signal.WaitAsync(TimeSpan.FromSeconds(30), stoppingToken);

                    // Process all queued items
                    while (_featureExtractionQueue.TryDequeue(out var playerId))
                    {
                        try
                        {
                            // Extract and cache the features
                            await ExtractAndCacheFeaturesAsync(playerId);
                        }
                        catch (Exception ex)
                        {
                            _logger.LogError(ex, "Error processing features for player {PlayerId}", playerId);
                        }
                    }
                }
                catch (OperationCanceledException)
                {
                    // Normal when shutdown is requested, can be ignored
                    break;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error in background feature processor");
                    // Wait before trying to continue
                    await Task.Delay(TimeSpan.FromSeconds(5), stoppingToken);
                }
            }

            _logger.LogInformation("Background feature processor stopped");
        }

        private async Task ExtractAndCacheFeaturesAsync(string playerId)
        {
            _logger.LogInformation("Starting background feature extraction for player {PlayerId}", playerId);

            // Create a scope to resolve dependencies
            using var scope = _serviceProvider.CreateScope();
            
            try
            {
                // Get required repositories
                var playerRepo = scope.ServiceProvider.GetRequiredService<IPlayerRepository>();
                var sessionRepo = scope.ServiceProvider.GetRequiredService<IGameSessionRepository>();

                // Get player
                var player = await playerRepo.GetByIdAsync(playerId);
                if (player == null)
                {
                    _logger.LogWarning("Player {PlayerId} not found for feature extraction", playerId);
                    return;
                }

                // Feature extraction logic (similar to the service)
                var recentSessions = await sessionRepo.GetRecentSessionsByPlayerIdAsync(playerId, 30);

                // Build features object
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
                    PreferredPlayingTimeOfDay = CalculatePreferredPlayingTime(recentSessions),
                    LastActive = recentSessions.Any()
                        ? recentSessions.Max(s => s.EndTime ?? s.StartTime)
                        : player.LastLoginDate,
                    TimestampUtc = DateTime.UtcNow
                };

                // Cache the features
                var cacheKey = $"{CACHE_KEY_PREFIX}{playerId}";
                var serializedFeatures = JsonSerializer.Serialize(features);
                await _cache.SetStringAsync(cacheKey, serializedFeatures, _cacheOptions);

                _logger.LogInformation("Completed background feature extraction for player {PlayerId}", playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in background feature extraction for player {PlayerId}", playerId);
                throw;
            }
        }

        // Helper methods for feature calculation (duplicated from FeatureEngineeringService)
        private string CalculatePreferredGenre(IEnumerable<GameSession> sessions)
        {
            return sessions
                .GroupBy(s => s.Game.Genre)
                .OrderByDescending(g => g.Count())
                .Select(g => g.Key)
                .FirstOrDefault() ?? "Unknown";
        }

        private double CalculateSessionFrequency(IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any()) return 0;
            
            var firstSession = sessions.Min(s => s.StartTime);
            var lastSession = sessions.Max(s => s.EndTime ?? s.StartTime);
            
            // Check if all sessions have the same timestamp or if we can't determine a proper range
            if (lastSession <= firstSession)
                return sessions.Count();
                
            var timeSpan = lastSession - firstSession;
            var totalWeeks = timeSpan.TotalDays / 7;
            
            return totalWeeks > 0 ? sessions.Count() / totalWeeks : sessions.Count();
        }

        private string CalculatePreferredPlayingTime(IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any()) return "Unknown";

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