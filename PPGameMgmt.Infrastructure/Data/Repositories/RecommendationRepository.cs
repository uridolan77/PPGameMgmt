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
    public class RecommendationRepository : IRecommendationRepository
    {
        private readonly CasinoDbContext _context;

        public RecommendationRepository(CasinoDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        public async Task<Recommendation> GetByIdAsync(string id)
        {
            return await _context.Recommendations.FindAsync(id);
        }

        public async Task<IEnumerable<Recommendation>> GetAllAsync()
        {
            return await _context.Recommendations.ToListAsync();
        }

        public async Task<IEnumerable<Recommendation>> FindAsync(Expression<Func<Recommendation, bool>> predicate)
        {
            return await _context.Recommendations.Where(predicate).ToListAsync();
        }

        public async Task AddAsync(Recommendation entity)
        {
            await _context.Recommendations.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Recommendation entity)
        {
            _context.Recommendations.Update(entity);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(Recommendation entity)
        {
            _context.Recommendations.Remove(entity);
            await _context.SaveChangesAsync();
        }

        public async Task<Recommendation> GetLatestRecommendationForPlayerAsync(string playerId)
        {
            return await _context.Recommendations
                .Where(r => r.PlayerId == playerId)
                .OrderByDescending(r => r.CreatedAt)
                .FirstOrDefaultAsync();
        }

        public async Task<IEnumerable<Recommendation>> GetRecommendationHistoryForPlayerAsync(string playerId, int limit = 10)
        {
            return await _context.Recommendations
                .Where(r => r.PlayerId == playerId)
                .OrderByDescending(r => r.CreatedAt)
                .Take(limit)
                .ToListAsync();
        }

        public async Task<IEnumerable<Recommendation>> GetPendingRecommendationsAsync()
        {
            return await _context.Recommendations
                .Where(r => !r.IsViewed && !r.IsPlayed)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }

        public async Task<IEnumerable<Recommendation>> GetSuccessfulRecommendationsAsync(int days)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-days);
            return await _context.Recommendations
                .Where(r => r.IsPlayed && r.CreatedAt >= cutoffDate)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();
        }
    }
}