using System.Linq;
using Microsoft.EntityFrameworkCore;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Core.Specifications;

namespace PPGameMgmt.Infrastructure.Data
{
    /// <summary>
    /// Evaluates specifications and applies them to IQueryable
    /// </summary>
    public class SpecificationEvaluator<T> where T : class
    {
        /// <summary>
        /// Applies a specification to a query
        /// </summary>
        public static IQueryable<T> GetQuery(IQueryable<T> inputQuery, Specification<T> specification)
        {
            var query = inputQuery;

            // Apply base criteria from the specification
            if (specification.ToExpression() != null)
            {
                query = query.Where(specification.ToExpression());
            }

            // Apply includes if the specification supports them
            if (specification is IIncludeSpecification<T> includeSpec)
            {
                query = includeSpec.Includes.Aggregate(query, 
                    (current, include) => current.Include(include));
                
                query = includeSpec.IncludeStrings.Aggregate(query,
                    (current, include) => current.Include(include));
            }
            
            // Apply ordering if the specification supports it
            if (specification is IOrderSpecification<T> orderSpec)
            {
                if (orderSpec.OrderBy != null)
                {
                    query = query.OrderBy(orderSpec.OrderBy);
                }
                else if (orderSpec.OrderByDescending != null)
                {
                    query = query.OrderByDescending(orderSpec.OrderByDescending);
                }
                
                // Apply secondary ordering
                if (orderSpec.ThenBy != null)
                {
                    query = ((IOrderedQueryable<T>)query).ThenBy(orderSpec.ThenBy);
                }
                else if (orderSpec.ThenByDescending != null)
                {
                    query = ((IOrderedQueryable<T>)query).ThenByDescending(orderSpec.ThenByDescending);
                }
            }

            return query;
        }
        
        /// <summary>
        /// Applies a specification with pagination to a query
        /// </summary>
        public static IQueryable<T> GetPaginatedQuery(IQueryable<T> query, Specification<T> specification, 
            PaginationParameters parameters)
        {
            var baseQuery = GetQuery(query, specification);
            
            // Apply pagination
            return baseQuery
                .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                .Take(parameters.PageSize);
        }
    }
}