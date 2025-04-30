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
using PPGameMgmt.Core.Specifications.BonusClaimSpecs;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class BonusClaimRepository : Repository<BonusClaim>, IBonusClaimRepository
    {
        public BonusClaimRepository(CasinoDbContext context, ILogger<BonusClaimRepository>? logger = null)
            : base(context, logger)
        {
        }

        // No need to override GetByIdAsync - the base implementation with exception handling will handle this

        public async Task<IEnumerable<BonusClaim>> GetActiveClaimsByPlayerIdAsync(string playerId)
        {
            var specification = new ActiveBonusClaimsByPlayerSpecification(playerId);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<BonusClaim>> GetClaimsByBonusIdAsync(string bonusId)
        {
            var specification = new BonusClaimsByBonusIdSpecification(bonusId);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<PagedResult<BonusClaim>> GetClaimsByPlayerIdPagedAsync(string playerId, PaginationParameters parameters)
        {
            var specification = new BonusClaimsByPlayerIdSpecification(playerId);
            return await FindPagedWithSpecificationAsync(specification, parameters);
        }

        public async Task<IEnumerable<BonusClaim>> GetClaimsByStatusAsync(BonusClaimStatus status)
        {
            var specification = new BonusClaimsByStatusSpecification(status);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task UpdateWageringProgressAsync(string claimId, decimal newProgress)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    var claim = await _dbSet.FindAsync(claimId);
                    if (claim == null)
                    {
                        throw new EntityNotFoundException(_entityName, claimId);
                    }

                    claim.WageringProgress = newProgress;

                    // If wagering requirement is met, update status to completed
                    if (claim.WageringProgress >= claim.WageringRequirement && claim.Status == BonusClaimStatus.Active)
                    {
                        claim.Status = BonusClaimStatus.Completed;
                    }

                    _context.Entry(claim).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    return true;
                },
                $"Error updating wagering progress for bonus claim: {claimId}"
            );
        }

        public async Task<IEnumerable<BonusClaim>> GetRecentClaimsByPlayerIdAsync(string playerId, int daysToLookBack = 30)
        {
            var specification = new RecentBonusClaimsByPlayerIdSpecification(playerId, daysToLookBack);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task UpdateStatusAsync(string claimId, BonusClaimStatus status)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    var claim = await _dbSet.FindAsync(claimId);
                    if (claim == null)
                    {
                        throw new EntityNotFoundException(_entityName, claimId);
                    }

                    claim.Status = status;
                    _context.Entry(claim).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    return true;
                },
                $"Error updating status for bonus claim: {claimId}"
            );
        }

        public async Task<bool> ClaimExistsAsync(string claimId)
        {
            return await ExistsAsync(claimId);
        }
    }
}
