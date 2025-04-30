using System;
using System.Collections.Concurrent;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Infrastructure.Services
{
    /// <summary>
    /// In-memory implementation of ICacheService for use when Redis is unavailable
    /// </summary>
    public class InMemoryCacheService : ICacheService
    {
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<InMemoryCacheService> _logger;
        private readonly ConcurrentDictionary<string, object> _locks = new ConcurrentDictionary<string, object>();

        public InMemoryCacheService(IMemoryCache memoryCache, ILogger<InMemoryCacheService> logger)
        {
            _memoryCache = memoryCache;
            _logger = logger;
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null)
        {
            if (_memoryCache.TryGetValue(key, out T cachedValue))
            {
                _logger.LogDebug("Cache hit for key {Key}", key);
                return cachedValue;
            }

            _logger.LogDebug("Cache miss for key {Key}, creating value", key);

            // Use a lock per key to prevent multiple factory executions
            var lockObj = _locks.GetOrAdd(key, _ => new object());

            lock (lockObj)
            {
                // Check again in case another thread created the value while we were waiting
                if (_memoryCache.TryGetValue(key, out cachedValue))
                {
                    _logger.LogDebug("Cache hit for key {Key} after acquiring lock", key);
                    return cachedValue;
                }

                try
                {
                    // Execute the factory to create the value
                    T value = factory().GetAwaiter().GetResult();

                    // Cache the value
                    var cacheOptions = new MemoryCacheEntryOptions();
                    if (expiry.HasValue)
                    {
                        cacheOptions.AbsoluteExpirationRelativeToNow = expiry.Value;
                    }
                    else
                    {
                        // Default expiration of 10 minutes
                        cacheOptions.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
                    }

                    _memoryCache.Set(key, value, cacheOptions);
                    _logger.LogDebug("Cached value for key {Key} with expiry {Expiry}", key, expiry);

                    return value;
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error creating value for key {Key}", key);
                    throw;
                }
                finally
                {
                    // Remove the lock object to free memory
                    _locks.TryRemove(key, out _);
                }
            }
        }

        public Task<T> GetAsync<T>(string key)
        {
            if (_memoryCache.TryGetValue(key, out T cachedValue))
            {
                _logger.LogDebug("Cache hit for key {Key}", key);
                return Task.FromResult(cachedValue);
            }

            _logger.LogDebug("Cache miss for key {Key}", key);
            return Task.FromResult<T>(default);
        }

        public Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var cacheOptions = new MemoryCacheEntryOptions();
            if (expiry.HasValue)
            {
                cacheOptions.AbsoluteExpirationRelativeToNow = expiry.Value;
            }
            else
            {
                // Default expiration of 10 minutes
                cacheOptions.AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(10);
            }

            _memoryCache.Set(key, value, cacheOptions);
            _logger.LogDebug("Cached value for key {Key} with expiry {Expiry}", key, expiry);

            return Task.CompletedTask;
        }

        public Task RemoveAsync(string key)
        {
            _memoryCache.Remove(key);
            _logger.LogDebug("Removed key {Key} from cache", key);

            return Task.CompletedTask;
        }

        public Task<bool> ExistsAsync(string key)
        {
            bool exists = _memoryCache.TryGetValue(key, out _);
            _logger.LogDebug("Checking if key {Key} exists in cache: {Exists}", key, exists);

            return Task.FromResult(exists);
        }
    }
}
