using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Infrastructure.Services
{
    /// <summary>
    /// Redis implementation of cache service
    /// </summary>
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _distributedCache;
        private readonly ILogger<RedisCacheService> _logger;

        public RedisCacheService(
            IDistributedCache distributedCache,
            ILogger<RedisCacheService> logger)
        {
            _distributedCache = distributedCache ?? throw new ArgumentNullException(nameof(distributedCache));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<T> GetAsync<T>(string key)
        {
            try
            {
                _logger.LogDebug("Attempting to get value from cache with key {Key}", key);
                var cachedValue = await _distributedCache.GetStringAsync(key);

                if (string.IsNullOrEmpty(cachedValue))
                {
                    _logger.LogDebug("No value found in cache for key {Key}", key);
                    return default;
                }

                _logger.LogDebug("Value found in cache for key {Key}", key);
                return JsonSerializer.Deserialize<T>(cachedValue);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving value from cache with key {Key}", key);
                return default;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            try
            {
                _logger.LogDebug("Setting value in cache with key {Key}", key);
                var options = new DistributedCacheEntryOptions();

                if (expiry.HasValue)
                {
                    options.AbsoluteExpirationRelativeToNow = expiry;
                    _logger.LogDebug("Setting expiration for key {Key} to {Expiration}", key, expiry.Value);
                }

                var serializedValue = JsonSerializer.Serialize(value);
                await _distributedCache.SetStringAsync(key, serializedValue, options);
                _logger.LogDebug("Successfully set value in cache with key {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting value in cache with key {Key}", key);
                // Continue execution even if caching fails
            }
        }

        public async Task RemoveAsync(string key)
        {
            try
            {
                _logger.LogDebug("Removing value from cache with key {Key}", key);
                await _distributedCache.RemoveAsync(key);
                _logger.LogDebug("Successfully removed value from cache with key {Key}", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing value from cache with key {Key}", key);
                // Continue execution even if cache removal fails
            }
        }

        public async Task<bool> ExistsAsync(string key)
        {
            try
            {
                _logger.LogDebug("Checking if key {Key} exists in cache", key);
                var cachedValue = await _distributedCache.GetStringAsync(key);
                bool exists = !string.IsNullOrEmpty(cachedValue);
                _logger.LogDebug("Key {Key} exists in cache: {Exists}", key, exists);
                return exists;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if key {Key} exists in cache", key);
                return false;
            }
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null)
        {
            try
            {
                _logger.LogDebug("Attempting to get or create value for key {Key}", key);

                // Try to get the value from cache first
                try
                {
                    var cachedValue = await _distributedCache.GetStringAsync(key);

                    // If value exists in cache, deserialize and return it
                    if (!string.IsNullOrEmpty(cachedValue))
                    {
                        _logger.LogDebug("Cache hit for key {Key}", key);
                        return JsonSerializer.Deserialize<T>(cachedValue);
                    }

                    _logger.LogDebug("Cache miss for key {Key}", key);
                }
                catch (Exception ex)
                {
                    _logger.LogWarning(ex, "Error retrieving value from cache with key {Key}, falling back to factory", key);
                    // Continue to factory if cache retrieval fails
                }

                // If not in cache or cache retrieval failed, use factory to create new value
                _logger.LogDebug("Calling factory to create value for key {Key}", key);
                var newValue = await factory();
                _logger.LogDebug("Factory created value for key {Key}", key);

                // Store new value in cache if it's not null
                if (newValue != null)
                {
                    try
                    {
                        var options = new DistributedCacheEntryOptions();

                        if (expiry.HasValue)
                        {
                            options.AbsoluteExpirationRelativeToNow = expiry;
                            _logger.LogDebug("Setting expiration for key {Key} to {Expiration}", key, expiry.Value);
                        }

                        var serializedValue = JsonSerializer.Serialize(newValue);
                        await _distributedCache.SetStringAsync(key, serializedValue, options);
                        _logger.LogDebug("Successfully cached value for key {Key}", key);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Error caching value for key {Key}, but value was created successfully", key);
                        // Continue even if caching fails
                    }
                }

                return newValue;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Unhandled error in GetOrCreateAsync for key {Key}", key);
                throw; // Rethrow to be handled by the caller
            }
        }
    }
}