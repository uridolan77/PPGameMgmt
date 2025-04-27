using System;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Service for handling distributed caching operations
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Gets an item from the cache or null if not found
        /// </summary>
        /// <typeparam name="T">The type of the item</typeparam>
        /// <param name="key">Cache key</param>
        Task<T?> GetAsync<T>(string key) where T : class;
        
        /// <summary>
        /// Sets an item in the cache with optional absolute expiration
        /// </summary>
        /// <typeparam name="T">The type of the item</typeparam>
        /// <param name="key">Cache key</param>
        /// <param name="value">Item to cache</param>
        /// <param name="absoluteExpiration">Optional absolute expiration time</param>
        Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpiration = null) where T : class;
        
        /// <summary>
        /// Removes an item from the cache
        /// </summary>
        /// <param name="key">Cache key to remove</param>
        Task RemoveAsync(string key);
        
        /// <summary>
        /// Gets an item from cache or executes the factory function to get and cache the value
        /// </summary>
        /// <typeparam name="T">The type of the item</typeparam>
        /// <param name="key">Cache key</param>
        /// <param name="factory">Factory function to get the value if not in cache</param>
        /// <param name="absoluteExpiration">Optional absolute expiration time</param>
        Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? absoluteExpiration = null) where T : class;
    }
}