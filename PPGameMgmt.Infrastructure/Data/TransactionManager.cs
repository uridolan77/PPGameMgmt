using System;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Infrastructure.Data
{
    /// <summary>
    /// Provides transaction management for operations that modify multiple entities
    /// </summary>
    public class TransactionManager : ITransactionManager
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<TransactionManager> _logger;

        public TransactionManager(IUnitOfWork unitOfWork, ILogger<TransactionManager> logger = null)
        {
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger;
        }

        /// <summary>
        /// Executes an operation within a transaction
        /// </summary>
        /// <typeparam name="T">The return type of the operation</typeparam>
        /// <param name="operation">The operation to execute within a transaction</param>
        /// <returns>The result of the operation</returns>
        public async Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation)
        {
            try
            {
                _logger?.LogInformation("Beginning transaction for operation");
                await _unitOfWork.BeginTransactionAsync();

                var result = await operation();
                await _unitOfWork.SaveChangesAsync();
                
                _logger?.LogInformation("Committing transaction");
                await _unitOfWork.CommitTransactionAsync();
                
                return result;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during transaction execution, rolling back");
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }

        /// <summary>
        /// Executes an operation within a transaction
        /// </summary>
        /// <param name="operation">The operation to execute within a transaction</param>
        public async Task ExecuteInTransactionAsync(Func<Task> operation)
        {
            try
            {
                _logger?.LogInformation("Beginning transaction for operation");
                await _unitOfWork.BeginTransactionAsync();

                await operation();
                await _unitOfWork.SaveChangesAsync();
                
                _logger?.LogInformation("Committing transaction");
                await _unitOfWork.CommitTransactionAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error during transaction execution, rolling back");
                await _unitOfWork.RollbackTransactionAsync();
                throw;
            }
        }
    }
}