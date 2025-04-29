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
    public class BonusRepository : IBonusRepository
    {
        private readonly CasinoDbContext _context;
        private static ILogger<BonusRepository> _logger;

        public BonusRepository(CasinoDbContext context, ILogger<BonusRepository> logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public async Task<Bonus> GetByIdAsync(string id)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting bonus with ID: {id}");
                }

                // Use raw SQL to avoid enum conversion issues
                Bonus bonus = null;

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            description,
                            type,
                            amount,
                            percentage_match,
                            minimum_deposit,
                            wagering_requirement,
                            start_date,
                            end_date,
                            is_active,
                            is_global,
                            game_id,
                            target_segment,
                            applicable_game_ids,
                            target_segments
                        FROM bonuses
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
                            bonus = new Bonus
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                Type = ParseEnum<BonusType>(reader["type"].ToString()),
                                Amount = Convert.ToDecimal(reader["amount"]),
                                PercentageMatch = reader["percentage_match"] != DBNull.Value ? Convert.ToDecimal(reader["percentage_match"]) : null,
                                MinimumDeposit = reader["minimum_deposit"] != DBNull.Value ? Convert.ToDecimal(reader["minimum_deposit"]) : null,
                                WageringRequirement = reader["wagering_requirement"] != DBNull.Value ? Convert.ToInt32(reader["wagering_requirement"]) : null,
                                StartDate = Convert.ToDateTime(reader["start_date"]),
                                EndDate = Convert.ToDateTime(reader["end_date"]),
                                IsActive = Convert.ToBoolean(reader["is_active"]),
                                IsGlobal = Convert.ToBoolean(reader["is_global"]),
                                GameId = reader["game_id"] != DBNull.Value ? reader["game_id"].ToString() : null,
                                TargetSegment = ParseEnum<PlayerSegment>(reader["target_segment"].ToString()),
                                // Handle JSON arrays
                                ApplicableGameIds = reader["applicable_game_ids"] != DBNull.Value ?
                                    DeserializeJsonArray<string>(reader["applicable_game_ids"].ToString()) : null,
                                TargetSegments = reader["target_segments"] != DBNull.Value ?
                                    DeserializePlayerSegmentArray(reader["target_segments"].ToString()) : null
                            };
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation(bonus != null
                        ? $"Retrieved bonus with ID: {id}"
                        : $"No bonus found with ID: {id}");
                }

                return bonus;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving bonus with ID: {id}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Bonus>> GetAllAsync()
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation("Getting all bonuses");
                }

                // Use raw SQL to avoid enum conversion issues
                var bonuses = new List<Bonus>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            description,
                            type,
                            amount,
                            percentage_match,
                            minimum_deposit,
                            wagering_requirement,
                            start_date,
                            end_date,
                            is_active,
                            is_global,
                            game_id,
                            target_segment,
                            applicable_game_ids,
                            target_segments
                        FROM bonuses";

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var bonus = new Bonus
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                Type = ParseEnum<BonusType>(reader["type"].ToString()),
                                Amount = Convert.ToDecimal(reader["amount"]),
                                PercentageMatch = reader["percentage_match"] != DBNull.Value ? Convert.ToDecimal(reader["percentage_match"]) : null,
                                MinimumDeposit = reader["minimum_deposit"] != DBNull.Value ? Convert.ToDecimal(reader["minimum_deposit"]) : null,
                                WageringRequirement = reader["wagering_requirement"] != DBNull.Value ? Convert.ToInt32(reader["wagering_requirement"]) : null,
                                StartDate = Convert.ToDateTime(reader["start_date"]),
                                EndDate = Convert.ToDateTime(reader["end_date"]),
                                IsActive = Convert.ToBoolean(reader["is_active"]),
                                IsGlobal = Convert.ToBoolean(reader["is_global"]),
                                GameId = reader["game_id"] != DBNull.Value ? reader["game_id"].ToString() : null,
                                TargetSegment = ParseEnum<PlayerSegment>(reader["target_segment"].ToString()),
                                // Handle JSON arrays
                                ApplicableGameIds = reader["applicable_game_ids"] != DBNull.Value ?
                                    System.Text.Json.JsonSerializer.Deserialize<string[]>(reader["applicable_game_ids"].ToString()) : null,
                                TargetSegments = reader["target_segments"] != DBNull.Value ?
                                    System.Text.Json.JsonSerializer.Deserialize<PlayerSegment[]>(reader["target_segments"].ToString()) : null
                            };

                            bonuses.Add(bonus);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {bonuses.Count} bonuses");
                }

                return bonuses;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, "Error retrieving all bonuses");
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

        // Helper method to deserialize JSON arrays
        private static T[] DeserializeJsonArray<T>(string json)
        {
            try
            {
                // Handle empty arrays
                if (string.IsNullOrWhiteSpace(json) || json == "[]" || json == "null")
                {
                    return Array.Empty<T>();
                }

                // Use System.Text.Json to deserialize
                return System.Text.Json.JsonSerializer.Deserialize<T[]>(json);
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error deserializing JSON array: {json}");
                }
                return Array.Empty<T>();
            }
        }

        // Special helper method for PlayerSegment arrays
        private static PlayerSegment[] DeserializePlayerSegmentArray(string json)
        {
            try
            {
                // Handle empty arrays
                if (string.IsNullOrWhiteSpace(json) || json == "[]" || json == "null")
                {
                    return Array.Empty<PlayerSegment>();
                }

                // Try to deserialize as string array first (MySQL might store enum values as strings)
                var stringValues = System.Text.Json.JsonSerializer.Deserialize<string[]>(json);
                if (stringValues != null)
                {
                    // Convert string values to enum values
                    return stringValues.Select(s => ParseEnum<PlayerSegment>(s)).ToArray();
                }

                return Array.Empty<PlayerSegment>();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error deserializing PlayerSegment array: {json}");
                }
                return Array.Empty<PlayerSegment>();
            }
        }

        public async Task<IEnumerable<Bonus>> FindAsync(Expression<Func<Bonus, bool>> predicate)
        {
            return await _context.Bonuses.Where(predicate).ToListAsync();
        }

        public async Task AddAsync(Bonus entity)
        {
            await _context.Bonuses.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Bonus entity)
        {
            _context.Bonuses.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Bonus entity)
        {
            _context.Bonuses.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Bonus>> GetActiveGlobalBonusesAsync()
        {
            try
            {
                var now = DateTime.UtcNow;
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting active global bonuses at {now}");
                }

                // Use raw SQL to avoid enum conversion issues
                var bonuses = new List<Bonus>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            description,
                            type,
                            amount,
                            percentage_match,
                            minimum_deposit,
                            wagering_requirement,
                            start_date,
                            end_date,
                            is_active,
                            is_global,
                            game_id,
                            target_segment,
                            applicable_game_ids,
                            target_segments
                        FROM bonuses
                        WHERE is_global = 1
                          AND start_date <= @now
                          AND end_date >= @now";

                    // Add parameter
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = "@now";
                    parameter.Value = now;
                    command.Parameters.Add(parameter);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var bonus = new Bonus
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                Type = ParseEnum<BonusType>(reader["type"].ToString()),
                                Amount = Convert.ToDecimal(reader["amount"]),
                                PercentageMatch = reader["percentage_match"] != DBNull.Value ? Convert.ToDecimal(reader["percentage_match"]) : null,
                                MinimumDeposit = reader["minimum_deposit"] != DBNull.Value ? Convert.ToDecimal(reader["minimum_deposit"]) : null,
                                WageringRequirement = reader["wagering_requirement"] != DBNull.Value ? Convert.ToInt32(reader["wagering_requirement"]) : null,
                                StartDate = Convert.ToDateTime(reader["start_date"]),
                                EndDate = Convert.ToDateTime(reader["end_date"]),
                                IsActive = Convert.ToBoolean(reader["is_active"]),
                                IsGlobal = Convert.ToBoolean(reader["is_global"]),
                                GameId = reader["game_id"] != DBNull.Value ? reader["game_id"].ToString() : null,
                                TargetSegment = ParseEnum<PlayerSegment>(reader["target_segment"].ToString()),
                                // Handle JSON arrays
                                ApplicableGameIds = reader["applicable_game_ids"] != DBNull.Value ?
                                    DeserializeJsonArray<string>(reader["applicable_game_ids"].ToString()) : null,
                                TargetSegments = reader["target_segments"] != DBNull.Value ?
                                    DeserializePlayerSegmentArray(reader["target_segments"].ToString()) : null
                            };

                            bonuses.Add(bonus);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {bonuses.Count} active global bonuses");
                }

                return bonuses;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, "Error retrieving active global bonuses");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(BonusType type)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting bonuses by type: {type}");
                }

                // Use raw SQL to avoid enum conversion issues
                var bonuses = new List<Bonus>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            description,
                            type,
                            amount,
                            percentage_match,
                            minimum_deposit,
                            wagering_requirement,
                            start_date,
                            end_date,
                            is_active,
                            is_global,
                            game_id,
                            target_segment,
                            applicable_game_ids,
                            target_segments
                        FROM bonuses
                        WHERE type = @type";

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
                            var bonus = new Bonus
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                Type = ParseEnum<BonusType>(reader["type"].ToString()),
                                Amount = Convert.ToDecimal(reader["amount"]),
                                PercentageMatch = reader["percentage_match"] != DBNull.Value ? Convert.ToDecimal(reader["percentage_match"]) : null,
                                MinimumDeposit = reader["minimum_deposit"] != DBNull.Value ? Convert.ToDecimal(reader["minimum_deposit"]) : null,
                                WageringRequirement = reader["wagering_requirement"] != DBNull.Value ? Convert.ToInt32(reader["wagering_requirement"]) : null,
                                StartDate = Convert.ToDateTime(reader["start_date"]),
                                EndDate = Convert.ToDateTime(reader["end_date"]),
                                IsActive = Convert.ToBoolean(reader["is_active"]),
                                IsGlobal = Convert.ToBoolean(reader["is_global"]),
                                GameId = reader["game_id"] != DBNull.Value ? reader["game_id"].ToString() : null,
                                TargetSegment = ParseEnum<PlayerSegment>(reader["target_segment"].ToString()),
                                // Handle JSON arrays
                                ApplicableGameIds = reader["applicable_game_ids"] != DBNull.Value ?
                                    DeserializeJsonArray<string>(reader["applicable_game_ids"].ToString()) : null,
                                TargetSegments = reader["target_segments"] != DBNull.Value ?
                                    DeserializePlayerSegmentArray(reader["target_segments"].ToString()) : null
                            };

                            bonuses.Add(bonus);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {bonuses.Count} bonuses of type {type}");
                }

                return bonuses;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving bonuses by type: {type}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForPlayerSegmentAsync(PlayerSegment segment)
        {
            try
            {
                var now = DateTime.UtcNow;
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting bonuses for player segment: {segment} at {now}");
                }

                // Use raw SQL to avoid enum conversion issues
                var bonuses = new List<Bonus>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            description,
                            type,
                            amount,
                            percentage_match,
                            minimum_deposit,
                            wagering_requirement,
                            start_date,
                            end_date,
                            is_active,
                            is_global,
                            game_id,
                            target_segment,
                            applicable_game_ids,
                            target_segments
                        FROM bonuses
                        WHERE target_segment = @segment
                          AND start_date <= @now
                          AND end_date >= @now";

                    // Add parameters
                    var segmentParam = command.CreateParameter();
                    segmentParam.ParameterName = "@segment";
                    segmentParam.Value = segment.ToString();
                    command.Parameters.Add(segmentParam);

                    var nowParam = command.CreateParameter();
                    nowParam.ParameterName = "@now";
                    nowParam.Value = now;
                    command.Parameters.Add(nowParam);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var bonus = new Bonus
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                Type = ParseEnum<BonusType>(reader["type"].ToString()),
                                Amount = Convert.ToDecimal(reader["amount"]),
                                PercentageMatch = reader["percentage_match"] != DBNull.Value ? Convert.ToDecimal(reader["percentage_match"]) : null,
                                MinimumDeposit = reader["minimum_deposit"] != DBNull.Value ? Convert.ToDecimal(reader["minimum_deposit"]) : null,
                                WageringRequirement = reader["wagering_requirement"] != DBNull.Value ? Convert.ToInt32(reader["wagering_requirement"]) : null,
                                StartDate = Convert.ToDateTime(reader["start_date"]),
                                EndDate = Convert.ToDateTime(reader["end_date"]),
                                IsActive = Convert.ToBoolean(reader["is_active"]),
                                IsGlobal = Convert.ToBoolean(reader["is_global"]),
                                GameId = reader["game_id"] != DBNull.Value ? reader["game_id"].ToString() : null,
                                TargetSegment = ParseEnum<PlayerSegment>(reader["target_segment"].ToString()),
                                // Handle JSON arrays
                                ApplicableGameIds = reader["applicable_game_ids"] != DBNull.Value ?
                                    DeserializeJsonArray<string>(reader["applicable_game_ids"].ToString()) : null,
                                TargetSegments = reader["target_segments"] != DBNull.Value ?
                                    DeserializePlayerSegmentArray(reader["target_segments"].ToString()) : null
                            };

                            bonuses.Add(bonus);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {bonuses.Count} bonuses for player segment {segment}");
                }

                return bonuses;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving bonuses for player segment: {segment}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForGameAsync(string gameId)
        {
            try
            {
                var now = DateTime.UtcNow;
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting bonuses for game: {gameId} at {now}");
                }

                // Use raw SQL to avoid enum conversion issues
                var bonuses = new List<Bonus>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            name,
                            description,
                            type,
                            amount,
                            percentage_match,
                            minimum_deposit,
                            wagering_requirement,
                            start_date,
                            end_date,
                            is_active,
                            is_global,
                            game_id,
                            target_segment,
                            applicable_game_ids,
                            target_segments
                        FROM bonuses
                        WHERE game_id = @gameId
                          AND start_date <= @now
                          AND end_date >= @now";

                    // Add parameters
                    var gameIdParam = command.CreateParameter();
                    gameIdParam.ParameterName = "@gameId";
                    gameIdParam.Value = gameId;
                    command.Parameters.Add(gameIdParam);

                    var nowParam = command.CreateParameter();
                    nowParam.ParameterName = "@now";
                    nowParam.Value = now;
                    command.Parameters.Add(nowParam);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var bonus = new Bonus
                            {
                                Id = reader["id"].ToString(),
                                Name = reader["name"].ToString(),
                                Description = reader["description"] != DBNull.Value ? reader["description"].ToString() : null,
                                Type = ParseEnum<BonusType>(reader["type"].ToString()),
                                Amount = Convert.ToDecimal(reader["amount"]),
                                PercentageMatch = reader["percentage_match"] != DBNull.Value ? Convert.ToDecimal(reader["percentage_match"]) : null,
                                MinimumDeposit = reader["minimum_deposit"] != DBNull.Value ? Convert.ToDecimal(reader["minimum_deposit"]) : null,
                                WageringRequirement = reader["wagering_requirement"] != DBNull.Value ? Convert.ToInt32(reader["wagering_requirement"]) : null,
                                StartDate = Convert.ToDateTime(reader["start_date"]),
                                EndDate = Convert.ToDateTime(reader["end_date"]),
                                IsActive = Convert.ToBoolean(reader["is_active"]),
                                IsGlobal = Convert.ToBoolean(reader["is_global"]),
                                GameId = reader["game_id"] != DBNull.Value ? reader["game_id"].ToString() : null,
                                TargetSegment = ParseEnum<PlayerSegment>(reader["target_segment"].ToString()),
                                // Handle JSON arrays
                                ApplicableGameIds = reader["applicable_game_ids"] != DBNull.Value ?
                                    DeserializeJsonArray<string>(reader["applicable_game_ids"].ToString()) : null,
                                TargetSegments = reader["target_segments"] != DBNull.Value ?
                                    DeserializePlayerSegmentArray(reader["target_segments"].ToString()) : null
                            };

                            bonuses.Add(bonus);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {bonuses.Count} bonuses for game {gameId}");
                }

                return bonuses;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving bonuses for game: {gameId}");
                }
                throw;
            }
        }
    }
}