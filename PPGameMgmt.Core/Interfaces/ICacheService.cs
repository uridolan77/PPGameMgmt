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
    }
}