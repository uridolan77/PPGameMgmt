using System;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Infrastructure.CQRS
{
    /// <summary>
    /// Implementation of the query processor that resolves and executes query handlers
    /// </summary>
    public class QueryProcessor : IQueryProcessor
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<QueryProcessor> _logger;

        public QueryProcessor(IServiceProvider serviceProvider, ILogger<QueryProcessor> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        /// <summary>
        /// Processes a query by resolving the appropriate handler and executing it
        /// </summary>
        public async Task<TResult> ProcessAsync<TResult>(IQuery<TResult> query)
        {
            var queryType = query.GetType();
            _logger.LogInformation("Processing query of type {QueryType}", queryType.Name);

            // Get the generic handler type for this query and result type
            var handlerType = typeof(IQueryHandler<,>).MakeGenericType(queryType, typeof(TResult));

            // Resolve the handler instance from the service provider
            var handler = _serviceProvider.GetService(handlerType);
            
            if (handler == null)
            {
                _logger.LogError("No handler registered for query type {QueryType}", queryType.Name);
                throw new InvalidOperationException($"No handler registered for query type {queryType.Name}");
            }

            try
            {
                // Get the HandleAsync method from the handler type
                var method = handlerType.GetMethod("HandleAsync");
                
                // Invoke the method and await the result
                var task = (Task<TResult>)method.Invoke(handler, new object[] { query });
                var result = await task;
                
                _logger.LogInformation("Query {QueryType} processed successfully", queryType.Name);
                return result;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing query {QueryType}", queryType.Name);
                throw;
            }
        }
    }
}