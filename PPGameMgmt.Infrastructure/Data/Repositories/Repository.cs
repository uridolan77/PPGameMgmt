using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class Repository<T> : IRepository<T> where T : class
    {
        protected readonly CasinoDbContext _context;
        protected readonly DbSet<T> _dbSet;
        protected readonly ILogger _logger;

        public Repository(CasinoDbContext context, ILogger logger = null)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
            _dbSet = _context.Set<T>();
            _logger = logger;
        }

        // IRepository<T> implementation
        public virtual async Task<T> GetByIdAsync(Guid id)
        {
            try
            {
                return await _dbSet.FindAsync(id);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving entity of type {typeof(T).Name} with ID: {id}");
                throw;
            }
        }

        public virtual async Task<IReadOnlyList<T>> ListAllAsync()
        {
            try
            {
                return await _dbSet.ToListAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving all entities of type {typeof(T).Name}");
                throw;
            }
        }

        public virtual async Task<IReadOnlyList<T>> ListAsync(Expression<Func<T, bool>> predicate)
        {
            try
            {
                return await _dbSet.Where(predicate).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error finding entities of type {typeof(T).Name} with predicate");
                throw;
            }
        }

        public virtual async Task<T> AddAsync(T entity)
        {
            try
            {
                await _dbSet.AddAsync(entity);
                // Note: SaveChangesAsync is not called here, it will be called by the UnitOfWork
                return entity;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error adding entity of type {typeof(T).Name}");
                throw;
            }
        }

        public virtual async Task UpdateAsync(T entity)
        {
            try
            {
                // Attach the entity if it's not being tracked
                if (_context.Entry(entity).State == EntityState.Detached)
                {
                    _dbSet.Attach(entity);
                }

                _context.Entry(entity).State = EntityState.Modified;

                // Note: SaveChangesAsync is not called here, it will be called by the UnitOfWork
                await Task.CompletedTask; // Just to make the method async consistent
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error updating entity of type {typeof(T).Name}");
                throw;
            }
        }

        public virtual async Task DeleteAsync(Guid id)
        {
            try
            {
                var entity = await _dbSet.FindAsync(id);
                if (entity != null)
                {
                    _dbSet.Remove(entity);
                    // Note: SaveChangesAsync is not called here, it will be called by the UnitOfWork
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error deleting entity of type {typeof(T).Name} with ID: {id}");
                throw;
            }
        }

        public virtual async Task<int> CountAsync(Expression<Func<T, bool>> predicate)
        {
            try
            {
                return await _dbSet.CountAsync(predicate);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error counting entities of type {typeof(T).Name} with predicate");
                throw;
            }
        }

        // Additional repository methods not in IRepository<T> but useful for the application
        public virtual async Task<T> GetByIdAsync(string id)
        {
            try
            {
                return await _dbSet.FindAsync(id);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving entity of type {typeof(T).Name} with string ID: {id}");
                throw;
            }
        }

        public virtual async Task<IEnumerable<T>> GetAllAsync()
        {
            return await ListAllAsync() as IEnumerable<T>;
        }

        public virtual async Task<PagedResult<T>> GetPagedAsync(PaginationParameters parameters)
        {
            try
            {
                var totalCount = await _dbSet.CountAsync();
                var items = await _dbSet
                    .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                    .Take(parameters.PageSize)
                    .ToListAsync();

                return new PagedResult<T>(items, totalCount, parameters.PageNumber, parameters.PageSize);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving paged entities of type {typeof(T).Name}");
                throw;
            }
        }

        public virtual async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        {
            return await ListAsync(predicate) as IEnumerable<T>;
        }

        public virtual async Task<PagedResult<T>> FindPagedAsync(Expression<Func<T, bool>> predicate, PaginationParameters parameters)
        {
            try
            {
                var query = _dbSet.Where(predicate);
                var totalCount = await query.CountAsync();
                var items = await query
                    .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                    .Take(parameters.PageSize)
                    .ToListAsync();

                return new PagedResult<T>(items, totalCount, parameters.PageNumber, parameters.PageSize);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error finding paged entities of type {typeof(T).Name} with predicate");
                throw;
            }
        }

        public virtual async Task DeleteAsync(T entity)
        {
            try
            {
                _dbSet.Remove(entity);
                await Task.CompletedTask; // Just to make the method async consistent
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error deleting entity of type {typeof(T).Name}");
                throw;
            }
        }
    }
}
