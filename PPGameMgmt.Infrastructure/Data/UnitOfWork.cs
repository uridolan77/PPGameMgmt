using System;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;
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
        public IBonusClaimRepository BonusClaims { get; }
        public IPlayerFeaturesRepository PlayerFeatures { get; }
        public IRecommendationRepository Recommendations { get; }

        public UnitOfWork(
            CasinoDbContext context,
            IPlayerRepository playerRepository,
            IGameRepository gameRepository,
            IBonusRepository bonusRepository,
            IGameSessionRepository gameSessionRepository,
            IBonusClaimRepository bonusClaimRepository,
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
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync()
        {
            try
            {
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
                await _transaction.DisposeAsync();
                _transaction = null;
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
                    _transaction?.Dispose();
                    _context.Dispose();
                }

                _disposed = true;
            }
        }
    }
}
