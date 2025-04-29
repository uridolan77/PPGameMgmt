using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class RecommendationRepository : Repository<Recommendation>, IRecommendationRepository
    {
        private readonly ILogger<RecommendationRepository> _logger;
        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions
        {
            PropertyNameCaseInsensitive = true,
            Converters = { new System.Text.Json.Serialization.JsonStringEnumConverter() }
        };

        public RecommendationRepository(CasinoDbContext context, ILogger<RecommendationRepository> logger = null)
            : base(context, logger)
        {
            _logger = logger;
        }

        public override async Task<Recommendation> GetByIdAsync(string id)
        {
            try
            {
                _logger?.LogInformation($"Getting recommendation with ID: {id}");

                // Use EF Core to get the recommendation by ID
                var recommendation = await _context.Recommendations.FindAsync(id);

                _logger?.LogInformation(recommendation != null
                    ? $"Retrieved recommendation with ID: {id}"
                    : $"No recommendation found with ID: {id}");

                return recommendation;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving recommendation with ID: {id}");
                throw;
            }
        }

        public override async Task<IEnumerable<Recommendation>> GetAllAsync()
        {
            try
            {
                _logger?.LogInformation("Getting all recommendations");

                // Use EF Core to get all recommendations
                var recommendations = await _context.Recommendations.ToListAsync();

                _logger?.LogInformation($"Retrieved {recommendations.Count} recommendations");

                return recommendations;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error retrieving all recommendations");
                throw;
            }
        }

        public override async Task<IEnumerable<Recommendation>> FindAsync(Expression<Func<Recommendation, bool>> predicate)
        {
            try
            {
                return await _context.Recommendations.Where(predicate).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error finding recommendations with predicate");
                throw;
            }
        }

        // Note: AddAsync, UpdateAsync, and DeleteAsync are inherited from the base Repository class
        // and don't need to be overridden unless custom behavior is needed

        public async Task<Recommendation> GetLatestRecommendationForPlayerAsync(string playerId)
        {
            try
            {
                _logger?.LogInformation($"Getting latest recommendation for player: {playerId}");

                // Use EF Core to get the latest recommendation for the player
                var recommendation = await _context.Recommendations
                    .Where(r => r.PlayerId == playerId)
                    .OrderByDescending(r => r.CreatedAt)
                    .FirstOrDefaultAsync();

                _logger?.LogInformation(recommendation != null
                    ? $"Retrieved latest recommendation for player: {playerId}"
                    : $"No recommendation found for player: {playerId}");

                return recommendation;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving latest recommendation for player: {playerId}");
                throw;
            }
        }

        public async Task<IEnumerable<Recommendation>> GetRecommendationHistoryForPlayerAsync(string playerId, int limit = 10)
        {
            try
            {
                _logger?.LogInformation($"Getting recommendation history for player: {playerId}, limit: {limit}");

                // Use EF Core to get recommendation history for the player
                var recommendations = await _context.Recommendations
                    .Where(r => r.PlayerId == playerId)
                    .OrderByDescending(r => r.CreatedAt)
                    .Take(limit)
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved {recommendations.Count} recommendation history items for player: {playerId}");

                return recommendations;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving recommendation history for player: {playerId}");
                throw;
            }
        }

        public async Task<IEnumerable<Recommendation>> GetPendingRecommendationsAsync()
        {
            try
            {
                _logger?.LogInformation("Getting pending recommendations");

                // Use EF Core to get pending recommendations
                var recommendations = await _context.Recommendations
                    .Where(r => !r.IsViewed && !r.IsPlayed)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved {recommendations.Count} pending recommendations");

                return recommendations;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error retrieving pending recommendations");
                throw;
            }
        }

        public async Task<IEnumerable<Recommendation>> GetSuccessfulRecommendationsAsync(int days)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-days);

                _logger?.LogInformation($"Getting successful recommendations since {cutoffDate}");

                // Use EF Core to get successful recommendations
                var recommendations = await _context.Recommendations
                    .Where(r => r.IsPlayed && r.CreatedAt >= cutoffDate)
                    .OrderByDescending(r => r.CreatedAt)
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved {recommendations.Count} successful recommendations");

                return recommendations;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving successful recommendations for the last {days} days");
                throw;
            }
        }
    }
}