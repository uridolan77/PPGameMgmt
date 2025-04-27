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
    public class BonusRepository : IBonusRepository
    {
        private readonly CasinoDbContext _context;

        public BonusRepository(CasinoDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Bonus> GetByIdAsync(string id)
        {
            return await _context.Bonuses.FindAsync(id);
        }

        public async Task<IEnumerable<Bonus>> GetAllAsync()
        {
            return await _context.Bonuses.ToListAsync();
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
            var now = DateTime.UtcNow;
            return await _context.Bonuses
                .Where(b => b.IsGlobal && b.StartDate <= now && b.EndDate >= now)
                .ToListAsync();
        }

        public async Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(BonusType type)
        {
            return await _context.Bonuses
                .Where(b => b.Type == type)
                .ToListAsync();
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForPlayerSegmentAsync(PlayerSegment segment)
        {
            var now = DateTime.UtcNow;
            return await _context.Bonuses
                .Where(b => b.TargetSegment == segment && b.StartDate <= now && b.EndDate >= now)
                .ToListAsync();
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForGameAsync(string gameId)
        {
            var now = DateTime.UtcNow;
            return await _context.Bonuses
                .Where(b => b.GameId == gameId && b.StartDate <= now && b.EndDate >= now)
                .ToListAsync();
        }
    }
}