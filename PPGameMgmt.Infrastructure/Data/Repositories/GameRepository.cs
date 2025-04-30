using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    /// <summary>
    /// Repository implementation for Game entity
    /// </summary>
    public class GameRepository : Repository<Game>, IGameRepository
    {
        private readonly ILogger<GameRepository> _logger;
        private const string _entityName = "Game";

        public GameRepository(CasinoDbContext context, ILogger<GameRepository> logger = null)
            : base(context, logger)
        {
            _logger = logger;
        }

        public override async Task<Game> GetByIdAsync(string id)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting game with ID: {id}");

                    // Use EF Core to get the game by ID
                    var game = await _context.Games.FindAsync(id);

                    _logger?.LogInformation(game != null
                        ? $"Retrieved game with ID: {id}"
                        : $"No game found with ID: {id}");

                    return game;
                },
                _entityName,
                $"Error retrieving game with ID: {id}",
                _logger
            );
        }

        public override async Task<IEnumerable<Game>> GetAllAsync()
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting all games");

                    // Use EF Core to get all games
                    var games = await _context.Games.ToListAsync();

                    _logger?.LogInformation($"Retrieved {games.Count} games");

                    return games;
                },
                _entityName,
                "Error retrieving all games",
                _logger
            );
        }

        public override async Task<IEnumerable<Game>> FindAsync(Expression<Func<Game, bool>> predicate)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.Games.Where(predicate).ToListAsync();
                },
                _entityName,
                "Error finding games with predicate",
                _logger
            );
        }

        public async Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting games by type: {type}");

                    // Use EF Core to get games by type
                    var games = await _context.Games
                        .Where(g => g.Type == type && g.IsActive)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {games.Count} games of type {type}");

                    return games;
                },
                _entityName,
                $"Error retrieving games by type: {type}",
                _logger
            );
        }

        public async Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting games by category: {category}");

                    // Use EF Core to get games by category
                    var games = await _context.Games
                        .Where(g => g.Category == category && g.IsActive)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {games.Count} games of category {category}");

                    return games;
                },
                _entityName,
                $"Error retrieving games by category: {category}",
                _logger
            );
        }

        public async Task<IEnumerable<Game>> GetPopularGamesAsync(int count)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting top {count} popular games");

                    // Use EF Core to get popular games based on popularity score
                    var games = await _context.Games
                        .Where(g => g.IsActive)
                        .OrderByDescending(g => g.PopularityScore)
                        .Take(count)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {games.Count} popular games");

                    return games;
                },
                _entityName,
                $"Error retrieving popular games",
                _logger
            );
        }

        public async Task<IEnumerable<Game>> GetNewReleasesAsync(int count)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting top {count} new game releases");

                    // Use EF Core to get new game releases based on release date
                    var games = await _context.Games
                        .Where(g => g.IsActive)
                        .OrderByDescending(g => g.ReleaseDate)
                        .Take(count)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {games.Count} new game releases");

                    return games;
                },
                _entityName,
                $"Error retrieving new game releases",
                _logger
            );
        }

        public async Task<IEnumerable<Game>> SearchGamesAsync(string searchTerm)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Searching games with term: {searchTerm}");

                    if (string.IsNullOrWhiteSpace(searchTerm))
                    {
                        return await GetAllAsync();
                    }

                    // Normalize search term
                    var normalizedSearchTerm = searchTerm.ToLower();

                    // Use EF Core to search games by name, provider, or description
                    var games = await _context.Games
                        .Where(g => g.IsActive &&
                                  (g.Name.ToLower().Contains(normalizedSearchTerm) ||
                                   g.Provider.ToLower().Contains(normalizedSearchTerm) ||
                                   g.Description.ToLower().Contains(normalizedSearchTerm)))
                        .ToListAsync();

                    _logger?.LogInformation($"Found {games.Count} games matching search term: {searchTerm}");

                    return games;
                },
                _entityName,
                $"Error searching games with term: {searchTerm}",
                _logger
            );
        }

        public async Task<IEnumerable<Game>> GetGamesByProviderAsync(string provider)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting games by provider: {provider}");

                    // Use EF Core to get games by provider
                    var games = await _context.Games
                        .Where(g => g.IsActive && g.Provider.ToLower() == provider.ToLower())
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {games.Count} games from provider {provider}");

                    return games;
                },
                _entityName,
                $"Error retrieving games by provider: {provider}",
                _logger
            );
        }

        public async Task<IEnumerable<Game>> GetGamesByRtpRangeAsync(decimal minRtp, decimal maxRtp)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting games with RTP between {minRtp}% and {maxRtp}%");

                    // Use EF Core to get games by RTP range
                    var games = await _context.Games
                        .Where(g => g.IsActive && g.RTP >= minRtp && g.RTP <= maxRtp)
                        .OrderByDescending(g => g.RTP)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {games.Count} games with RTP between {minRtp}% and {maxRtp}%");

                    return games;
                },
                _entityName,
                $"Error retrieving games with RTP between {minRtp}% and {maxRtp}%",
                _logger
            );
        }

        public async Task<IEnumerable<Game>> GetGamesByDeviceCompatibilityAsync(string deviceType)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting games compatible with device type: {deviceType}");

                    // Use the CompatibleDevices array property
                    var games = await _context.Games
                        .Where(g => g.IsActive)
                        .ToListAsync();

                    // Filter in memory since EF Core might not support array contains
                    games = games.Where(g => g.CompatibleDevices != null &&
                                          g.CompatibleDevices.Contains(deviceType)).ToList();

                    _logger?.LogInformation($"Retrieved {games.Count} games compatible with device type: {deviceType}");

                    return games;
                },
                _entityName,
                $"Error retrieving games compatible with device type: {deviceType}",
                _logger
            );
        }

        public async Task<IEnumerable<Game>> GetGamesByFeatureAsync(string featureName)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting games with feature: {featureName}");

                    // Use the Features array property
                    var games = await _context.Games
                        .Where(g => g.IsActive)
                        .ToListAsync();

                    // Filter in memory since EF Core might not support array contains
                    games = games.Where(g => g.Features != null &&
                                          g.Features.Contains(featureName)).ToList();

                    _logger?.LogInformation($"Retrieved {games.Count} games with feature: {featureName}");

                    return games;
                },
                _entityName,
                $"Error retrieving games with feature: {featureName}",
                _logger
            );
        }

        public async Task UpdateGamePopularityScoreAsync(string gameId, int newPopularityScore)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Updating popularity score for game with ID: {gameId} to {newPopularityScore}");

                    var game = await _context.Games.FindAsync(gameId);

                    if (game == null)
                    {
                        throw new EntityNotFoundException(_entityName, gameId);
                    }

                    game.PopularityScore = newPopularityScore;

                    // Update the entity
                    _context.Games.Update(game);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation($"Updated popularity score for game with ID: {gameId} to {newPopularityScore}");

                    return true;
                },
                _entityName,
                $"Error updating popularity score for game with ID: {gameId}",
                _logger
            );
        }

        public async Task<bool> GameExistsAsync(string gameId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Checking if game with ID: {gameId} exists");

                    var exists = await _context.Games
                        .AnyAsync(g => g.Id == gameId);

                    _logger?.LogInformation($"Game with ID: {gameId} exists: {exists}");

                    return exists;
                },
                _entityName,
                $"Error checking if game with ID: {gameId} exists",
                _logger
            );
        }
    }
}