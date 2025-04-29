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
    public class PlayerRepository : IPlayerRepository
    {
        private readonly CasinoDbContext _context;
        private static ILogger<PlayerRepository> _logger;

        public PlayerRepository(CasinoDbContext context, ILogger<PlayerRepository> logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public async Task<Player> GetByIdAsync(string id)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting player with ID: {id}");
                }

                // Use raw SQL to avoid enum conversion issues
                Player player = null;

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            username,
                            email,
                            country,
                            language,
                            registration_date,
                            last_login_date,
                            total_deposits,
                            total_withdrawals,
                            average_deposit_amount,
                            login_count,
                            segment,
                            age,
                            gender
                        FROM players
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
                            player = new Player
                            {
                                Id = reader["id"].ToString(),
                                Username = reader["username"].ToString(),
                                Email = reader["email"].ToString(),
                                Country = reader["country"] != DBNull.Value ? reader["country"].ToString() : null,
                                Language = reader["language"] != DBNull.Value ? reader["language"].ToString() : null,
                                RegistrationDate = Convert.ToDateTime(reader["registration_date"]),
                                LastLoginDate = Convert.ToDateTime(reader["last_login_date"]),
                                TotalDeposits = Convert.ToDecimal(reader["total_deposits"]),
                                TotalWithdrawals = Convert.ToDecimal(reader["total_withdrawals"]),
                                AverageDepositAmount = Convert.ToDecimal(reader["average_deposit_amount"]),
                                LoginCount = Convert.ToInt32(reader["login_count"]),
                                Segment = ParseEnum<PlayerSegment>(reader["segment"].ToString()),
                                Age = reader["age"] != DBNull.Value ? Convert.ToInt32(reader["age"]) : 0,
                                Gender = reader["gender"] != DBNull.Value ? reader["gender"].ToString() : null
                            };
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation(player != null
                        ? $"Retrieved player with ID: {id}"
                        : $"No player found with ID: {id}");
                }

                return player;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving player with ID: {id}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Player>> GetAllAsync()
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation("Getting all players");
                }

                // Use raw SQL to avoid enum conversion issues
                var players = new List<Player>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            username,
                            email,
                            country,
                            language,
                            registration_date,
                            last_login_date,
                            total_deposits,
                            total_withdrawals,
                            average_deposit_amount,
                            login_count,
                            segment,
                            age,
                            gender
                        FROM players";

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var player = new Player
                            {
                                Id = reader["id"].ToString(),
                                Username = reader["username"].ToString(),
                                Email = reader["email"].ToString(),
                                Country = reader["country"] != DBNull.Value ? reader["country"].ToString() : null,
                                Language = reader["language"] != DBNull.Value ? reader["language"].ToString() : null,
                                RegistrationDate = Convert.ToDateTime(reader["registration_date"]),
                                LastLoginDate = Convert.ToDateTime(reader["last_login_date"]),
                                TotalDeposits = Convert.ToDecimal(reader["total_deposits"]),
                                TotalWithdrawals = Convert.ToDecimal(reader["total_withdrawals"]),
                                AverageDepositAmount = Convert.ToDecimal(reader["average_deposit_amount"]),
                                LoginCount = Convert.ToInt32(reader["login_count"]),
                                Segment = ParseEnum<PlayerSegment>(reader["segment"].ToString()),
                                Age = reader["age"] != DBNull.Value ? Convert.ToInt32(reader["age"]) : 0,
                                Gender = reader["gender"] != DBNull.Value ? reader["gender"].ToString() : null
                            };

                            players.Add(player);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {players.Count} players");
                }

                return players;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, "Error retrieving all players");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Player>> FindAsync(Expression<Func<Player, bool>> predicate)
        {
            // This method is more complex to implement with raw SQL
            // For now, we'll use EF Core and handle any exceptions
            try
            {
                return await _context.Players.Where(predicate).ToListAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, "Error finding players with predicate");
                }
                throw;
            }
        }

        public async Task AddAsync(Player entity)
        {
            try
            {
                await _context.Players.AddAsync(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error adding player: {entity.Username}");
                }
                throw;
            }
        }

        public async Task UpdateAsync(Player entity)
        {
            try
            {
                _context.Players.Update(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error updating player: {entity.Id}");
                }
                throw;
            }
        }

        public async Task DeleteAsync(Player entity)
        {
            try
            {
                _context.Players.Remove(entity);
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error deleting player: {entity.Id}");
                }
                throw;
            }
        }

        public async Task<Player> GetPlayerWithSessionsAndBonusesAsync(string playerId)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting player with sessions and bonuses for ID: {playerId}");
                }

                // First get the player
                var player = await GetByIdAsync(playerId);

                if (player == null)
                {
                    return null;
                }

                // Then get the game sessions
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            player_id,
                            game_id,
                            start_time,
                            end_time,
                            total_bets,
                            total_wins,
                            device_type,
                            browser_info,
                            deposit_amount,
                            withdrawal_amount
                        FROM game_sessions
                        WHERE player_id = @playerId";

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
                        var gameSessions = new List<GameSession>();

                        while (await reader.ReadAsync())
                        {
                            var gameSession = new GameSession
                            {
                                Id = reader["id"].ToString(),
                                PlayerId = reader["player_id"].ToString(),
                                GameId = reader["game_id"].ToString(),
                                StartTime = Convert.ToDateTime(reader["start_time"]),
                                EndTime = reader["end_time"] != DBNull.Value ? Convert.ToDateTime(reader["end_time"]) : null,
                                TotalBets = Convert.ToDecimal(reader["total_bets"]),
                                TotalWins = Convert.ToDecimal(reader["total_wins"]),
                                DeviceType = reader["device_type"] != DBNull.Value ? reader["device_type"].ToString() : null,
                                BrowserInfo = reader["browser_info"] != DBNull.Value ? reader["browser_info"].ToString() : null,
                                // IpAddress property doesn't exist in GameSession
                                DepositAmount = reader["deposit_amount"] != DBNull.Value ? Convert.ToDecimal(reader["deposit_amount"]) : 0,
                                WithdrawalAmount = reader["withdrawal_amount"] != DBNull.Value ? Convert.ToDecimal(reader["withdrawal_amount"]) : 0
                            };

                            gameSessions.Add(gameSession);
                        }

                        player.GameSessions = gameSessions;
                    }
                }

                // Then get the bonus claims
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            player_id,
                            bonus_id,
                            claim_date,
                            bonus_value,
                            deposit_amount,
                            status,
                            wagering_requirement,
                            wagering_progress,
                            expiry_date,
                            conversion_date,
                            conversion_trigger
                        FROM bonus_claims
                        WHERE player_id = @playerId";

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
                        var bonusClaims = new List<BonusClaim>();

                        while (await reader.ReadAsync())
                        {
                            var bonusClaim = new BonusClaim
                            {
                                Id = reader["id"].ToString(),
                                PlayerId = reader["player_id"].ToString(),
                                BonusId = reader["bonus_id"].ToString(),
                                ClaimDate = Convert.ToDateTime(reader["claim_date"]),
                                ClaimedDate = reader["claim_date"] != DBNull.Value ? Convert.ToDateTime(reader["claim_date"]) : DateTime.UtcNow,
                                BonusValue = Convert.ToDecimal(reader["bonus_value"]),
                                DepositAmount = reader["deposit_amount"] != DBNull.Value ? Convert.ToDecimal(reader["deposit_amount"]) : null,
                                Status = ParseEnum<BonusClaimStatus>(reader["status"].ToString()),
                                // WageringRequirement property doesn't exist in BonusClaim
                                WageringProgress = reader["wagering_progress"] != DBNull.Value ? Convert.ToDecimal(reader["wagering_progress"]) : null,
                                ExpiryDate = reader["expiry_date"] != DBNull.Value ? Convert.ToDateTime(reader["expiry_date"]) : null,
                                // ConversionDate property doesn't exist in BonusClaim
                                CompletionDate = reader["conversion_date"] != DBNull.Value ? Convert.ToDateTime(reader["conversion_date"]) : null,
                                ConversionTrigger = reader["conversion_trigger"] != DBNull.Value ? reader["conversion_trigger"].ToString() : null,
                                BonusType = reader["bonus_id"].ToString() // Using bonus_id as a placeholder for bonus_type
                            };

                            bonusClaims.Add(bonusClaim);
                        }

                        player.BonusClaims = bonusClaims;
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved player with {player.GameSessions.Count} sessions and {player.BonusClaims.Count} bonus claims");
                }

                return player;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving player with sessions and bonuses for ID: {playerId}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Getting players by segment: {segment}");
                }

                // Use raw SQL to avoid enum conversion issues
                var players = new List<Player>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            username,
                            email,
                            country,
                            language,
                            registration_date,
                            last_login_date,
                            total_deposits,
                            total_withdrawals,
                            average_deposit_amount,
                            login_count,
                            segment,
                            age,
                            gender
                        FROM players
                        WHERE segment = @segment";

                    // Add parameter
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = "@segment";
                    parameter.Value = segment.ToString();
                    command.Parameters.Add(parameter);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var player = new Player
                            {
                                Id = reader["id"].ToString(),
                                Username = reader["username"].ToString(),
                                Email = reader["email"].ToString(),
                                Country = reader["country"] != DBNull.Value ? reader["country"].ToString() : null,
                                Language = reader["language"] != DBNull.Value ? reader["language"].ToString() : null,
                                RegistrationDate = Convert.ToDateTime(reader["registration_date"]),
                                LastLoginDate = Convert.ToDateTime(reader["last_login_date"]),
                                TotalDeposits = Convert.ToDecimal(reader["total_deposits"]),
                                TotalWithdrawals = Convert.ToDecimal(reader["total_withdrawals"]),
                                AverageDepositAmount = Convert.ToDecimal(reader["average_deposit_amount"]),
                                LoginCount = Convert.ToInt32(reader["login_count"]),
                                Segment = ParseEnum<PlayerSegment>(reader["segment"].ToString()),
                                Age = reader["age"] != DBNull.Value ? Convert.ToInt32(reader["age"]) : 0,
                                Gender = reader["gender"] != DBNull.Value ? reader["gender"].ToString() : null
                            };

                            players.Add(player);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {players.Count} players with segment {segment}");
                }

                return players;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving players by segment: {segment}");
                }
                throw;
            }
        }

        public async Task<IEnumerable<Player>> GetActivePlayers(int daysActive)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-daysActive);

                if (_logger != null)
                {
                    _logger.LogInformation($"Getting active players since {cutoffDate}");
                }

                // Use raw SQL to avoid enum conversion issues
                var players = new List<Player>();

                // Get raw data from database
                using (var command = _context.Database.GetDbConnection().CreateCommand())
                {
                    command.CommandText = @"
                        SELECT
                            id,
                            username,
                            email,
                            country,
                            language,
                            registration_date,
                            last_login_date,
                            total_deposits,
                            total_withdrawals,
                            average_deposit_amount,
                            login_count,
                            segment,
                            age,
                            gender
                        FROM players
                        WHERE last_login_date >= @cutoffDate";

                    // Add parameter
                    var parameter = command.CreateParameter();
                    parameter.ParameterName = "@cutoffDate";
                    parameter.Value = cutoffDate;
                    command.Parameters.Add(parameter);

                    if (command.Connection.State != System.Data.ConnectionState.Open)
                    {
                        await command.Connection.OpenAsync();
                    }

                    using (var reader = await command.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            var player = new Player
                            {
                                Id = reader["id"].ToString(),
                                Username = reader["username"].ToString(),
                                Email = reader["email"].ToString(),
                                Country = reader["country"] != DBNull.Value ? reader["country"].ToString() : null,
                                Language = reader["language"] != DBNull.Value ? reader["language"].ToString() : null,
                                RegistrationDate = Convert.ToDateTime(reader["registration_date"]),
                                LastLoginDate = Convert.ToDateTime(reader["last_login_date"]),
                                TotalDeposits = Convert.ToDecimal(reader["total_deposits"]),
                                TotalWithdrawals = Convert.ToDecimal(reader["total_withdrawals"]),
                                AverageDepositAmount = Convert.ToDecimal(reader["average_deposit_amount"]),
                                LoginCount = Convert.ToInt32(reader["login_count"]),
                                Segment = ParseEnum<PlayerSegment>(reader["segment"].ToString()),
                                Age = reader["age"] != DBNull.Value ? Convert.ToInt32(reader["age"]) : 0,
                                Gender = reader["gender"] != DBNull.Value ? reader["gender"].ToString() : null
                            };

                            players.Add(player);
                        }
                    }
                }

                if (_logger != null)
                {
                    _logger.LogInformation($"Retrieved {players.Count} active players");
                }

                return players;
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error retrieving active players for the last {daysActive} days");
                }
                throw;
            }
        }

        public async Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment)
        {
            try
            {
                if (_logger != null)
                {
                    _logger.LogInformation($"Updating player {playerId} segment to {segment}");
                }

                var player = await GetByIdAsync(playerId);

                if (player != null)
                {
                    player.Segment = segment;
                    await UpdateAsync(player);

                    if (_logger != null)
                    {
                        _logger.LogInformation($"Successfully updated player {playerId} segment to {segment}");
                    }
                }
                else
                {
                    if (_logger != null)
                    {
                        _logger.LogWarning($"Player {playerId} not found for segment update");
                    }
                }
            }
            catch (Exception ex)
            {
                if (_logger != null)
                {
                    _logger.LogError(ex, $"Error updating player {playerId} segment to {segment}");
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
    }
}