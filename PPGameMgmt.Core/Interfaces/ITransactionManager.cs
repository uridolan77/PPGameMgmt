using System;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for managing transactions for operations that modify multiple entities
    /// </summary>
    public interface ITransactionManager
    {
        /// <summary>
        /// Executes an operation within a transaction
        /// </summary>
        /// <typeparam name="T">The return type of the operation</typeparam>
        /// <param name="operation">The operation to execute within a transaction</param>
        /// <returns>The result of the operation</returns>
        Task<T> ExecuteInTransactionAsync<T>(Func<Task<T>> operation);
        
        /// <summary>
        /// Executes an operation within a transaction
        /// </summary>
        /// <param name="operation">The operation to execute within a transaction</param>
        Task ExecuteInTransactionAsync(Func<Task> operation);
    }
}