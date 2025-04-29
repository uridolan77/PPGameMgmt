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
    public class GameRepository : IGameRepository
    {
        private readonly CasinoDbContext _context;
        private static ILogger<GameRepository> _logger;

        public GameRepository(CasinoDbContext context, ILogger<GameRepository> logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public async Task<Game> GetByIdAsync(string id)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting game with ID: {id}");
                }

                // Use raw SQL to avoid enum conversion issues
                Game game = null;

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            provider,
                            type,
                            category,
                            genre,
                            description,
                            is_featured,
                            rtp,
                            minimum_bet,
                            maximum_bet,
                            release_date,
                            thumbnail_url,
                            game_url,
                            is_active
                        FROM games
                        WHERE id = @id";

                    // Add parameter
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = "@id";
                    parameter.Value = id;
                    command.Parameters.Add(parameter);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            game = new Game
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Provider = reader["provider"].ToString(),
                                Type = ParseEnum<GameType>(reader["type"].ToString()),
                                Category = ParseEnum<GameCategory>(reader["category"].ToString()),
                                Genre = reader["genre"] != DBNull.Value ? reader["genre"].ToString() : null,
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                IsFeatured = Convert.ToBoolean(reader["is_featured"]),
                                RTP = Convert.ToDecimal(reader["rtp"]),
                                MinimumBet = Convert.ToDecimal(reader["minimum_bet"]),
                                MaximumBet = Convert.ToDecimal(reader["maximum_bet"]),
                                ReleaseDate = Convert.ToDateTime(reader["release_date"]),
                                ThumbnailUrl = reader["thumbnail_url"] != DBNull.Value ? reader["thumbnail_url"].ToString() : null,
                                GameUrl = reader["game_url"] != DBNull.Value ? reader["game_url"].ToString() : null,
                                IsActive = Convert.ToBoolean(reader["is_active"])
                            };
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation(game != null
                        ? $"Retrieved game with ID: {id}"
                        : $"No game found with ID: {id}");
                }

                return game;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving game with ID: {id}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Game>> GetAllAsync()
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation("Getting all games");
                }

                // Use raw SQL to avoid enum conversion issues
                var games = new List<Game>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            provider,
                            type,
                            category,
                            genre,
                            description,
                            is_featured,
                            rtp,
                            minimum_bet,
                            maximum_bet,
                            release_date,
                            thumbnail_url,
                            game_url,
                            is_active
                        FROM games";

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var game = new Game
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Provider = reader["provider"].ToString(),
                                Type = ParseEnum<GameType>(reader["type"].ToString()),
                                Category = ParseEnum<GameCategory>(reader["category"].ToString()),
                                Genre = reader["genre"] != DBNull.Value ? reader["genre"].ToString() : null,
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                IsFeatured = Convert.ToBoolean(reader["is_featured"]),
                                RTP = Convert.ToDecimal(reader["rtp"]),
                                MinimumBet = Convert.ToDecimal(reader["minimum_bet"]),
                                MaximumBet = Convert.ToDecimal(reader["maximum_bet"]),
                                ReleaseDate = Convert.ToDateTime(reader["release_date"]),
                                ThumbnailUrl = reader["thumbnail_url"] != DBNull.Value ? reader["thumbnail_url"].ToString() : null,
                                GameUrl = reader["game_url"] != DBNull.Value ? reader["game_url"].ToString() : null,
                                IsActive = Convert.ToBoolean(reader["is_active"])
                            };

                            games.Add(game);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {games.Count} games");
                }

                return games;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, "Error retrieving all games");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Game>> FindAsync(Expression<Func<Game, bool>> predicate)
        {
            // This method is more complex to implement with raw SQL
            // For now, we'll use EF Core and handle any exceptions
            try
            {
                return await _context.Games.Where(predicate).ToListAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, "Error finding games with predicate");
                }
                throw;
            }
        }

        public async Task AddAsync(Game entity)
        {
            try
            {
                await _context.Games.AddAsync(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error adding game: {entity.Name}");
                }
                throw;
            }
        }

        public async Task UpdateAsync(Game entity)
        {
            try
            {
                _context.Games.Update(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error updating game: {entity.Id}");
                }
                throw;
            }
        }

        public async Task DeleteAsync(Game entity)
        {
            try
            {
                _context.Games.Remove(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error deleting game: {entity.Id}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting games by type: {type}");
                }

                // Use raw SQL to avoid enum conversion issues
                var games = new List<Game>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            provider,
                            type,
                            category,
                            genre,
                            description,
                            is_featured,
                            rtp,
                            minimum_bet,
                            maximum_bet,
                            release_date,
                            thumbnail_url,
                            game_url,
                            is_active
                        FROM games
                        WHERE type = @type
                          AND is_active = 1";

                    // Add parameter
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = "@type";
                    parameter.Value = type.ToString();
                    command.Parameters.Add(parameter);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var game = new Game
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Provider = reader["provider"].ToString(),
                                Type = ParseEnum<GameType>(reader["type"].ToString()),
                                Category = ParseEnum<GameCategory>(reader["category"].ToString()),
                                Genre = reader["genre"] != DBNull.Value ? reader["genre"].ToString() : null,
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                IsFeatured = Convert.ToBoolean(reader["is_featured"]),
                                RTP = Convert.ToDecimal(reader["rtp"]),
                                MinimumBet = Convert.ToDecimal(reader["minimum_bet"]),
                                MaximumBet = Convert.ToDecimal(reader["maximum_bet"]),
                                ReleaseDate = Convert.ToDateTime(reader["release_date"]),
                                ThumbnailUrl = reader["thumbnail_url"] != DBNull.Value ? reader["thumbnail_url"].ToString() : null,
                                GameUrl = reader["game_url"] != DBNull.Value ? reader["game_url"].ToString() : null,
                                IsActive = Convert.ToBoolean(reader["is_active"])
                            };

                            games.Add(game);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {games.Count} games of type {type}");
                }

                return games;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving games by type: {type}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting games by category: {category}");
                }

                // Use raw SQL to avoid enum conversion issues
                var games = new List<Game>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            provider,
                            type,
                            category,
                            genre,
                            description,
                            is_featured,
                            rtp,
                            minimum_bet,
                            maximum_bet,
                            release_date,
                            thumbnail_url,
                            game_url,
                            is_active
                        FROM games
                        WHERE category = @category
                          AND is_active = 1";

                    // Add parameter
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = "@category";
                    parameter.Value = category.ToString();
                    command.Parameters.Add(parameter);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var game = new Game
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Provider = reader["provider"].ToString(),
                                Type = ParseEnum<GameType>(reader["type"].ToString()),
                                Category = ParseEnum<GameCategory>(reader["category"].ToString()),
                                Genre = reader["genre"] != DBNull.Value ? reader["genre"].ToString() : null,
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                IsFeatured = Convert.ToBoolean(reader["is_featured"]),
                                RTP = Convert.ToDecimal(reader["rtp"]),
                                MinimumBet = Convert.ToDecimal(reader["minimum_bet"]),
                                MaximumBet = Convert.ToDecimal(reader["maximum_bet"]),
                                ReleaseDate = Convert.ToDateTime(reader["release_date"]),
                                ThumbnailUrl = reader["thumbnail_url"] != DBNull.Value ? reader["thumbnail_url"].ToString() : null,
                                GameUrl = reader["game_url"] != DBNull.Value ? reader["game_url"].ToString() : null,
                                IsActive = Convert.ToBoolean(reader["is_active"])
                            };

                            games.Add(game);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {games.Count} games of category {category}");
                }

                return games;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving games by category: {category}");
                }
                throw;
            }
        }

        // Helper method to parse enum values
        private static T ParseEnum<T>(string value) where T : struct
        {
            if (Enum.TryParse<T>(value, true, out var result))
            {
                return result;
            }

            throw new ArgumentException($"Cannot convert '{value}' to enum type {typeof(T).Name}");
        }

        public async Task<IEnumerable<Game>> GetPopularGamesAsync(int count)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting popular games (top {count})");
                }

                // Get most played games by aggregating session data
                var popularGameIds = await _context.GameSessions
                    .Where(gs => gs.StartTime >= DateTime.UtcNow.AddDays(-30)) // Last 30 days
                    .GroupBy(gs => gs.GameId)
                    .OrderByDescending(g => g.Count())
                    .Select(g => g.Key)
                    .Take(count)
                    .ToListAsync();

                // Return the actual game objects in the correct order
                var popularGames = new List<Game>();
                foreach (var gameId in popularGameIds)
                {
                    var game = await GetByIdAsync(gameId);
                    if (game != null && game.IsActive)
                    {
                        popularGames.Add(game);
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {popularGames.Count} popular games");
                }

                return popularGames;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving popular games");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Game>> GetNewReleasesAsync(int count)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting new releases (top {count})");
                }

                // Use raw SQL to avoid enum conversion issues
                var games = new List<Game>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            provider,
                            type,
                            category,
                            genre,
                            description,
                            is_featured,
                            rtp,
                            minimum_bet,
                            maximum_bet,
                            release_date,
                            thumbnail_url,
                            game_url,
                            is_active
                        FROM games
                        WHERE is_active = 1
                        ORDER BY release_date DESC
                        LIMIT @count";

                    // Add parameter
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = "@count";
                    parameter.Value = count;
                    command.Parameters.Add(parameter);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var game = new Game
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Provider = reader["provider"].ToString(),
                                Type = ParseEnum<GameType>(reader["type"].ToString()),
                                Category = ParseEnum<GameCategory>(reader["category"].ToString()),
                                Genre = reader["genre"] != DBNull.Value ? reader["genre"].ToString() : null,
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                IsFeatured = Convert.ToBoolean(reader["is_featured"]),
                                RTP = Convert.ToDecimal(reader["rtp"]),
                                MinimumBet = Convert.ToDecimal(reader["minimum_bet"]),
                                MaximumBet = Convert.ToDecimal(reader["maximum_bet"]),
                                ReleaseDate = Convert.ToDateTime(reader["release_date"]),
                                ThumbnailUrl = reader["thumbnail_url"] != DBNull.Value ? reader["thumbnail_url"].ToString() : null,
                                GameUrl = reader["game_url"] != DBNull.Value ? reader["game_url"].ToString() : null,
                                IsActive = Convert.ToBoolean(reader["is_active"])
                            };

                            games.Add(game);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {games.Count} new releases");
                }

                return games;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving new releases");
                }
                throw;
            }
        }
    }
}