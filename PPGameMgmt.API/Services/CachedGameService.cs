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
            try
            {
                var cacheKey = string.Format(GAME_CACHE_KEY, gameId);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _gameService.GetGameAsync(gameId),
                    GAME_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetGameAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _gameService.GetGameAsync(gameId);
            }
        }

        public async Task<IEnumerable<Game>> GetAllGamesAsync()
        {
            try
            {
                return await _cacheService.GetOrCreateAsync(
                    GAMES_ALL_CACHE_KEY,
                    () => _gameService.GetAllGamesAsync(),
                    GAMES_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetAllGamesAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _gameService.GetAllGamesAsync();
            }
        }

        public async Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type)
        {
            try
            {
                var cacheKey = string.Format(GAMES_BY_TYPE_CACHE_KEY, type);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _gameService.GetGamesByTypeAsync(type),
                    GAMES_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetGamesByTypeAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _gameService.GetGamesByTypeAsync(type);
            }
        }

        public async Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category)
        {
            try
            {
                var cacheKey = string.Format(GAMES_BY_CATEGORY_CACHE_KEY, category);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _gameService.GetGamesByCategoryAsync(category),
                    GAMES_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetGamesByCategoryAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _gameService.GetGamesByCategoryAsync(category);
            }
        }

        public async Task<IEnumerable<Game>> GetPopularGamesAsync(int count)
        {
            try
            {
                var cacheKey = string.Format(GAMES_POPULAR_CACHE_KEY, count);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _gameService.GetPopularGamesAsync(count),
                    GAMES_POPULAR_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetPopularGamesAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _gameService.GetPopularGamesAsync(count);
            }
        }

        public async Task<IEnumerable<Game>> GetNewReleasesAsync(int count)
        {
            try
            {
                var cacheKey = string.Format(GAMES_NEW_CACHE_KEY, count);

                return await _cacheService.GetOrCreateAsync(
                    cacheKey,
                    () => _gameService.GetNewReleasesAsync(count),
                    GAMES_CACHE_DURATION);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for GetNewReleasesAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _gameService.GetNewReleasesAsync(count);
            }
        }

        public async Task<IEnumerable<Game>> SearchGamesAsync(string searchTerm)
        {
            // Search results are not cached as they are dynamic and depend on user input
            return await _gameService.SearchGamesAsync(searchTerm);
        }

        public async Task<Game> UpdateGameAsync(Game game)
        {
            try
            {
                // Update the game through the service
                var updatedGame = await _gameService.UpdateGameAsync(game);

                // Invalidate cache for this game
                var cacheKey = string.Format(GAME_CACHE_KEY, game.Id);
                await _cacheService.RemoveAsync(cacheKey);

                // Invalidate related cache keys
                await _cacheService.RemoveAsync(GAMES_ALL_CACHE_KEY);
                await _cacheService.RemoveAsync(string.Format(GAMES_BY_TYPE_CACHE_KEY, game.Type));
                await _cacheService.RemoveAsync(string.Format(GAMES_BY_CATEGORY_CACHE_KEY, game.Category));
                await _cacheService.RemoveAsync(GAMES_POPULAR_CACHE_KEY);
                await _cacheService.RemoveAsync(GAMES_NEW_CACHE_KEY);

                return updatedGame;
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache service failed for UpdateGameAsync, falling back to direct service call");
                // Fallback to direct service call if cache fails
                return await _gameService.UpdateGameAsync(game);
            }
        }
    }
}
