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
    public class BonusRepository : Repository<Bonus>, IBonusRepository
    {
        private readonly ILogger<BonusRepository> _logger;
        private const string _entityName = "Bonus";

        public BonusRepository(CasinoDbContext context, ILogger<BonusRepository> logger = null)
            : base(context, logger)
        {
            _logger = logger;
        }

        public override async Task<Bonus> GetByIdAsync(string id)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting bonus with ID: {id}");

                    // Use EF Core to get the bonus by ID
                    var bonus = await _context.Bonuses.FindAsync(id);

                    _logger?.LogInformation(bonus != null
                        ? $"Retrieved bonus with ID: {id}"
                        : $"No bonus found with ID: {id}");

                    return bonus;
                },
                _entityName,
                $"Error retrieving bonus with ID: {id}",
                _logger
            );
        }

        public override async Task<IEnumerable<Bonus>> GetAllAsync()
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting all bonuses");

                    // Use EF Core to get all bonuses
                    var bonuses = await _context.Bonuses.ToListAsync();

                    _logger?.LogInformation($"Retrieved {bonuses.Count} bonuses");

                    return bonuses;
                },
                _entityName,
                "Error retrieving all bonuses",
                _logger
            );
        }

        public override async Task<IEnumerable<Bonus>> FindAsync(Expression<Func<Bonus, bool>> predicate)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.Bonuses.Where(predicate).ToListAsync();
                },
                _entityName,
                "Error finding bonuses with predicate",
                _logger
            );
        }

        // Note: AddAsync, UpdateAsync, and DeleteAsync are inherited from the base Repository class
        // and don't need to be overridden unless custom behavior is needed

        public async Task<IEnumerable<Bonus>> GetActiveGlobalBonusesAsync()
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var now = DateTime.UtcNow;
                    _logger?.LogInformation($"Getting active global bonuses at {now}");

                    // Use EF Core to get active global bonuses
                    var bonuses = await _context.Bonuses
                        .Where(b => b.IsGlobal && b.StartDate <= now && b.EndDate >= now)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {bonuses.Count} active global bonuses");

                    return bonuses;
                },
                _entityName,
                "Error retrieving active global bonuses",
                _logger
            );
        }

        public async Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(BonusType type)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting bonuses by type: {type}");

                    // Use EF Core to get bonuses by type
                    var bonuses = await _context.Bonuses
                        .Where(b => b.Type == type)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {bonuses.Count} bonuses of type {type}");

                    return bonuses;
                },
                _entityName,
                $"Error retrieving bonuses by type: {type}",
                _logger
            );
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForPlayerSegmentAsync(PlayerSegment segment)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var now = DateTime.UtcNow;
                    _logger?.LogInformation($"Getting bonuses for player segment: {segment} at {now}");

                    // Use EF Core to get bonuses for player segment
                    var bonuses = await _context.Bonuses
                        .Where(b => b.TargetSegment == segment && b.StartDate <= now && b.EndDate >= now)
                        .ToListAsync();

                    // Also check for bonuses that target multiple segments via the TargetSegments array
                    var bonusesWithTargetSegments = await _context.Bonuses
                        .Where(b => b.StartDate <= now && b.EndDate >= now && b.TargetSegments != null)
                        .ToListAsync();

                    // Filter bonuses that include the segment in their TargetSegments array
                    var additionalBonuses = bonusesWithTargetSegments
                        .Where(b => b.TargetSegments != null && b.TargetSegments.Contains(segment))
                        .ToList();

                    // Combine the results, avoiding duplicates
                    var result = bonuses.Union(additionalBonuses).ToList();

                    _logger?.LogInformation($"Retrieved {result.Count} bonuses for player segment {segment}");

                    return result;
                },
                _entityName,
                $"Error retrieving bonuses for player segment: {segment}",
                _logger
            );
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForGameAsync(string gameId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var now = DateTime.UtcNow;
                    _logger?.LogInformation($"Getting bonuses for game: {gameId} at {now}");

                    // Use EF Core to get bonuses for game
                    var bonuses = await _context.Bonuses
                        .Where(b => b.GameId == gameId && b.StartDate <= now && b.EndDate >= now)
                        .ToListAsync();

                    // Also check for bonuses that include this game in their ApplicableGameIds array
                    var bonusesWithApplicableGames = await _context.Bonuses
                        .Where(b => b.StartDate <= now && b.EndDate >= now && b.ApplicableGameIds != null)
                        .ToListAsync();

                    // Filter bonuses that include the game in their ApplicableGameIds array
                    var additionalBonuses = bonusesWithApplicableGames
                        .Where(b => b.ApplicableGameIds != null && b.ApplicableGameIds.Contains(gameId))
                        .ToList();

                    // Combine the results, avoiding duplicates
                    var result = bonuses.Union(additionalBonuses).ToList();

                    _logger?.LogInformation($"Retrieved {result.Count} bonuses for game {gameId}");

                    return result;
                },
                _entityName,
                $"Error retrieving bonuses for game: {gameId}",
                _logger
            );
        }
    }
}