using System;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Caching.Distributed;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Infrastructure.Services
{
    /// <summary>
    /// Redis implementation of cache service
    /// </summary>
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _distributedCache;

        public RedisCacheService(IDistributedCache distributedCache)
        {
            _distributedCache = distributedCache ?? throw new ArgumentNullException(nameof(distributedCache));
        }

        public async Task<T> GetAsync<T>(string key)
        {
            var cachedValue = await _distributedCache.GetStringAsync(key);
            
            if (string.IsNullOrEmpty(cachedValue))
            {
                return default;
            }
            
            return JsonSerializer.Deserialize<T>(cachedValue);
        }

        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null)
        {
            var options = new DistributedCacheEntryOptions();
            
            if (expiry.HasValue)
            {
                options.AbsoluteExpirationRelativeToNow = expiry;
            }
            
            var serializedValue = JsonSerializer.Serialize(value);
            await _distributedCache.SetStringAsync(key, serializedValue, options);
        }

        public async Task RemoveAsync(string key)
        {
            await _distributedCache.RemoveAsync(key);
        }

        public async Task<bool> ExistsAsync(string key)
        {
            var cachedValue = await _distributedCache.GetStringAsync(key);
            return !string.IsNullOrEmpty(cachedValue);
        }
        
        public async Task<T> GetOrCreateAsync<T>(string key, Func<Task<T>> factory, TimeSpan? expiry = null)
        {
            // Try to get the value from cache first
            var cachedValue = await _distributedCache.GetStringAsync(key);
            
            // If value exists in cache, deserialize and return it
            if (!string.IsNullOrEmpty(cachedValue))
            {
                return JsonSerializer.Deserialize<T>(cachedValue);
            }
            
            // If not in cache, use factory to create new value
            var newValue = await factory();
            
            // Store new value in cache if it's not null
            if (newValue != null)
            {
                var options = new DistributedCacheEntryOptions();
                
                if (expiry.HasValue)
                {
                    options.AbsoluteExpirationRelativeToNow = expiry;
                }
                
                var serializedValue = JsonSerializer.Serialize(newValue);
                await _distributedCache.SetStringAsync(key, serializedValue, options);
            }
            
            return newValue;
        }
    }
}