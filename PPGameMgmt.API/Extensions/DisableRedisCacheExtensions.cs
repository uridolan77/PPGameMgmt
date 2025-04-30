using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.DependencyInjection;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Services;

namespace PPGameMgmt.API.Extensions
{
    /// <summary>
    /// Extension methods to disable Redis caching and use in-memory caching instead
    /// </summary>
    public static class DisableRedisCacheExtensions
    {
        /// <summary>
        /// Replaces the Redis cache service with an in-memory cache service
        /// </summary>
        public static IServiceCollection DisableRedisCache(this IServiceCollection services)
        {
            // Remove any existing ICacheService registrations
            var descriptor = services.FirstOrDefault(d => d.ServiceType == typeof(ICacheService));
            if (descriptor != null)
            {
                services.Remove(descriptor);
            }

            // Register IMemoryCache if it's not already registered
            services.AddMemoryCache();

            // Register the in-memory cache service
            services.AddSingleton<ICacheService, InMemoryCacheService>();

            return services;
        }
    }
}
