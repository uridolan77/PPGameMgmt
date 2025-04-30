using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Core.Specifications.GameSessionSpecs;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    /// <summary>
    /// Repository implementation for GameSession entity
    /// </summary>
    public class GameSessionRepository : Repository<GameSession>, IGameSessionRepository
    {
        public GameSessionRepository(CasinoDbContext context, ILogger<GameSessionRepository>? logger = null)
            : base(context, logger)
        {
        }

        // No need to override GetByIdAsync or other basic operations - the base implementation 
        // with integrated error handling will handle these

        public async Task<IEnumerable<GameSession>> GetSessionsByPlayerIdAsync(string playerId)
        {
            var specification = new GameSessionsByPlayerIdSpecification(playerId);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<PagedResult<GameSession>> GetSessionsByPlayerIdPagedAsync(string playerId, PaginationParameters parameters)
        {
            var specification = new GameSessionsByPlayerIdPagedSpecification(playerId);
            return await FindPagedWithSpecificationAsync(specification, parameters);
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByGameIdAsync(string gameId)
        {
            var specification = new GameSessionsByGameIdSpecification(gameId);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<GameSession>> GetActiveSessionsAsync()
        {
            var specification = new ActiveGameSessionsSpecification();
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<GameSession>> GetRecentSessionsByPlayerIdAsync(string playerId, int daysToLookBack = 30)
        {
            var specification = new RecentGameSessionsByPlayerIdSpecification(playerId, daysToLookBack);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByPlayerIdAndDateRangeAsync(string playerId, DateTime startDate, DateTime endDate)
        {
            var specification = new GameSessionsByPlayerIdAndDateRangeSpecification(playerId, startDate, endDate);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByDeviceTypeAsync(string deviceType)
        {
            var specification = new GameSessionsByDeviceTypeSpecification(deviceType);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task UpdateSessionEndAsync(string sessionId, DateTime endTime, int durationMinutes)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    var session = await _dbSet.FindAsync(sessionId);
                    if (session == null)
                    {
                        throw new EntityNotFoundException(_entityName, sessionId);
                    }

                    session.EndTime = endTime;
                    session.DurationMinutes = durationMinutes;
                    
                    _context.Entry(session).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    return true;
                },
                $"Error updating end time for game session ID: {sessionId}"
            );
        }

        public async Task UpdateBetsAndWinsAsync(string sessionId, decimal totalBets, decimal totalWins)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    var session = await _dbSet.FindAsync(sessionId);
                    if (session == null)
                    {
                        throw new EntityNotFoundException(_entityName, sessionId);
                    }

                    session.TotalBets = totalBets;
                    session.TotalWins = totalWins;
                    
                    _context.Entry(session).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    return true;
                },
                $"Error updating bets and wins for game session ID: {sessionId}"
            );
        }

        public async Task<bool> SessionExistsAsync(string sessionId)
        {
            return await ExistsAsync(sessionId);
        }
    }
}
