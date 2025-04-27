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
    public class PlayerRepository : IPlayerRepository
    {
        private readonly CasinoDbContext _context;

        public PlayerRepository(CasinoDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Player> GetByIdAsync(string id)
        {
            return await _context.Players.FindAsync(id);
        }

        public async Task<IEnumerable<Player>> GetAllAsync()
        {
            return await _context.Players.ToListAsync();
        }

        public async Task<IEnumerable<Player>> FindAsync(Expression<Func<Player, bool>> predicate)
        {
            return await _context.Players.Where(predicate).ToListAsync();
        }

        public async Task AddAsync(Player entity)
        {
            await _context.Players.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Player entity)
        {
            _context.Players.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Player entity)
        {
            _context.Players.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<Player> GetPlayerWithSessionsAndBonusesAsync(string playerId)
        {
            return await _context.Players
                .Include(p => p.GameSessions)
                    .ThenInclude(gs => gs.Game)
                .Include(p => p.BonusClaims)
                    .ThenInclude(bc => bc.Bonus)
                .FirstOrDefaultAsync(p => p.Id == playerId);
        }

        public async Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment)
        {
            return await _context.Players
                .Where(p => p.Segment == segment)
                .ToListAsync();
        }

        public async Task<IEnumerable<Player>> GetActivePlayers(int daysActive)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-daysActive);
            
            return await _context.Players
                .Where(p => p.LastLoginDate >= cutoffDate)
                .ToListAsync();
        }

        public async Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment)
        {
            var player = await GetByIdAsync(playerId);
            
            if (player != null)
            {
                player.Segment = segment;
                await UpdateAsync(player);
            }
        }
    }
}