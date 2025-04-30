using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces.Repositories;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Core.Specifications;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly CasinoDbContext _context;
        protected readonly DbSet<T> _dbSet;
        protected readonly ILogger? _logger;
        protected readonly string _entityName;

        public Repository(CasinoDbContext context, ILogger? logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<T>();
            _logger = logger;
            _entityName = typeof(T).Name;
        }

        // IRepository<T> implementation
        public virtual async Task<T> GetByIdAsync(Guid id)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Getting {_entityName} with ID: {id}");
                    return await _dbSet.FindAsync(id);
                },
                $"Error retrieving {_entityName} with ID: {id}"
            );
        }

        public virtual async Task<T> GetByIdAsync(string id)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Getting {_entityName} with ID: {id}");
                    return await _dbSet.FindAsync(id);
                },
                $"Error retrieving {_entityName} with ID: {id}"
            );
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Getting all {_entityName} entities");
                    return await _dbSet.ToListAsync();
                },
                $"Error retrieving all {_entityName} entities"
            );
        }

        public virtual async Task<PagedResult<T>> GetPagedAsync(PaginationParameters parameters)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Getting paged {_entityName} entities, Page: {parameters.PageNumber}, Size: {parameters.PageSize}");
                    var totalCount = await _dbSet.CountAsync();
                    var items = await _dbSet
                        .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                        .Take(parameters.PageSize)
                        .ToListAsync();

                    return new PagedResult<T>(items, totalCount, parameters.PageNumber, parameters.PageSize);
                },
                $"Error retrieving paged {_entityName} entities"
            );
        }

        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Finding {_entityName} entities with predicate");
                    return await _dbSet.Where(predicate).ToListAsync();
                },
                $"Error finding {_entityName} entities with predicate"
            );
        }

        public virtual async Task<PagedResult<T>> FindPagedAsync(Expression<Func<T, bool>> predicate, PaginationParameters parameters)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Finding paged {_entityName} entities with predicate, Page: {parameters.PageNumber}, Size: {parameters.PageSize}");
                    var query = _dbSet.Where(predicate);
                    var totalCount = await query.CountAsync();
                    var items = await query
                        .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                        .Take(parameters.PageSize)
                        .ToListAsync();

                    return new PagedResult<T>(items, totalCount, parameters.PageNumber, parameters.PageSize);
                },
                $"Error finding paged {_entityName} entities with predicate"
            );
        }

        // Specification pattern support
        public virtual async Task<IEnumerable<T>> FindWithSpecificationAsync(Specification<T> specification)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Finding {_entityName} entities with specification");
                    var query = SpecificationEvaluator<T>.GetQuery(_dbSet.AsQueryable(), specification);
                    return await query.ToListAsync();
                },
                $"Error finding {_entityName} entities with specification"
            );
        }

        public virtual async Task<PagedResult<T>> FindPagedWithSpecificationAsync(Specification<T> specification, PaginationParameters parameters)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Finding paged {_entityName} entities with specification, Page: {parameters.PageNumber}, Size: {parameters.PageSize}");
                    var query = _dbSet.AsQueryable();
                    var countQuery = SpecificationEvaluator<T>.GetQuery(query, specification);
                    var totalCount = await countQuery.CountAsync();
                    
                    var pagedQuery = SpecificationEvaluator<T>.GetPaginatedQuery(query, specification, parameters);
                    var items = await pagedQuery.ToListAsync();

                    return new PagedResult<T>(items, totalCount, parameters.PageNumber, parameters.PageSize);
                },
                $"Error finding paged {_entityName} entities with specification"
            );
        }

        public virtual async Task<T> AddAsync(T entity)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Adding new {_entityName} entity");
                    await _dbSet.AddAsync(entity);
                    // Note: SaveChangesAsync is not called here, it will be called by the UnitOfWork
                    return entity;
                },
                $"Error adding {_entityName} entity"
            );
        }

        public virtual async Task UpdateAsync(T entity)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Updating {_entityName} entity");
                    // Attach the entity if it's not being tracked
                    if (_context.Entry(entity).State == EntityState.Detached)
                    {
                        _dbSet.Attach(entity);
                    }

                    _context.Entry(entity).State = EntityState.Modified;
                    await Task.CompletedTask; // Just to make the method async consistent
                    return true;
                },
                $"Error updating {_entityName} entity"
            );
        }

        public virtual async Task DeleteAsync(T entity)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Deleting {_entityName} entity");
                    _dbSet.Remove(entity);
                    await Task.CompletedTask; // Just to make the method async consistent
                    return true;
                },
                $"Error deleting {_entityName} entity"
            );
        }

        public virtual async Task DeleteAsync(Guid id)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Deleting {_entityName} with ID: {id}");
                    var entity = await _dbSet.FindAsync(id);
                    if (entity != null)
                    {
                        _dbSet.Remove(entity);
                    }
                    return true;
                },
                $"Error deleting {_entityName} with ID: {id}"
            );
        }

        public virtual async Task DeleteAsync(string id)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Deleting {_entityName} with ID: {id}");
                    var entity = await _dbSet.FindAsync(id);
                    if (entity != null)
                    {
                        _dbSet.Remove(entity);
                    }
                    return true;
                },
                $"Error deleting {_entityName} with ID: {id}"
            );
        }

        public virtual async Task<int> CountAsync(Expression<Func<T, bool>> predicate)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Counting {_entityName} entities with predicate");
                    return await _dbSet.CountAsync(predicate);
                },
                $"Error counting {_entityName} entities with predicate"
            );
        }

        public virtual async Task<int> CountWithSpecificationAsync(Specification<T> specification)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Counting {_entityName} entities with specification");
                    var query = SpecificationEvaluator<T>.GetQuery(_dbSet.AsQueryable(), specification);
                    return await query.CountAsync();
                },
                $"Error counting {_entityName} entities with specification"
            );
        }

        public virtual async Task<bool> ExistsAsync(string id)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Checking if {_entityName} with ID: {id} exists");
                    var entity = await _dbSet.FindAsync(id);
                    return entity != null;
                },
                $"Error checking if {_entityName} with ID: {id} exists"
            );
        }

        public virtual async Task<bool> ExistsWithSpecificationAsync(Specification<T> specification)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    _logger?.LogDebug($"Checking if {_entityName} exists with specification");
                    var query = SpecificationEvaluator<T>.GetQuery(_dbSet.AsQueryable(), specification);
                    return await query.AnyAsync();
                },
                $"Error checking if {_entityName} exists with specification"
            );
        }

        // Legacy methods needed for backward compatibility
        public virtual async Task<IReadOnlyList<T>> ListAllAsync()
        {
            var result = await GetAllAsync();
            return result.ToList().AsReadOnly();
        }

        public virtual async Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>> predicate)
        {
            var result = await FindAsync(predicate);
            return result.ToList().AsReadOnly();
        }

        // Integrated exception handling
        protected virtual async Task<TResult> ExecuteRepositoryOperationAsync<TResult>(Func<Task<TResult>> operation, string errorMessage)
        {
            try
            {
                return await operation();
            }
            catch (DbUpdateConcurrencyException ex)
            {
                _logger?.LogError(ex, "Concurrency conflict detected with {EntityName}: {Message}", _entityName, ex.Message);
                throw new ConcurrencyException(_entityName, GetEntityId(ex), "The data was modified by another user while you were editing it");
            }
            catch (DbUpdateException ex)
            {
                _logger?.LogError(ex, "Database update error with {EntityName}: {Message}", _entityName, ex.Message);
                
                // Handle specific database constraint violations
                if (IsDuplicateKeyException(ex))
                {
                    throw new BusinessRuleViolationException("DuplicateKey", $"A {_entityName} with the same key already exists.", "Please use a different identifier");
                }
                
                if (IsForeignKeyViolation(ex))
                {
                    throw new BusinessRuleViolationException("ForeignKeyViolation", $"Cannot perform operation on {_entityName} because it would violate a relationship constraint.", "The related data must exist first");
                }
                
                throw new InfrastructureException("Database", errorMessage, new Exception(ex.Message));
            }
            catch (EntityNotFoundException)
            {
                // Just re-throw domain exceptions
                throw;
            }
            catch (Exception ex)
            {
                // For any other exception, log it and wrap it
                _logger?.LogError(ex, "Unexpected error with {EntityName}: {Message}", _entityName, ex.Message);
                throw new InfrastructureException("Repository", errorMessage, ex);
            }
        }

        // Helper methods for exception handling
        private string GetEntityId(DbUpdateConcurrencyException ex)
        {
            try
            {
                var entry = ex.Entries.FirstOrDefault();
                if (entry != null)
                {
                    var property = entry.Properties.FirstOrDefault(p => p.Metadata.Name.EndsWith("Id", StringComparison.OrdinalIgnoreCase));
                    if (property != null)
                    {
                        return property.CurrentValue?.ToString() ?? "unknown";
                    }
                }
            }
            catch
            {
                // Ignore any errors in extracting the ID
            }
            
            return "unknown";
        }
        
        private bool IsDuplicateKeyException(DbUpdateException ex)
        {
            string innerMessage = ex.InnerException?.Message.ToLower() ?? "";
            return innerMessage.Contains("duplicate key") ||
                   innerMessage.Contains("unique constraint") ||
                   innerMessage.Contains("duplicate entry");
        }

        private bool IsForeignKeyViolation(DbUpdateException ex)
        {
            string innerMessage = ex.InnerException?.Message.ToLower() ?? "";
            return innerMessage.Contains("foreign key") ||
                   innerMessage.Contains("reference constraint");
        }
    }
}
