using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models;

namespace PPGameMgmt.API.Services
{
    /// <summary>
    /// Decorator for PlayerService that adds caching
    /// </summary>
    public class CachedPlayerService : IPlayerService
    {
        private readonly IPlayerService _playerService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<CachedPlayerService> _logger;

        // Cache keys
        private const string PLAYER_CACHE_KEY = "player:{0}";
        private const string PLAYERS_BY_SEGMENT_CACHE_KEY = "players:segment:{0}";
        private const string PLAYERS_ACTIVE_CACHE_KEY = "players:active:{0}";
        private const string PLAYER_FEATURES_CACHE_KEY = "player:{0}:features";

        // Cache durations
        private static readonly TimeSpan PLAYER_CACHE_DURATION = TimeSpan.FromMinutes(30);
        private static readonly TimeSpan PLAYERS_CACHE_DURATION = TimeSpan.FromMinutes(10);
        private static readonly TimeSpan PLAYER_FEATURES_CACHE_DURATION = TimeSpan.FromHours(1);

        public CachedPlayerService(
            IPlayerService playerService,
            ICacheService cacheService,
            ILogger<CachedPlayerService> logger)
        {
            _playerService = playerService ?? throw new ArgumentNullException(nameof(playerService));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Player> GetPlayerAsync(string playerId)
        {
            try
            {
                var cacheKey = string.Format(PLAYER_CACHE_KEY, playerId);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _playerService.GetPlayerAsync(playerId),
                    PLAYER_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetPlayerAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _playerService.GetPlayerAsync(playerId);
            }
        }

        public async Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment)
        {
            try
            {
                var cacheKey = string.Format(PLAYERS_BY_SEGMENT_CACHE_KEY, segment);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _playerService.GetPlayersBySegmentAsync(segment),
                    PLAYERS_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetPlayersBySegmentAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _playerService.GetPlayersBySegmentAsync(segment);
            }
        }

        public async Task<PagedResult<Player>> GetPlayersBySegmentPagedAsync(PlayerSegment segment, PaginationParameters parameters)
        {
            // We don't cache paged results as they can vary widely based on parameters
            return await _playerService.GetPlayersBySegmentPagedAsync(segment, parameters);
        }

        public async Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment)
        {
            await _playerService.UpdatePlayerSegmentAsync(playerId, segment);

            try
            {
                // Invalidate player cache
                await _cacheService.RemoveAsync(string.Format(PLAYER_CACHE_KEY, playerId));

                // Invalidate segment caches
                await _cacheService.RemoveAsync(string.Format(PLAYERS_BY_SEGMENT_CACHE_KEY, segment));

                // Invalidate active players cache - we don't know which one to invalidate, so invalidate all
                for (int i = 1; i <= 90; i += 30) // Common values: 30, 60, 90 days
                {
                    await _cacheService.RemoveAsync(string.Format(PLAYERS_ACTIVE_CACHE_KEY, i));
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed during UpdatePlayerSegmentAsync, but segment was updated successfully");
                // Continue even if caching fails
            }
        }

        public async Task<IEnumerable<Player>> GetActivePlayers(int daysActive)
        {
            try
            {
                var cacheKey = string.Format(PLAYERS_ACTIVE_CACHE_KEY, daysActive);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _playerService.GetActivePlayers(daysActive),
                    PLAYERS_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetActivePlayers, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _playerService.GetActivePlayers(daysActive);
            }
        }

        public async Task<PagedResult<Player>> GetActivePlayersPagedAsync(int daysActive, PaginationParameters parameters)
        {
            // We don't cache paged results as they can vary widely based on parameters
            return await _playerService.GetActivePlayersPagedAsync(daysActive, parameters);
        }

        public async Task<bool> IsPlayerActive(string playerId, int days)
        {
            // This is a lightweight operation that depends on the player, so we don't cache it separately
            return await _playerService.IsPlayerActive(playerId, days);
        }

        public async Task<decimal> GetPlayerValueAsync(string playerId)
        {
            // This is a lightweight operation that depends on the player, so we don't cache it separately
            return await _playerService.GetPlayerValueAsync(playerId);
        }

        public async Task<PlayerFeatures> GetPlayerFeaturesAsync(string playerId)
        {
            try
            {
                var cacheKey = string.Format(PLAYER_FEATURES_CACHE_KEY, playerId);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _playerService.GetPlayerFeaturesAsync(playerId),
                    PLAYER_FEATURES_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetPlayerFeaturesAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _playerService.GetPlayerFeaturesAsync(playerId);
            }
        }

        public async Task<Player> AddPlayerAsync(Player player)
        {
            var result = await _playerService.AddPlayerAsync(player);

            try
            {
                // Cache the new player
                var cacheKey = string.Format(PLAYER_CACHE_KEY, player.Id);
                await _cacheService.SetAsync(cacheKey, result, PLAYER_CACHE_DURATION);

                // Invalidate segment cache
                await _cacheService.RemoveAsync(string.Format(PLAYERS_BY_SEGMENT_CACHE_KEY, player.Segment));
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed during AddPlayerAsync, but player was added successfully");
                // Continue even if caching fails
            }

            return result;
        }
    }
}
