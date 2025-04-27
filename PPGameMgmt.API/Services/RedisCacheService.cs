using Microsoft.Extensions.Caching.Distributed;
using PPGameMgmt.Core.Interfaces;
using System;
using System.Text.Json;
using System.Threading.Tasks;

namespace PPGameMgmt.API.Services
{
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _distributedCache;
        private readonly ILogger<RedisCacheService> _logger;

        public RedisCacheService(
            IDistributedCache distributedCache,
            ILogger<RedisCacheService> logger)
        {
            _distributedCache = distributedCache;
            _logger = logger;
        }

        public async Task<T?> GetAsync<T>(string key) where T : class
        {
            try
            {
                var cachedData = await _distributedCache.GetStringAsync(key);
                
                if (string.IsNullOrEmpty(cachedData))
                {
                    return null;
                }

                return JsonSerializer.Deserialize<T>(cachedData);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving item from cache with key {Key}", key);
                return null;
            }
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? absoluteExpiration = null) where T : class
        {
            try
            {
                var options = new DistributedCacheEntryOptions();
                
                if (absoluteExpiration.HasValue)
                {
                    options.SetAbsoluteExpiration(absoluteExpiration.Value);
                }
                else
                {
                    // Default expiration of 1 hour if not specified
                    options.SetAbsoluteExpiration(TimeSpan.FromHours(1));
                }
                
                var jsonData = JsonSerializer.Serialize(value);
                await _distributedCache.SetStringAsync(key, jsonData, options);
                _logger.LogDebug("Item with key {Key} added to cache with expiration {Expiration}", 
                    key, absoluteExpiration ?? TimeSpan.FromHours(1));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error setting item in cache with key {Key}", key);
            }
        }

        public async Task RemoveAsync(string key)
        {
            try
            {
                await _distributedCache.RemoveAsync(key);
                _logger.LogDebug("Item with key {Key} removed from cache", key);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error removing item from cache with key {Key}", key);
            }
        }

        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? absoluteExpiration = null) where T : class
        {
            var cachedItem = await GetAsync<T>(key);
            
            if (cachedItem != null)
            {
                _logger.LogDebug("Cache hit for key {Key}", key);
                return cachedItem;
            }
            
            _logger.LogDebug("Cache miss for key {Key}, creating new entry", key);
            var newItem = await factory();
            await SetAsync(key, newItem, absoluteExpiration);
            return newItem;
        }
    }
}