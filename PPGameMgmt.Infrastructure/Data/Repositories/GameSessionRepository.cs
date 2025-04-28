using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class GameSessionRepository : IGameSessionRepository
    {
        private readonly CasinoDbContext _context;

        public GameSessionRepository(CasinoDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<GameSession> GetByIdAsync(string id)
        {
            return await _context.GameSessions.FindAsync(id);
        }

        public async Task<IEnumerable<GameSession>> GetAllAsync()
        {
            return await _context.GameSessions.ToListAsync();
        }

        public async Task<IEnumerable<GameSession>> FindAsync(Expression<Func<GameSession, bool>> predicate)
        {
            return await _context.GameSessions.Where(predicate).ToListAsync();
        }

        public async Task AddAsync(GameSession entity)
        {
            await _context.GameSessions.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(GameSession entity)
        {
            _context.GameSessions.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(GameSession entity)
        {
            _context.GameSessions.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByPlayerAsync(string playerId, int limit = 100)
        {
            return await _context.GameSessions
                .Where(gs => gs.PlayerId == playerId)
                .OrderByDescending(gs => gs.StartTime)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<GameSession>> GetRecentSessionsAsync(int hours, int limit = 1000)
        {
            var cutoffTime = DateTime.UtcNow.AddHours(-hours);
            return await _context.GameSessions
                .Where(gs => gs.StartTime >= cutoffTime)
                .OrderByDescending(gs => gs.StartTime)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByGameAsync(string gameId, int limit = 100)
        {
            return await _context.GameSessions
                .Where(gs => gs.GameId == gameId)
                .OrderByDescending(gs => gs.StartTime)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByDateRangeAsync(DateTime start, DateTime end)
        {
            return await _context.GameSessions
                .Where(gs => gs.StartTime >= start && gs.StartTime <= end)
                .OrderByDescending(gs => gs.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<GameSession>> GetSessionsByPlayerIdAsync(string playerId)
        {
            return await _context.GameSessions
                .Where(gs => gs.PlayerId == playerId)
                .OrderByDescending(gs => gs.StartTime)
                .ToListAsync();
        }

        public async Task<IEnumerable<GameSession>> GetRecentSessionsByPlayerIdAsync(string playerId, int days)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-days);
            return await _context.GameSessions
                .Where(gs => gs.PlayerId == playerId && gs.StartTime >= cutoffDate)
                .Include(gs => gs.Game)
                .OrderByDescending(gs => gs.StartTime)
                .ToListAsync();
        }
    }
}