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
    public class GameRepository : IGameRepository
    {
        private readonly CasinoDbContext _context;

        public GameRepository(CasinoDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Game> GetByIdAsync(string id)
        {
            return await _context.Games.FindAsync(id);
        }

        public async Task<IEnumerable<Game>> GetAllAsync()
        {
            return await _context.Games.ToListAsync();
        }

        public async Task<IEnumerable<Game>> FindAsync(Expression<Func<Game, bool>> predicate)
        {
            return await _context.Games.Where(predicate).ToListAsync();
        }

        public async Task AddAsync(Game entity)
        {
            await _context.Games.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Game entity)
        {
            _context.Games.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Game entity)
        {
            _context.Games.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type)
        {
            return await _context.Games
                .Where(g => g.Type == type && g.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category)
        {
            return await _context.Games
                .Where(g => g.Category == category && g.IsActive)
                .ToListAsync();
        }

        public async Task<IEnumerable<Game>> GetPopularGamesAsync(int count)
        {
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

            return popularGames;
        }

        public async Task<IEnumerable<Game>> GetNewReleasesAsync(int count)
        {
            return await _context.Games
                .Where(g => g.IsActive)
                .OrderByDescending(g => g.ReleaseDate)
                .Take(count)
                .ToListAsync();
        }
    }
}