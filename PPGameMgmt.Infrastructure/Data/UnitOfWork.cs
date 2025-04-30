using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Bonuses;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly CasinoDbContext _context;
        private readonly ILogger<UnitOfWork> _logger;
        private IDbContextTransaction _transaction;
        private bool _disposed = false;

        public IPlayerRepository Players { get; }
        public IGameRepository Games { get; }
        public IBonusRepository Bonuses { get; }
        public IGameSessionRepository GameSessions { get; }
        public Core.Interfaces.Repositories.IRepository<Core.Entities.Bonuses.BonusClaim> BonusClaims { get; }
        public IPlayerFeaturesRepository PlayerFeatures { get; }
        public IRecommendationRepository Recommendations { get; }

        public UnitOfWork(
            CasinoDbContext context,
            IPlayerRepository playerRepository,
            IGameRepository gameRepository,
            IBonusRepository bonusRepository,
            IGameSessionRepository gameSessionRepository,
            Core.Interfaces.Repositories.IRepository<Core.Entities.Bonuses.BonusClaim> bonusClaimRepository,
            IPlayerFeaturesRepository playerFeaturesRepository,
            IRecommendationRepository recommendationRepository,
            ILogger<UnitOfWork> logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _logger = logger;

            Players = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
            Games = gameRepository ?? throw new ArgumentNullException(nameof(gameRepository));
            Bonuses = bonusRepository ?? throw new ArgumentNullException(nameof(bonusRepository));
            GameSessions = gameSessionRepository ?? throw new ArgumentNullException(nameof(gameSessionRepository));
            BonusClaims = bonusClaimRepository ?? throw new ArgumentNullException(nameof(bonusClaimRepository));
            PlayerFeatures = playerFeaturesRepository ?? throw new ArgumentNullException(nameof(playerFeaturesRepository));
            Recommendations = recommendationRepository ?? throw new ArgumentNullException(nameof(recommendationRepository));
        }

        public async Task<int> SaveChangesAsync()
        {
            try
            {
                if (_disposed)
                {
                    throw new ObjectDisposedException(nameof(UnitOfWork), "Cannot save changes on a disposed UnitOfWork");
                }
                
                // Validate context state before saving changes
                if (_context == null)
                {
                    throw new InvalidOperationException("DbContext is null when attempting to save changes");
                }
                
                return await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during SaveChangesAsync in UnitOfWork");
                throw;
            }
        }

        public async Task BeginTransactionAsync()
        {
            try
            {
                if (_disposed)
                {
                    throw new ObjectDisposedException(nameof(UnitOfWork), "Cannot begin transaction on a disposed UnitOfWork");
                }
                
                // Check for existing transaction
                if (_transaction != null)
                {
                    _logger?.LogWarning("Attempted to begin a transaction when one is already in progress");
                    return;
                }
                
                _transaction = await _context.Database.BeginTransactionAsync();
                _logger?.LogInformation("Transaction begun");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error beginning transaction");
                throw;
            }
        }

        public async Task CommitTransactionAsync()
        {
            try
            {
                if (_disposed)
                {
                    throw new ObjectDisposedException(nameof(UnitOfWork), "Cannot commit transaction on a disposed UnitOfWork");
                }
                
                if (_transaction == null)
                {
                    _logger?.LogWarning("Attempted to commit a transaction, but no transaction exists");
                    return;
                }
                
                await _transaction.CommitAsync();
                _logger?.LogInformation("Transaction committed");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error committing transaction");
                throw;
            }
            finally
            {
                if (_transaction != null)
                {
                    await _transaction.DisposeAsync();
                    _transaction = null;
                }
            }
        }

        public async Task RollbackTransactionAsync()
        {
            try
            {
                if (_disposed)
                {
                    throw new ObjectDisposedException(nameof(UnitOfWork), "Cannot rollback transaction on a disposed UnitOfWork");
                }
                
                if (_transaction == null)
                {
                    _logger?.LogWarning("Attempted to rollback a transaction, but no transaction exists");
                    return;
                }
                
                await _transaction.RollbackAsync();
                _logger?.LogInformation("Transaction rolled back");
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error rolling back transaction");
                throw;
            }
            finally
            {
                if (_transaction != null)
                {
                    await _transaction.DisposeAsync();
                    _transaction = null;
                }
            }
        }

        public void Dispose()
        {
            Dispose(true);
            GC.SuppressFinalize(this);
        }

        protected virtual void Dispose(bool disposing)
        {
            if (!_disposed)
            {
                if (disposing)
                {
                    if (_transaction != null)
                    {
                        _transaction.Dispose();
                        _transaction = null;
                    }
                    
                    // Do not dispose the context as it may be managed by DI container
                    // The repositories may still need to access it after the UnitOfWork is disposed
                    // _context.Dispose();
                }

                _disposed = true;
            }
        }
    }
}
