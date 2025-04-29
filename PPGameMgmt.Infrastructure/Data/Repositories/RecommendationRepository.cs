using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class RecommendationRepository : IRecommendationRepository
    {
        private readonly CasinoDbContext _context;
        private static ILogger<RecommendationRepository> _logger;
        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
        };

        public RecommendationRepository(CasinoDbContext context, ILogger<RecommendationRepository> logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public async Task<Recommendation> GetByIdAsync(string id)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting recommendation with ID: {id}");
                }

                // Use raw SQL to avoid complex object serialization issues
                Recommendation recommendation = null;

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            player_id,
                            created_at,
                            valid_until,
                            is_displayed,
                            is_clicked,
                            is_accepted,
                            displayed_at,
                            clicked_at,
                            accepted_at,
                            is_viewed,
                            is_played,
                            recommended_games,
                            recommended_bonus
                        FROM recommendations
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
                            recommendation = new Recommendation
                            {
                                Id = reader["id"].ToString(),
                                PlayerId = reader["player_id"].ToString(),
                                CreatedAt = Convert.ToDateTime(reader["created_at"]),
                                ValidUntil = Convert.ToDateTime(reader["valid_until"]),
                                IsDisplayed = Convert.ToBoolean(reader["is_displayed"]),
                                IsClicked = Convert.ToBoolean(reader["is_clicked"]),
                                IsAccepted = Convert.ToBoolean(reader["is_accepted"]),
                                DisplayedAt = reader["displayed_at"] != DBNull.Value ? Convert.ToDateTime(reader["displayed_at"]) : null,
                                ClickedAt = reader["clicked_at"] != DBNull.Value ? Convert.ToDateTime(reader["clicked_at"]) : null,
                                AcceptedAt = reader["accepted_at"] != DBNull.Value ? Convert.ToDateTime(reader["accepted_at"]) : null,
                                IsViewed = Convert.ToBoolean(reader["is_viewed"]),
                                IsPlayed = Convert.ToBoolean(reader["is_played"]),
                                RecommendedGames = reader["recommended_games"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<List<GameRecommendation>>(reader["recommended_games"].ToString(), _jsonOptions)
                                    : new List<GameRecommendation>(),
                                RecommendedBonus = reader["recommended_bonus"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<BonusRecommendation>(reader["recommended_bonus"].ToString(), _jsonOptions)
                                    : null
                            };
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation(recommendation != null
                        ? $"Retrieved recommendation with ID: {id}"
                        : $"No recommendation found with ID: {id}");
                }

                return recommendation;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving recommendation with ID: {id}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Recommendation>> GetAllAsync()
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation("Getting all recommendations");
                }

                // Use raw SQL to avoid complex object serialization issues
                var recommendations = new List<Recommendation>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            player_id,
                            created_at,
                            valid_until,
                            is_displayed,
                            is_clicked,
                            is_accepted,
                            displayed_at,
                            clicked_at,
                            accepted_at,
                            is_viewed,
                            is_played,
                            recommended_games,
                            recommended_bonus
                        FROM recommendations";

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var recommendation = new Recommendation
                            {
                                Id = reader["id"].ToString(),
                                PlayerId = reader["player_id"].ToString(),
                                CreatedAt = Convert.ToDateTime(reader["created_at"]),
                                ValidUntil = Convert.ToDateTime(reader["valid_until"]),
                                IsDisplayed = Convert.ToBoolean(reader["is_displayed"]),
                                IsClicked = Convert.ToBoolean(reader["is_clicked"]),
                                IsAccepted = Convert.ToBoolean(reader["is_accepted"]),
                                DisplayedAt = reader["displayed_at"] != DBNull.Value ? Convert.ToDateTime(reader["displayed_at"]) : null,
                                ClickedAt = reader["clicked_at"] != DBNull.Value ? Convert.ToDateTime(reader["clicked_at"]) : null,
                                AcceptedAt = reader["accepted_at"] != DBNull.Value ? Convert.ToDateTime(reader["accepted_at"]) : null,
                                IsViewed = Convert.ToBoolean(reader["is_viewed"]),
                                IsPlayed = Convert.ToBoolean(reader["is_played"]),
                                RecommendedGames = reader["recommended_games"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<List<GameRecommendation>>(reader["recommended_games"].ToString(), _jsonOptions)
                                    : new List<GameRecommendation>(),
                                RecommendedBonus = reader["recommended_bonus"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<BonusRecommendation>(reader["recommended_bonus"].ToString(), _jsonOptions)
                                    : null
                            };

                            recommendations.Add(recommendation);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {recommendations.Count} recommendations");
                }

                return recommendations;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, "Error retrieving all recommendations");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Recommendation>> FindAsync(Expression<Func<Recommendation, bool>> predicate)
        {
            // This method is more complex to implement with raw SQL
            // For now, we'll use EF Core and handle any exceptions
            try
            {
                return await _context.Recommendations.Where(predicate).ToListAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, "Error finding recommendations with predicate");
                }
                throw;
            }
        }

        public async Task AddAsync(Recommendation entity)
        {
            try
            {
                await _context.Recommendations.AddAsync(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error adding recommendation for player: {entity.PlayerId}");
                }
                throw;
            }
        }

        public async Task UpdateAsync(Recommendation entity)
        {
            try
            {
                _context.Recommendations.Update(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error updating recommendation: {entity.Id}");
                }
                throw;
            }
        }

        public async Task DeleteAsync(Recommendation entity)
        {
            try
            {
                _context.Recommendations.Remove(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error deleting recommendation: {entity.Id}");
                }
                throw;
            }
        }

        public async Task<Recommendation> GetLatestRecommendationForPlayerAsync(string playerId)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting latest recommendation for player: {playerId}");
                }

                // Use raw SQL to avoid complex object serialization issues
                Recommendation recommendation = null;

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            player_id,
                            created_at,
                            valid_until,
                            is_displayed,
                            is_clicked,
                            is_accepted,
                            displayed_at,
                            clicked_at,
                            accepted_at,
                            is_viewed,
                            is_played,
                            recommended_games,
                            recommended_bonus
                        FROM recommendations
                        WHERE player_id = @playerId
                        ORDER BY created_at DESC
                        LIMIT 1";

                    // Add parameter
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = "@playerId";
                    parameter.Value = playerId;
                    command.Parameters.Add(parameter);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        if (await reader.ReadAsync())
                        {
                            recommendation = new Recommendation
                            {
                                Id = reader["id"].ToString(),
                                PlayerId = reader["player_id"].ToString(),
                                CreatedAt = Convert.ToDateTime(reader["created_at"]),
                                ValidUntil = Convert.ToDateTime(reader["valid_until"]),
                                IsDisplayed = Convert.ToBoolean(reader["is_displayed"]),
                                IsClicked = Convert.ToBoolean(reader["is_clicked"]),
                                IsAccepted = Convert.ToBoolean(reader["is_accepted"]),
                                DisplayedAt = reader["displayed_at"] != DBNull.Value ? Convert.ToDateTime(reader["displayed_at"]) : null,
                                ClickedAt = reader["clicked_at"] != DBNull.Value ? Convert.ToDateTime(reader["clicked_at"]) : null,
                                AcceptedAt = reader["accepted_at"] != DBNull.Value ? Convert.ToDateTime(reader["accepted_at"]) : null,
                                IsViewed = Convert.ToBoolean(reader["is_viewed"]),
                                IsPlayed = Convert.ToBoolean(reader["is_played"]),
                                RecommendedGames = reader["recommended_games"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<List<GameRecommendation>>(reader["recommended_games"].ToString(), _jsonOptions)
                                    : new List<GameRecommendation>(),
                                RecommendedBonus = reader["recommended_bonus"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<BonusRecommendation>(reader["recommended_bonus"].ToString(), _jsonOptions)
                                    : null
                            };
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation(recommendation != null
                        ? $"Retrieved latest recommendation for player: {playerId}"
                        : $"No recommendation found for player: {playerId}");
                }

                return recommendation;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving latest recommendation for player: {playerId}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Recommendation>> GetRecommendationHistoryForPlayerAsync(string playerId, int limit = 10)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting recommendation history for player: {playerId}, limit: {limit}");
                }

                // Use raw SQL to avoid complex object serialization issues
                var recommendations = new List<Recommendation>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            player_id,
                            created_at,
                            valid_until,
                            is_displayed,
                            is_clicked,
                            is_accepted,
                            displayed_at,
                            clicked_at,
                            accepted_at,
                            is_viewed,
                            is_played,
                            recommended_games,
                            recommended_bonus
                        FROM recommendations
                        WHERE player_id = @playerId
                        ORDER BY created_at DESC
                        LIMIT @limit";

                    // Add parameters
                    var playerIdParam = command.CreateParameter();
                    playerIdParam.ParameterName = "@playerId";
                    playerIdParam.Value = playerId;
                    command.Parameters.Add(playerIdParam);

                    var limitParam = command.CreateParameter();
                    limitParam.ParameterName = "@limit";
                    limitParam.Value = limit;
                    command.Parameters.Add(limitParam);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var recommendation = new Recommendation
                            {
                                Id = reader["id"].ToString(),
                                PlayerId = reader["player_id"].ToString(),
                                CreatedAt = Convert.ToDateTime(reader["created_at"]),
                                ValidUntil = Convert.ToDateTime(reader["valid_until"]),
                                IsDisplayed = Convert.ToBoolean(reader["is_displayed"]),
                                IsClicked = Convert.ToBoolean(reader["is_clicked"]),
                                IsAccepted = Convert.ToBoolean(reader["is_accepted"]),
                                DisplayedAt = reader["displayed_at"] != DBNull.Value ? Convert.ToDateTime(reader["displayed_at"]) : null,
                                ClickedAt = reader["clicked_at"] != DBNull.Value ? Convert.ToDateTime(reader["clicked_at"]) : null,
                                AcceptedAt = reader["accepted_at"] != DBNull.Value ? Convert.ToDateTime(reader["accepted_at"]) : null,
                                IsViewed = Convert.ToBoolean(reader["is_viewed"]),
                                IsPlayed = Convert.ToBoolean(reader["is_played"]),
                                RecommendedGames = reader["recommended_games"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<List<GameRecommendation>>(reader["recommended_games"].ToString(), _jsonOptions)
                                    : new List<GameRecommendation>(),
                                RecommendedBonus = reader["recommended_bonus"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<BonusRecommendation>(reader["recommended_bonus"].ToString(), _jsonOptions)
                                    : null
                            };

                            recommendations.Add(recommendation);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {recommendations.Count} recommendation history items for player: {playerId}");
                }

                return recommendations;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving recommendation history for player: {playerId}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Recommendation>> GetPendingRecommendationsAsync()
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation("Getting pending recommendations");
                }

                // Use raw SQL to avoid complex object serialization issues
                var recommendations = new List<Recommendation>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            player_id,
                            created_at,
                            valid_until,
                            is_displayed,
                            is_clicked,
                            is_accepted,
                            displayed_at,
                            clicked_at,
                            accepted_at,
                            is_viewed,
                            is_played,
                            recommended_games,
                            recommended_bonus
                        FROM recommendations
                        WHERE is_viewed = 0 AND is_played = 0
                        ORDER BY created_at DESC";

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var recommendation = new Recommendation
                            {
                                Id = reader["id"].ToString(),
                                PlayerId = reader["player_id"].ToString(),
                                CreatedAt = Convert.ToDateTime(reader["created_at"]),
                                ValidUntil = Convert.ToDateTime(reader["valid_until"]),
                                IsDisplayed = Convert.ToBoolean(reader["is_displayed"]),
                                IsClicked = Convert.ToBoolean(reader["is_clicked"]),
                                IsAccepted = Convert.ToBoolean(reader["is_accepted"]),
                                DisplayedAt = reader["displayed_at"] != DBNull.Value ? Convert.ToDateTime(reader["displayed_at"]) : null,
                                ClickedAt = reader["clicked_at"] != DBNull.Value ? Convert.ToDateTime(reader["clicked_at"]) : null,
                                AcceptedAt = reader["accepted_at"] != DBNull.Value ? Convert.ToDateTime(reader["accepted_at"]) : null,
                                IsViewed = Convert.ToBoolean(reader["is_viewed"]),
                                IsPlayed = Convert.ToBoolean(reader["is_played"]),
                                RecommendedGames = reader["recommended_games"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<List<GameRecommendation>>(reader["recommended_games"].ToString(), _jsonOptions)
                                    : new List<GameRecommendation>(),
                                RecommendedBonus = reader["recommended_bonus"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<BonusRecommendation>(reader["recommended_bonus"].ToString(), _jsonOptions)
                                    : null
                            };

                            recommendations.Add(recommendation);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {recommendations.Count} pending recommendations");
                }

                return recommendations;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, "Error retrieving pending recommendations");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Recommendation>> GetSuccessfulRecommendationsAsync(int days)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-days);

                if (_logger != null)
                {
                    _logger.LogInformation($"Getting successful recommendations since {cutoffDate}");
                }

                // Use raw SQL to avoid complex object serialization issues
                var recommendations = new List<Recommendation>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            player_id,
                            created_at,
                            valid_until,
                            is_displayed,
                            is_clicked,
                            is_accepted,
                            displayed_at,
                            clicked_at,
                            accepted_at,
                            is_viewed,
                            is_played,
                            recommended_games,
                            recommended_bonus
                        FROM recommendations
                        WHERE is_played = 1 AND created_at >= @cutoffDate
                        ORDER BY created_at DESC";

                    // Add parameter
                    var cutoffParam = command.CreateParameter();
                    cutoffParam.ParameterName = "@cutoffDate";
                    cutoffParam.Value = cutoffDate;
                    command.Parameters.Add(cutoffParam);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var recommendation = new Recommendation
                            {
                                Id = reader["id"].ToString(),
                                PlayerId = reader["player_id"].ToString(),
                                CreatedAt = Convert.ToDateTime(reader["created_at"]),
                                ValidUntil = Convert.ToDateTime(reader["valid_until"]),
                                IsDisplayed = Convert.ToBoolean(reader["is_displayed"]),
                                IsClicked = Convert.ToBoolean(reader["is_clicked"]),
                                IsAccepted = Convert.ToBoolean(reader["is_accepted"]),
                                DisplayedAt = reader["displayed_at"] != DBNull.Value ? Convert.ToDateTime(reader["displayed_at"]) : null,
                                ClickedAt = reader["clicked_at"] != DBNull.Value ? Convert.ToDateTime(reader["clicked_at"]) : null,
                                AcceptedAt = reader["accepted_at"] != DBNull.Value ? Convert.ToDateTime(reader["accepted_at"]) : null,
                                IsViewed = Convert.ToBoolean(reader["is_viewed"]),
                                IsPlayed = Convert.ToBoolean(reader["is_played"]),
                                RecommendedGames = reader["recommended_games"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<List<GameRecommendation>>(reader["recommended_games"].ToString(), _jsonOptions)
                                    : new List<GameRecommendation>(),
                                RecommendedBonus = reader["recommended_bonus"] != DBNull.Value
                                    ? JsonSerializer.Deserialize<BonusRecommendation>(reader["recommended_bonus"].ToString(), _jsonOptions)
                                    : null
                            };

                            recommendations.Add(recommendation);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {recommendations.Count} successful recommendations");
                }

                return recommendations;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving successful recommendations for the last {days} days");
                }
                throw;
            }
        }
    }
}