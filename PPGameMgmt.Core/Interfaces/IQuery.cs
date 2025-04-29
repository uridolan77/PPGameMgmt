using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Base interface for query objects
    /// </summary>
    /// <typeparam name="TResult">The type of the query result</typeparam>
    public interface IQuery<TResult>
    {
    }

    /// <summary>
    /// Interface for query handlers
    /// </summary>
    /// <typeparam name="TQuery">The query type</typeparam>
    /// <typeparam name="TResult">The result type</typeparam>
    public interface IQueryHandler<TQuery, TResult> where TQuery : IQuery<TResult>
    {
        /// <summary>
        /// Executes the query and returns the result
        /// </summary>
        Task<TResult> HandleAsync(TQuery query);
    }
    
    /// <summary>
    /// Interface for query processors that coordinate query execution
    /// </summary>
    public interface IQueryProcessor
    {
        /// <summary>
        /// Processes a query and returns the result
        /// </summary>
        Task<TResult> ProcessAsync<TResult>(IQuery<TResult> query);
    }
}