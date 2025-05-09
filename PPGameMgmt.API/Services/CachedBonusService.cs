using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Bonuses;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Services
{
    /// <summary>
    /// Decorator for BonusService that adds caching
    /// </summary>
    public class CachedBonusService : IBonusService
    {
        private readonly IBonusService _bonusService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<CachedBonusService> _logger;

        // Cache keys
        private const string BONUS_CACHE_KEY = "bonus:{0}";
        private const string BONUSES_ACTIVE_CACHE_KEY = "bonuses:active";
        private const string BONUSES_BY_TYPE_CACHE_KEY = "bonuses:type:{0}";
        private const string BONUSES_BY_SEGMENT_CACHE_KEY = "bonuses:segment:{0}";
        private const string BONUSES_BY_GAME_CACHE_KEY = "bonuses:game:{0}";
        private const string PLAYER_BONUS_CLAIMS_CACHE_KEY = "player:{0}:bonusclaims";

        // Cache durations
        private static readonly TimeSpan BONUS_CACHE_DURATION = TimeSpan.FromMinutes(30);
        private static readonly TimeSpan BONUSES_CACHE_DURATION = TimeSpan.FromMinutes(10);
        private static readonly TimeSpan BONUS_CLAIMS_CACHE_DURATION = TimeSpan.FromMinutes(5);

        public CachedBonusService(
            IBonusService bonusService,
            ICacheService cacheService,
            ILogger<CachedBonusService> logger)
        {
            _bonusService = bonusService ?? throw new ArgumentNullException(nameof(bonusService));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Bonus> GetBonusAsync(string bonusId)
        {
            try
            {
                var cacheKey = string.Format(BONUS_CACHE_KEY, bonusId);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _bonusService.GetBonusAsync(bonusId),
                    BONUS_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetBonusAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _bonusService.GetBonusAsync(bonusId);
            }
        }

        public async Task<IEnumerable<Bonus>> GetAllActiveBonusesAsync()
        {
            try
            {
                return await _cacheService.GetOrCreateAsync(
                    BONUSES_ACTIVE_CACHE_KEY,
                    () => _bonusService.GetAllActiveBonusesAsync(),
                    BONUSES_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetAllActiveBonusesAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _bonusService.GetAllActiveBonusesAsync();
            }
        }

        public async Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(BonusType type)
        {
            try
            {
                var cacheKey = string.Format(BONUSES_BY_TYPE_CACHE_KEY, type);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _bonusService.GetBonusesByTypeAsync(type),
                    BONUSES_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetBonusesByTypeAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _bonusService.GetBonusesByTypeAsync(type);
            }
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForPlayerSegmentAsync(PlayerSegment segment)
        {
            try
            {
                var cacheKey = string.Format(BONUSES_BY_SEGMENT_CACHE_KEY, segment);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _bonusService.GetBonusesForPlayerSegmentAsync(segment),
                    BONUSES_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetBonusesForPlayerSegmentAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _bonusService.GetBonusesForPlayerSegmentAsync(segment);
            }
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForGameAsync(string gameId)
        {
            try
            {
                var cacheKey = string.Format(BONUSES_BY_GAME_CACHE_KEY, gameId);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _bonusService.GetBonusesForGameAsync(gameId),
                    BONUSES_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetBonusesForGameAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _bonusService.GetBonusesForGameAsync(gameId);
            }
        }

        public async Task<IEnumerable<BonusClaim>> GetPlayerBonusClaimsAsync(string playerId)
        {
            try
            {
                var cacheKey = string.Format(PLAYER_BONUS_CLAIMS_CACHE_KEY, playerId);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _bonusService.GetPlayerBonusClaimsAsync(playerId),
                    BONUS_CLAIMS_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetPlayerBonusClaimsAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _bonusService.GetPlayerBonusClaimsAsync(playerId);
            }
        }

        public async Task<BonusClaim> ClaimBonusAsync(string playerId, string bonusId)
        {
            var result = await _bonusService.ClaimBonusAsync(playerId, bonusId);

            try
            {
                // Invalidate caches
                await _cacheService.RemoveAsync(string.Format(PLAYER_BONUS_CLAIMS_CACHE_KEY, playerId));
                await _cacheService.RemoveAsync(string.Format(BONUS_CACHE_KEY, bonusId));
                await _cacheService.RemoveAsync(BONUSES_ACTIVE_CACHE_KEY);
                _logger.LogInformation("Successfully invalidated caches for claimed bonus {BonusId} by player {PlayerId}", bonusId, playerId);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed during ClaimBonusAsync, but bonus was claimed successfully");
                // Continue even if cache invalidation fails
            }

            return result;
        }
    }
}
