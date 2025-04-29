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
    public class BonusClaimRepository : IBonusClaimRepository
    {
        private readonly CasinoDbContext _context;

        public BonusClaimRepository(CasinoDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<BonusClaim> GetByIdAsync(string id)
        {
            return await _context.BonusClaims.FindAsync(id);
        }

        public async Task<IEnumerable<BonusClaim>> GetAllAsync()
        {
            return await _context.BonusClaims.ToListAsync();
        }

        public async Task<IEnumerable<BonusClaim>> FindAsync(Expression<Func<BonusClaim, bool>> predicate)
        {
            return await _context.BonusClaims.Where(predicate).ToListAsync();
        }

        public async Task AddAsync(BonusClaim entity)
        {
            await _context.BonusClaims.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(BonusClaim entity)
        {
            _context.BonusClaims.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(BonusClaim entity)
        {
            _context.BonusClaims.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<IEnumerable<BonusClaim>> GetClaimsByPlayerAsync(string playerId)
        {
            return await _context.BonusClaims
                .Where(bc => bc.PlayerId == playerId)
                .OrderByDescending(bc => bc.ClaimedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<BonusClaim>> GetActiveClaimsByPlayerAsync(string playerId)
        {
            var now = DateTime.UtcNow;
            return await _context.BonusClaims
                .Where(bc => bc.PlayerId == playerId && bc.ExpiryDate >= now)
                .OrderByDescending(bc => bc.ClaimedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<BonusClaim>> GetClaimsByBonusAsync(string bonusId)
        {
            return await _context.BonusClaims
                .Where(bc => bc.BonusId == bonusId)
                .OrderByDescending(bc => bc.ClaimedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<BonusClaim>> GetRecentClaimsAsync(int days)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-days);
            return await _context.BonusClaims
                .Where(bc => bc.ClaimedDate >= cutoffDate)
                .OrderByDescending(bc => bc.ClaimedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<BonusClaim>> GetByPlayerIdAsync(string playerId)
        {
            return await _context.BonusClaims
                .Where(bc => bc.PlayerId == playerId)
                .OrderByDescending(bc => bc.ClaimedDate)
                .ToListAsync();
        }

        public async Task<IEnumerable<BonusClaim>> GetRecentClaimsByPlayerIdAsync(string playerId, int days)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-days);
            return await _context.BonusClaims
                .Where(bc => bc.PlayerId == playerId && bc.ClaimedDate >= cutoffDate)
                .OrderByDescending(bc => bc.ClaimedDate)
                .ToListAsync();
        }
    }
}