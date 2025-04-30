using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
// Use namespace aliases to distinguish between ambiguous types
using CoreEntities = PPGameMgmt.Core.Entities;
using BonusEntities = PPGameMgmt.Core.Entities.Bonuses;
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

        public async Task<BonusEntities.Bonus> GetBonusAsync(string bonusId)
        {
            var cacheKey = string.Format(BONUS_CACHE_KEY, bonusId);

            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _bonusService.GetBonusAsync(bonusId),
                BONUS_CACHE_DURATION);
        }

        public async Task<IEnumerable<BonusEntities.Bonus>> GetAllActiveBonusesAsync()
        {
            return await _cacheService.GetOrCreateAsync(
                BONUSES_ACTIVE_CACHE_KEY,
                () => _bonusService.GetAllActiveBonusesAsync(),
                BONUSES_CACHE_DURATION);
        }

        public async Task<IEnumerable<BonusEntities.Bonus>> GetBonusesByTypeAsync(BonusEntities.BonusType type)
        {
            var cacheKey = string.Format(BONUSES_BY_TYPE_CACHE_KEY, type);

            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _bonusService.GetBonusesByTypeAsync(type),
                BONUSES_CACHE_DURATION);
        }

        public async Task<IEnumerable<BonusEntities.Bonus>> GetBonusesForPlayerSegmentAsync(CoreEntities.PlayerSegment segment)
        {
            var cacheKey = string.Format(BONUSES_BY_SEGMENT_CACHE_KEY, segment);

            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _bonusService.GetBonusesForPlayerSegmentAsync(segment),
                BONUSES_CACHE_DURATION);
        }

        public async Task<IEnumerable<BonusEntities.Bonus>> GetBonusesForGameAsync(string gameId)
        {
            var cacheKey = string.Format(BONUSES_BY_GAME_CACHE_KEY, gameId);

            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _bonusService.GetBonusesForGameAsync(gameId),
                BONUSES_CACHE_DURATION);
        }

        public async Task<IEnumerable<BonusEntities.BonusClaim>> GetPlayerBonusClaimsAsync(string playerId)
        {
            var cacheKey = string.Format(PLAYER_BONUS_CLAIMS_CACHE_KEY, playerId);

            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _bonusService.GetPlayerBonusClaimsAsync(playerId),
                BONUS_CLAIMS_CACHE_DURATION);
        }

        public async Task<BonusEntities.BonusClaim> ClaimBonusAsync(string playerId, string bonusId)
        {
            var result = await _bonusService.ClaimBonusAsync(playerId, bonusId);

            // Invalidate caches
            await _cacheService.RemoveAsync(string.Format(PLAYER_BONUS_CLAIMS_CACHE_KEY, playerId));
            await _cacheService.RemoveAsync(string.Format(BONUS_CACHE_KEY, bonusId));
            await _cacheService.RemoveAsync(BONUSES_ACTIVE_CACHE_KEY);

            return result;
        }
    }
}
