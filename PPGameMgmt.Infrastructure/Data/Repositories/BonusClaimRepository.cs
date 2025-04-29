using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class BonusClaimRepository : IBonusClaimRepository
    {
        private readonly CasinoDbContext _context;
        private readonly ILogger<BonusClaimRepository> _logger;
        private const string _entityName = "BonusClaim";

        public BonusClaimRepository(CasinoDbContext context, ILogger<BonusClaimRepository> logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;
        }

        public async Task<BonusClaim> GetByIdAsync(string id)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.BonusClaims.FindAsync(id);
                },
                _entityName,
                $"Error retrieving bonus claim with ID: {id}",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetAllAsync()
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.BonusClaims.ToListAsync();
                },
                _entityName,
                "Error retrieving all bonus claims",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> FindAsync(Expression<Func<BonusClaim, bool>> predicate)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.BonusClaims.Where(predicate).ToListAsync();
                },
                _entityName,
                "Error finding bonus claims with predicate",
                _logger
            );
        }

        public async Task AddAsync(BonusClaim entity)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    await _context.BonusClaims.AddAsync(entity);
                    await _context.SaveChangesAsync();
                    return true;
                },
                _entityName,
                $"Error adding bonus claim for player {entity.PlayerId}",
                _logger
            );
        }

        public async Task UpdateAsync(BonusClaim entity)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _context.BonusClaims.Update(entity);
                    await _context.SaveChangesAsync();
                    return true;
                },
                _entityName,
                $"Error updating bonus claim with ID: {entity.Id}",
                _logger
            );
        }

        public async Task DeleteAsync(BonusClaim entity)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _context.BonusClaims.Remove(entity);
                    await _context.SaveChangesAsync();
                    return true;
                },
                _entityName,
                $"Error deleting bonus claim with ID: {entity.Id}",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetClaimsByPlayerAsync(string playerId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.BonusClaims
                        .Where(bc => bc.PlayerId == playerId)
                        .OrderByDescending(bc => bc.ClaimedDate)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving claims for player with ID: {playerId}",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetActiveClaimsByPlayerAsync(string playerId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var now = DateTime.UtcNow;
                    return await _context.BonusClaims
                        .Where(bc => bc.PlayerId == playerId && bc.ExpiryDate >= now)
                        .OrderByDescending(bc => bc.ClaimedDate)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving active claims for player with ID: {playerId}",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetClaimsByBonusAsync(string bonusId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.BonusClaims
                        .Where(bc => bc.BonusId == bonusId)
                        .OrderByDescending(bc => bc.ClaimedDate)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving claims for bonus with ID: {bonusId}",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetRecentClaimsAsync(int days)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var cutoffDate = DateTime.UtcNow.AddDays(-days);
                    return await _context.BonusClaims
                        .Where(bc => bc.ClaimedDate >= cutoffDate)
                        .OrderByDescending(bc => bc.ClaimedDate)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving recent claims from last {days} days",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetByPlayerIdAsync(string playerId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    return await _context.BonusClaims
                        .Where(bc => bc.PlayerId == playerId)
                        .OrderByDescending(bc => bc.ClaimedDate)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving claims for player with ID: {playerId}",
                _logger
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetRecentClaimsByPlayerIdAsync(string playerId, int days)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var cutoffDate = DateTime.UtcNow.AddDays(-days);
                    return await _context.BonusClaims
                        .Where(bc => bc.PlayerId == playerId && bc.ClaimedDate >= cutoffDate)
                        .OrderByDescending(bc => bc.ClaimedDate)
                        .ToListAsync();
                },
                _entityName,
                $"Error retrieving recent claims for player with ID: {playerId} in the last {days} days",
                _logger
            );
        }

        public async Task<PagedResult<BonusClaim>> GetPagedAsync(PaginationParameters parameters)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var totalCount = await _context.BonusClaims.CountAsync();
                    var items = await _context.BonusClaims
                        .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                        .Take(parameters.PageSize)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {items.Count} bonus claims (page {parameters.PageNumber} of {Math.Ceiling((double)totalCount / parameters.PageSize)})");
                    return new PagedResult<BonusClaim>(items, totalCount, parameters.PageNumber, parameters.PageSize);
                },
                _entityName,
                "Error retrieving paged bonus claims",
                _logger
            );
        }

        public async Task<PagedResult<BonusClaim>> FindPagedAsync(Expression<Func<BonusClaim, bool>> predicate, PaginationParameters parameters)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var query = _context.BonusClaims.Where(predicate);
                    var totalCount = await query.CountAsync();
                    var items = await query
                        .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                        .Take(parameters.PageSize)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {items.Count} filtered bonus claims (page {parameters.PageNumber} of {Math.Ceiling((double)totalCount / parameters.PageSize)})");
                    return new PagedResult<BonusClaim>(items, totalCount, parameters.PageNumber, parameters.PageSize);
                },
                _entityName,
                "Error finding paged bonus claims with predicate",
                _logger
            );
        }
    }
}