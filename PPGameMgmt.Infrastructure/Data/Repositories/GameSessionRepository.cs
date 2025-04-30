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
    /// Repository implementation for GameSession entity
    /// </summary>
    public class GameSessionRepository : Repository<GameSession>, IGameSessionRepository
    {
        private readonly ILogger<GameSessionRepository>? _logger;
        private const string _entityName = "GameSession";

        public GameSessionRepository(CasinoDbContext context, ILogger<GameSessionRepository>? logger = null)
            : base(context, logger)
        {
            _logger = logger;
        }

        public override async Task<GameSession> GetByIdAsync(Guid id)
        {
            return await GetByIdAsync(id.ToString());
        }

        public override async Task<IReadOnlyList<GameSession>> ListAllAsync()
        {
            var sessions = await _context.Set<GameSession>()
                .Include(gs => gs.Game)
                .Include(gs => gs.Player)
                .ToListAsync();

            return sessions.AsReadOnly();
        }

        public override async Task<IReadOnlyList<GameSession>> ListAsync(Expression<Func<GameSession, bool>> predicate)
        {
            var sessions = await _context.Set<GameSession>()
                .Include(gs => gs.Game)
                .Include(gs => gs.Player)
                .Where(predicate)
                .ToListAsync();

            return sessions.AsReadOnly();
        }

        public override async Task<GameSession> AddAsync(GameSession entity)
        {
            await _context.Set<GameSession>().AddAsync(entity);
            await _context.SaveChangesAsync();
            return entity;
        }

        public override async Task UpdateAsync(GameSession entity)
        {
            _context.Set<GameSession>().Update(entity);
            await _context.SaveChangesAsync();
        }

        public override async Task<int> CountAsync(Expression<Func<GameSession, bool>> predicate)
        {
            return await _context.Set<GameSession>().CountAsync(predicate);
        }

        public override async Task<GameSession> GetByIdAsync(string id)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting game session with ID: {Id}", id);

                    // Use EF Core to get the game session by ID
                    var session = await _context.Set<GameSession>()
                        .Include(gs => gs.Player)
                        .Include(gs => gs.Game)
                        .FirstOrDefaultAsync(gs => gs.Id == id);

                    if (session == null)
                    {
                        _logger?.LogInformation("No game session found with ID: {Id}", id);
                        return null;
                    }

                    _logger?.LogInformation("Retrieved game session with ID: {Id}", id);
                    return session;
                },
                _entityName,
                $"Error retrieving game session with ID: {id}",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByPlayerIdAsync(string playerId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting game sessions for player ID: {PlayerId}", playerId);

                    var sessions = await _context.Set<GameSession>()
                        .Include(gs => gs.Game)
                        .Where(gs => gs.PlayerId == playerId)
                        .OrderByDescending(gs => gs.StartTime)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} game sessions for player ID: {PlayerId}",
                        sessions.Count, playerId);

                    return sessions;
                },
                _entityName,
                $"Error retrieving game sessions for player ID: {playerId}",
                _logger
            );
        }

        public async Task<PagedResult<GameSession>> GetSessionsByPlayerIdPagedAsync(string playerId, PaginationParameters parameters)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting paged game sessions for player ID: {PlayerId}, Page: {PageNumber}, Size: {PageSize}",
                        playerId, parameters.PageNumber, parameters.PageSize);

                    // Create query for sessions for the player
                    var query = _context.Set<GameSession>()
                        .Include(gs => gs.Game)
                        .Where(gs => gs.PlayerId == playerId)
                        .OrderByDescending(gs => gs.StartTime);

                    // Get total count
                    var totalCount = await query.CountAsync();

                    // Apply pagination
                    var sessions = await query
                        .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                        .Take(parameters.PageSize)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} game sessions on page {PageNumber} out of {TotalCount} total sessions for player ID: {PlayerId}",
                        sessions.Count, parameters.PageNumber, totalCount, playerId);

                    return new PagedResult<GameSession>(sessions, totalCount, parameters.PageNumber, parameters.PageSize);
                },
                _entityName,
                $"Error retrieving paged game sessions for player ID: {playerId}",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByGameIdAsync(string gameId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting game sessions for game ID: {GameId}", gameId);

                    var sessions = await _context.Set<GameSession>()
                        .Include(gs => gs.Player)
                        .Where(gs => gs.GameId == gameId)
                        .OrderByDescending(gs => gs.StartTime)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} game sessions for game ID: {GameId}",
                        sessions.Count, gameId);

                    return sessions;
                },
                _entityName,
                $"Error retrieving game sessions for game ID: {gameId}",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetActiveSessionsAsync()
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting active game sessions");

                    var sessions = await _context.Set<GameSession>()
                        .Include(gs => gs.Player)
                        .Include(gs => gs.Game)
                        .Where(gs => gs.EndTime == null)
                        .OrderByDescending(gs => gs.StartTime)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} active game sessions", sessions.Count);

                    return sessions;
                },
                _entityName,
                "Error retrieving active game sessions",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetRecentSessionsByPlayerIdAsync(string playerId, int daysToLookBack = 30)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting recent game sessions for player ID: {PlayerId} within the last {Days} days",
                        playerId, daysToLookBack);

                    var cutoffDate = DateTime.UtcNow.AddDays(-daysToLookBack);

                    var sessions = await _context.Set<GameSession>()
                        .Include(gs => gs.Game)
                        .Where(gs => gs.PlayerId == playerId && gs.StartTime >= cutoffDate)
                        .OrderByDescending(gs => gs.StartTime)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} recent game sessions for player ID: {PlayerId}",
                        sessions.Count, playerId);

                    return sessions;
                },
                _entityName,
                $"Error retrieving recent game sessions for player ID: {playerId}",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByPlayerIdAndDateRangeAsync(string playerId, DateTime startDate, DateTime endDate)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting game sessions for player ID: {PlayerId} between {StartDate} and {EndDate}",
                        playerId, startDate, endDate);

                    var sessions = await _context.Set<GameSession>()
                        .Include(gs => gs.Game)
                        .Where(gs => gs.PlayerId == playerId &&
                                    gs.StartTime >= startDate &&
                                    gs.StartTime <= endDate)
                        .OrderByDescending(gs => gs.StartTime)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} game sessions for player ID: {PlayerId} in date range",
                        sessions.Count, playerId);

                    return sessions;
                },
                _entityName,
                $"Error retrieving game sessions for player ID: {playerId} in date range",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByDeviceTypeAsync(string deviceType)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting game sessions for device type: {DeviceType}", deviceType);

                    var sessions = await _context.Set<GameSession>()
                        .Include(gs => gs.Player)
                        .Include(gs => gs.Game)
                        .Where(gs => gs.DeviceType == deviceType)
                        .OrderByDescending(gs => gs.StartTime)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} game sessions for device type: {DeviceType}",
                        sessions.Count, deviceType);

                    return sessions;
                },
                _entityName,
                $"Error retrieving game sessions for device type: {deviceType}",
                _logger
            );
        }

        public async Task UpdateSessionEndAsync(string sessionId, DateTime endTime, int durationMinutes)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Updating end time for game session ID: {SessionId}", sessionId);

                    var session = await _context.Set<GameSession>().FindAsync(sessionId);

                    if (session == null)
                    {
                        throw new EntityNotFoundException(_entityName, sessionId);
                    }

                    session.EndTime = endTime;
                    session.DurationMinutes = durationMinutes;

                    _context.Set<GameSession>().Update(session);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation("Updated end time for game session ID: {SessionId}", sessionId);

                    return true;
                },
                _entityName,
                $"Error updating end time for game session ID: {sessionId}",
                _logger
            );
        }

        public async Task UpdateBetsAndWinsAsync(string sessionId, decimal totalBets, decimal totalWins)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Updating bets and wins for game session ID: {SessionId}", sessionId);

                    var session = await _context.Set<GameSession>().FindAsync(sessionId);

                    if (session == null)
                    {
                        throw new EntityNotFoundException(_entityName, sessionId);
                    }

                    session.TotalBets = totalBets;
                    session.TotalWins = totalWins;

                    _context.Set<GameSession>().Update(session);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation("Updated bets and wins for game session ID: {SessionId}", sessionId);

                    return true;
                },
                _entityName,
                $"Error updating bets and wins for game session ID: {sessionId}",
                _logger
            );
        }

        public async Task<bool> SessionExistsAsync(string sessionId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Checking if game session with ID: {SessionId} exists", sessionId);

                    var exists = await _context.Set<GameSession>()
                        .AnyAsync(gs => gs.Id == sessionId);

                    _logger?.LogInformation("Game session with ID: {SessionId} exists: {Exists}", sessionId, exists);

                    return exists;
                },
                _entityName,
                $"Error checking if game session with ID: {sessionId} exists",
                _logger
            );
        }
    }
}
