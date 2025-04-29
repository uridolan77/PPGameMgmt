using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class GameRepository : Repository<Game>, IGameRepository
    {
        private readonly ILogger<GameRepository> _logger;

        public GameRepository(CasinoDbContext context, ILogger<GameRepository> logger = null)
            : base(context, logger)
        {
            _logger = logger;
        }

        public override async Task<Game> GetByIdAsync(string id)
        {
            try
            {
                _logger?.LogInformation($"Getting game with ID: {id}");

                // Use EF Core to get the game by ID
                var game = await _context.Games.FindAsync(id);

                _logger?.LogInformation(game != null
                    ? $"Retrieved game with ID: {id}"
                    : $"No game found with ID: {id}");

                return game;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving game with ID: {id}");
                throw;
            }
        }

        public override async Task<IEnumerable<Game>> GetAllAsync()
        {
            try
            {
                _logger?.LogInformation("Getting all games");

                // Use EF Core to get all games
                var games = await _context.Games.ToListAsync();

                _logger?.LogInformation($"Retrieved {games.Count} games");

                return games;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error retrieving all games");
                throw;
            }
        }

        public override async Task<IEnumerable<Game>> FindAsync(Expression<Func<Game, bool>> predicate)
        {
            try
            {
                return await _context.Games.Where(predicate).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error finding games with predicate");
                throw;
            }
        }

        // Note: AddAsync, UpdateAsync, and DeleteAsync are inherited from the base Repository class
        // and don't need to be overridden unless custom behavior is needed

        public async Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type)
        {
            try
            {
                _logger?.LogInformation($"Getting games by type: {type}");

                // Use EF Core to get games by type
                var games = await _context.Games
                    .Where(g => g.Type == type && g.IsActive)
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved {games.Count} games of type {type}");

                return games;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving games by type: {type}");
                throw;
            }
        }

        public async Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category)
        {
            try
            {
                _logger?.LogInformation($"Getting games by category: {category}");

                // Use EF Core to get games by category
                var games = await _context.Games
                    .Where(g => g.Category == category && g.IsActive)
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved {games.Count} games of category {category}");

                return games;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving games by category: {category}");
                throw;
            }
        }

        public async Task<IEnumerable<Game>> GetFeaturedGamesAsync()
        {
            try
            {
                _logger?.LogInformation("Getting featured games");

                // Use EF Core to get featured games
                var games = await _context.Games
                    .Where(g => g.IsFeatured && g.IsActive)
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved {games.Count} featured games");

                return games;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error retrieving featured games");
                throw;
            }
        }

        public async Task<IEnumerable<Game>> GetPopularGamesAsync(int count)
        {
            try
            {
                _logger?.LogInformation($"Getting popular games (top {count})");

                // Get most played games by aggregating session data
                var popularGameIds = await _context.GameSessions
                    .Where(gs => gs.StartTime >= DateTime.UtcNow.AddDays(-30)) // Last 30 days
                    .GroupBy(gs => gs.GameId)
                    .OrderByDescending(g => g.Count())
                    .Select(g => g.Key)
                    .Take(count)
                    .ToListAsync();

                // Return the actual game objects in the correct order
                var games = await _context.Games
                    .Where(g => popularGameIds.Contains(g.Id) && g.IsActive)
                    .ToListAsync();

                // Preserve the order from popularGameIds
                var orderedGames = popularGameIds
                    .Select(id => games.FirstOrDefault(g => g.Id == id))
                    .Where(g => g != null)
                    .ToList();

                _logger?.LogInformation($"Retrieved {orderedGames.Count} popular games");

                return orderedGames;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving popular games");
                throw;
            }
        }

        public async Task<IEnumerable<Game>> GetNewReleasesAsync(int count)
        {
            try
            {
                _logger?.LogInformation($"Getting new releases (top {count})");

                // Use EF Core to get new releases
                var games = await _context.Games
                    .Where(g => g.IsActive)
                    .OrderByDescending(g => g.ReleaseDate)
                    .Take(count)
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved {games.Count} new releases");

                return games;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving new releases");
                throw;
            }
        }
    }
}