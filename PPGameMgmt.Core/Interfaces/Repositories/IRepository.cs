using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Core.Specifications;

namespace PPGameMgmt.Core.Interfaces.Repositories
{
    /// <summary>
    /// Generic repository interface with specification pattern support
    /// </summary>
    public interface IRepository<T> where T : class
    {
        // Basic CRUD operations
        Task<T> GetByIdAsync(string id);
        Task<IEnumerable<T>> GetAllAsync();
        Task<T> AddAsync(T entity);
        Task UpdateAsync(T entity);
        Task DeleteAsync(string id);
        Task DeleteAsync(T entity);
        
        // Query operations with expressions
        Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
        Task<int> CountAsync(Expression<Func<T, bool>> predicate);
        Task<bool> ExistsAsync(string id);
        Task<PagedResult<T>> GetPagedAsync(PaginationParameters parameters);
        Task<PagedResult<T>> FindPagedAsync(Expression<Func<T, bool>> predicate, PaginationParameters parameters);
        
        // Specification pattern operations
        Task<IEnumerable<T>> FindWithSpecificationAsync(Specification<T> specification);
        Task<PagedResult<T>> FindPagedWithSpecificationAsync(Specification<T> specification, PaginationParameters parameters);
        Task<int> CountWithSpecificationAsync(Specification<T> specification);
        Task<bool> ExistsWithSpecificationAsync(Specification<T> specification);
    }
}
