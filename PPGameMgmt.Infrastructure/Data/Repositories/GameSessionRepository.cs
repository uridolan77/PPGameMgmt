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
    public class GameSessionRepository : IGameSessionRepository
    {
        private readonly CasinoDbContext _context;
        private readonly ILogger<GameSessionRepository> _logger;
        private const string _entityName = "GameSession";

        public GameSessionRepository(CasinoDbContext context, ILogger<GameSessionRepository> logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public async Task<GameSession> GetByIdAsync(string id)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.GameSessions.FindAsync(id);
                },
                _entityName,
                $"Error retrieving game session with ID: {id}",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetAllAsync()
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.GameSessions.ToListAsync();
                },
                _entityName,
                "Error retrieving all game sessions",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> FindAsync(Expression<Func<GameSession, bool>> predicate)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.GameSessions.Where(predicate).ToListAsync();
                },
                _entityName,
                "Error finding game sessions with predicate",
                _logger
            );
        }

        public async Task AddAsync(GameSession entity)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    await _context.GameSessions.AddAsync(entity);
                    await _context.SaveChangesAsync();
                    return true;
                },
                _entityName,
                $"Error adding game session for player {entity.PlayerId}",
                _logger
            );
        }

        public async Task UpdateAsync(GameSession entity)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _context.GameSessions.Update(entity);
                    await _context.SaveChangesAsync();
                    return true;
                },
                _entityName,
                $"Error updating game session with ID: {entity.Id}",
                _logger
            );
        }

        public async Task DeleteAsync(GameSession entity)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _context.GameSessions.Remove(entity);
                    await _context.SaveChangesAsync();
                    return true;
                },
                _entityName,
                $"Error deleting game session with ID: {entity.Id}",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByPlayerAsync(string playerId, int limit = 100)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.GameSessions
                        .Where(gs => gs.PlayerId == playerId)
                        .OrderByDescending(gs => gs.StartTime)
                        .Take(limit)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving sessions for player with ID: {playerId}",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetRecentSessionsAsync(int hours, int limit = 1000)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var cutoffTime = DateTime.UtcNow.AddHours(-hours);
                    return await _context.GameSessions
                        .Where(gs => gs.StartTime >= cutoffTime)
                        .OrderByDescending(gs => gs.StartTime)
                        .Take(limit)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving recent sessions from last {hours} hours",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByGameAsync(string gameId, int limit = 100)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.GameSessions
                        .Where(gs => gs.GameId == gameId)
                        .OrderByDescending(gs => gs.StartTime)
                        .Take(limit)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving sessions for game with ID: {gameId}",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByDateRangeAsync(DateTime start, DateTime end)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.GameSessions
                        .Where(gs => gs.StartTime >= start && gs.StartTime <= end)
                        .OrderByDescending(gs => gs.StartTime)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving sessions between {start} and {end}",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByPlayerIdAsync(string playerId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.GameSessions
                        .Where(gs => gs.PlayerId == playerId)
                        .OrderByDescending(gs => gs.StartTime)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving all sessions for player with ID: {playerId}",
                _logger
            );
        }

        public async Task<IEnumerable<GameSession>> GetRecentSessionsByPlayerIdAsync(string playerId, int days)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var cutoffDate = DateTime.UtcNow.AddDays(-days);
                    return await _context.GameSessions
                        .Where(gs => gs.PlayerId == playerId && gs.StartTime >= cutoffDate)
                        .Include(gs => gs.Game)
                        .OrderByDescending(gs => gs.StartTime)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving recent sessions for player with ID: {playerId} in the last {days} days",
                _logger
            );
        }
    }
}