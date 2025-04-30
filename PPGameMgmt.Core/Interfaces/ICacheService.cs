using System;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for caching service
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Gets a value from the cache with the given key
        /// </summary>
        Task<T> GetAsync<T>(string key);
        
        /// <summary>
        /// Sets a value in the cache with the given key
        /// </summary>
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null);
        
        /// <summary>
        /// Removes a value from the cache with the given key
        /// </summary>
        Task RemoveAsync(string key);
        
        /// <summary>
        /// Determines whether the cache contains the given key
        /// </summary>
        Task<bool> ExistsAsync(string key);
        
        /// <summary>
        /// Gets a value from the cache with the given key, or creates it if it doesn't exist
        /// </summary>
        /// <typeparam name="T">Type of cached item</typeparam>
        /// <param name="key">Cache key</param>
        /// <param name="factory">Function to create the value if it doesn't exist</param>
        /// <param name="expiry">Cache expiration time</param>
        /// <returns>The cached or newly created item</returns>
        Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null);
    }
}