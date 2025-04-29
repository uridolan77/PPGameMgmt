using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Services
{
    /// <summary>
    /// Decorator for GameService that adds caching
    /// </summary>
    public class CachedGameService : IGameService
    {
        private readonly IGameService _gameService;
        private readonly ICacheService _cacheService;
        private readonly ILogger<CachedGameService> _logger;
        
        // Cache keys
        private const string GAME_CACHE_KEY = "game:{0}";
        private const string GAMES_ALL_CACHE_KEY = "games:all";
        private const string GAMES_BY_TYPE_CACHE_KEY = "games:type:{0}";
        private const string GAMES_BY_CATEGORY_CACHE_KEY = "games:category:{0}";
        private const string GAMES_POPULAR_CACHE_KEY = "games:popular:{0}";
        private const string GAMES_NEW_CACHE_KEY = "games:new:{0}";
        
        // Cache durations
        private static readonly TimeSpan GAME_CACHE_DURATION = TimeSpan.FromHours(1);
        private static readonly TimeSpan GAMES_CACHE_DURATION = TimeSpan.FromMinutes(15);
        private static readonly TimeSpan GAMES_POPULAR_CACHE_DURATION = TimeSpan.FromMinutes(5);
        
        public CachedGameService(
            IGameService gameService,
            ICacheService cacheService,
            ILogger<CachedGameService> logger)
        {
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _cacheService = cacheService ?? throw new ArgumentNullException(nameof(cacheService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        public async Task<Game> GetGameAsync(string gameId)
        {
            var cacheKey = string.Format(GAME_CACHE_KEY, gameId);
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _gameService.GetGameAsync(gameId),
                GAME_CACHE_DURATION);
        }
        
        public async Task<IEnumerable<Game>> GetAllGamesAsync()
        {
            return await _cacheService.GetOrCreateAsync(
                GAMES_ALL_CACHE_KEY,
                () => _gameService.GetAllGamesAsync(),
                GAMES_CACHE_DURATION);
        }
        
        public async Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type)
        {
            var cacheKey = string.Format(GAMES_BY_TYPE_CACHE_KEY, type);
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _gameService.GetGamesByTypeAsync(type),
                GAMES_CACHE_DURATION);
        }
        
        public async Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category)
        {
            var cacheKey = string.Format(GAMES_BY_CATEGORY_CACHE_KEY, category);
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _gameService.GetGamesByCategoryAsync(category),
                GAMES_CACHE_DURATION);
        }
        
        public async Task<IEnumerable<Game>> GetPopularGamesAsync(int count)
        {
            var cacheKey = string.Format(GAMES_POPULAR_CACHE_KEY, count);
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _gameService.GetPopularGamesAsync(count),
                GAMES_POPULAR_CACHE_DURATION);
        }
        
        public async Task<IEnumerable<Game>> GetNewReleasesAsync(int count)
        {
            var cacheKey = string.Format(GAMES_NEW_CACHE_KEY, count);
            
            return await _cacheService.GetOrCreateAsync(
                cacheKey,
                () => _gameService.GetNewReleasesAsync(count),
                GAMES_CACHE_DURATION);
        }
        
        public async Task<IEnumerable<Game>> SearchGamesAsync(string searchTerm)
        {
            // Search results are not cached as they are dynamic and depend on user input
            return await _gameService.SearchGamesAsync(searchTerm);
        }
    }
}
