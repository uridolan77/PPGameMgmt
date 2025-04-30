using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities.Bonuses;
using PPGameMgmt.Core.Models;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    /// <summary>
    /// Adapter class that implements Core.Interfaces.IBonusClaimRepository 
    /// by delegating to Core.Interfaces.Repositories.IBonusClaimRepository
    /// </summary>
    public class BonusClaimRepositoryAdapter : PPGameMgmt.Core.Interfaces.IBonusClaimRepository
    {
        private readonly PPGameMgmt.Core.Interfaces.Repositories.IBonusClaimRepository _repository;
        private readonly ILogger<BonusClaimRepositoryAdapter> _logger;

        public BonusClaimRepositoryAdapter(
            PPGameMgmt.Core.Interfaces.Repositories.IBonusClaimRepository repository,
            ILogger<BonusClaimRepositoryAdapter> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        // Implement PPGameMgmt.Core.Interfaces.IBonusClaimRepository methods

        // GetByIdAsync methods
        Task<BonusClaim> PPGameMgmt.Core.Interfaces.IBonusClaimRepository.GetByIdAsync(string id) => 
            _repository.GetByIdAsync(id);

        // GetActiveClaimsByPlayerIdAsync
        Task<IEnumerable<BonusClaim>> PPGameMgmt.Core.Interfaces.IBonusClaimRepository.GetActiveClaimsByPlayerIdAsync(string playerId) => 
            _repository.GetActiveClaimsByPlayerIdAsync(playerId);

        // GetClaimsByBonusIdAsync
        Task<IEnumerable<BonusClaim>> PPGameMgmt.Core.Interfaces.IBonusClaimRepository.GetClaimsByBonusIdAsync(string bonusId) => 
            _repository.GetClaimsByBonusIdAsync(bonusId);

        // GetClaimsByPlayerIdPagedAsync
        Task<PagedResult<BonusClaim>> PPGameMgmt.Core.Interfaces.IBonusClaimRepository.GetClaimsByPlayerIdPagedAsync(string playerId, PaginationParameters parameters) => 
            _repository.GetClaimsByPlayerIdPagedAsync(playerId, parameters);

        // GetClaimsByStatusAsync
        Task<IEnumerable<BonusClaim>> PPGameMgmt.Core.Interfaces.IBonusClaimRepository.GetClaimsByStatusAsync(BonusClaimStatus status) => 
            _repository.GetClaimsByStatusAsync(status);

        // UpdateWageringProgressAsync
        Task PPGameMgmt.Core.Interfaces.IBonusClaimRepository.UpdateWageringProgressAsync(string claimId, decimal newProgress) => 
            _repository.UpdateWageringProgressAsync(claimId, newProgress);

        // UpdateStatusAsync
        Task PPGameMgmt.Core.Interfaces.IBonusClaimRepository.UpdateStatusAsync(string claimId, BonusClaimStatus newStatus) => 
            _repository.UpdateStatusAsync(claimId, newStatus);

        // ClaimExistsAsync
        Task<bool> PPGameMgmt.Core.Interfaces.IBonusClaimRepository.ClaimExistsAsync(string claimId) => 
            _repository.ClaimExistsAsync(claimId);

        // GetRecentClaimsByPlayerIdAsync
        Task<IEnumerable<BonusClaim>> PPGameMgmt.Core.Interfaces.IBonusClaimRepository.GetRecentClaimsByPlayerIdAsync(string playerId, int daysToLookBack) => 
            _repository.GetRecentClaimsByPlayerIdAsync(playerId, daysToLookBack);
            
        // Implement IRepository<BonusClaim> methods from the old interface

        // GetByIdAsync with Guid parameter
        public Task<BonusClaim> GetByIdAsync(Guid id) => 
            _repository.GetByIdAsync(id.ToString());

        // ListAllAsync
        public Task<IReadOnlyList<BonusClaim>> ListAllAsync() => 
            Task.FromResult<IReadOnlyList<BonusClaim>>(
                _repository.GetAllAsync().Result.ToList().AsReadOnly());

        // ListAsync
        public Task<IReadOnlyList<BonusClaim>> ListAsync(Expression<Func<BonusClaim, bool>> predicate) => 
            Task.FromResult<IReadOnlyList<BonusClaim>>(
                _repository.FindAsync(predicate).Result.ToList().AsReadOnly());

        // AddAsync
        public Task<BonusClaim> AddAsync(BonusClaim entity) => 
            _repository.AddAsync(entity);

        // UpdateAsync
        public Task UpdateAsync(BonusClaim entity) => 
            _repository.UpdateAsync(entity);

        // DeleteAsync (Guid version)
        public Task DeleteAsync(Guid id) => 
            _repository.DeleteAsync(id.ToString());

        // DeleteAsync (entity version)
        public Task DeleteAsync(BonusClaim entity) => 
            _repository.DeleteAsync(entity);

        // CountAsync
        public Task<int> CountAsync(Expression<Func<BonusClaim, bool>> predicate) => 
            _repository.CountAsync(predicate);
    }
}