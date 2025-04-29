using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities.Bonuses;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces.Repositories;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class BonusClaimRepository : Repository<BonusClaim>, IBonusClaimRepository
    {
        private new readonly CasinoDbContext _context;
        private new readonly ILogger<BonusClaimRepository>? _logger;
        private const string _entityName = "BonusClaim";

        public BonusClaimRepository(CasinoDbContext context, ILogger<BonusClaimRepository>? logger = null)
            : base(context, logger)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public new async Task<BonusClaim> GetByIdAsync(string id)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting bonus claim with ID: {Id}", id);

                    var claim = await _context.BonusClaims
                        .Where(bc => bc.Id == id)
                        .FirstOrDefaultAsync();

                    if (claim == null)
                    {
                        throw new EntityNotFoundException(_entityName, id);
                    }

                    return claim;
                },
                _entityName,
                $"Error retrieving bonus claim with ID: {id}",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetActiveClaimsByPlayerIdAsync(string playerId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting active bonus claims for player: {PlayerId}", playerId);

                    var claims = await _context.BonusClaims
                        .Where(bc => bc.PlayerId == playerId && bc.Status == BonusClaimStatus.Active)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} active bonus claims for player: {PlayerId}", claims.Count, playerId);

                    return claims;
                },
                _entityName,
                $"Error retrieving active bonus claims for player: {playerId}",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetClaimsByBonusIdAsync(string bonusId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting claims for bonus: {BonusId}", bonusId);

                    var claims = await _context.BonusClaims
                        .Where(bc => bc.BonusId == bonusId)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} claims for bonus: {BonusId}", claims.Count, bonusId);

                    return claims;
                },
                _entityName,
                $"Error retrieving claims for bonus: {bonusId}",
                _logger
            );
        }

        public async Task<PagedResult<BonusClaim>> GetClaimsByPlayerIdPagedAsync(string playerId, PaginationParameters parameters)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting paged bonus claims for player: {PlayerId}, page: {PageNumber}, size: {PageSize}",
                        playerId, parameters.PageNumber, parameters.PageSize);

                    var query = _context.BonusClaims
                        .Where(bc => bc.PlayerId == playerId)
                        .OrderByDescending(bc => bc.ClaimDate);

                    var totalCount = await query.CountAsync();

                    var claims = await query
                        .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                        .Take(parameters.PageSize)
                        .ToListAsync();

                    var totalPages = (int)Math.Ceiling(totalCount / (double)parameters.PageSize);
                    _logger?.LogInformation("Retrieved {Count} bonus claims for player: {PlayerId} (page {PageNumber} of {TotalPages})",
                        claims.Count, playerId, parameters.PageNumber, totalPages);

                    return new PagedResult<BonusClaim>(
                        claims,
                        totalCount,
                        parameters.PageNumber,
                        parameters.PageSize
                    );
                },
                _entityName,
                $"Error retrieving paged bonus claims for player: {playerId}",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetClaimsByStatusAsync(BonusClaimStatus status)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting bonus claims with status: {Status}", status);

                    var claims = await _context.BonusClaims
                        .Where(bc => bc.Status == status)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} bonus claims with status: {Status}", claims.Count, status);

                    return claims;
                },
                _entityName,
                $"Error retrieving bonus claims with status: {status}",
                _logger
            );
        }

        public async Task UpdateWageringProgressAsync(string claimId, decimal newProgress)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Updating wagering progress for bonus claim: {ClaimId} to {NewProgress}", claimId, newProgress);

                    var claim = await _context.BonusClaims.FindAsync(claimId);
                    if (claim == null)
                    {
                        throw new EntityNotFoundException(_entityName, claimId);
                    }

                    claim.WageringProgress = newProgress;

                    // If wagering requirement is met, update status to completed
                    if (claim.WageringProgress >= claim.WageringRequirement && claim.Status == BonusClaimStatus.Active)
                    {
                        claim.Status = BonusClaimStatus.Completed;
                        _logger?.LogInformation("Bonus claim {ClaimId} marked as completed as wagering requirement has been met", claimId);
                    }

                    await _context.SaveChangesAsync();

                    _logger?.LogInformation("Updated wagering progress for bonus claim: {ClaimId}", claimId);
                },
                _entityName,
                $"Error updating wagering progress for bonus claim: {claimId}",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetRecentClaimsByPlayerIdAsync(string playerId, int daysToLookBack = 30)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var cutoffDate = DateTime.UtcNow.AddDays(-daysToLookBack);

                    _logger?.LogInformation("Getting recent bonus claims for player: {PlayerId} since {CutoffDate:yyyy-MM-dd}", playerId, cutoffDate);

                    var claims = await _context.BonusClaims
                        .Where(bc => bc.PlayerId == playerId && bc.ClaimDate >= cutoffDate)
                        .OrderByDescending(bc => bc.ClaimDate)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} recent bonus claims for player: {PlayerId}", claims.Count, playerId);

                    return claims;
                },
                _entityName,
                $"Error retrieving recent bonus claims for player: {playerId}",
                _logger
            );
        }

        public async Task UpdateStatusAsync(string claimId, BonusClaimStatus status)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Updating status for bonus claim: {ClaimId} to {Status}", claimId, status);

                    var claim = await _context.BonusClaims.FindAsync(claimId);
                    if (claim == null)
                    {
                        throw new EntityNotFoundException(_entityName, claimId);
                    }

                    claim.Status = status;
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation("Updated status for bonus claim: {ClaimId} to {Status}", claimId, status);
                },
                _entityName,
                $"Error updating status for bonus claim: {claimId}",
                _logger
            );
        }

        public async Task<bool> ClaimExistsAsync(string claimId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Checking if bonus claim exists: {ClaimId}", claimId);

                    var exists = await _context.BonusClaims
                        .AnyAsync(bc => bc.Id == claimId);

                    _logger?.LogInformation("Bonus claim {ClaimId} exists: {Exists}", claimId, exists);

                    return exists;
                },
                _entityName,
                $"Error checking if bonus claim exists: {claimId}",
                _logger
            );
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await ClaimExistsAsync(id);
        }

        public async Task DeleteAsync(string id)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Deleting bonus claim with ID: {Id}", id);

                    var claim = await _context.BonusClaims.FindAsync(id);
                    if (claim == null)
                    {
                        throw new EntityNotFoundException(_entityName, id);
                    }

                    _context.BonusClaims.Remove(claim);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation("Deleted bonus claim with ID: {Id}", id);
                    return true;
                },
                _entityName,
                $"Error deleting bonus claim with ID: {id}",
                _logger
            );
        }
    }
}
