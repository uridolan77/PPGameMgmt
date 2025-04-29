using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PPGameMgmt.Infrastructure.Data.Contexts;
using System;
using PPGameMgmt.Core.Interfaces; // Add missing namespace for ICacheService
using PPGameMgmt.Infrastructure.Services; // Add namespace for RedisCacheService

namespace PPGameMgmt.API.Extensions
{
    /// <summary>
    /// Extension methods for database configuration
    /// </summary>
    public static class DatabaseExtensions
    {
        /// <summary>
        /// Adds database context with support for different database providers
        /// </summary>
        public static IServiceCollection AddDatabase(this IServiceCollection services, IConfiguration configuration)
        {
            var dbProvider = configuration["Database:Provider"]?.ToLowerInvariant() ?? "mysql";
            var connectionString = configuration.GetConnectionString("DefaultConnection");
            
            if (string.IsNullOrEmpty(connectionString))
            {
                // Fallback to provider-specific connection string if default is not specified
                connectionString = configuration.GetConnectionString($"{dbProvider}Connection");
                
                if (string.IsNullOrEmpty(connectionString))
                {
                    throw new InvalidOperationException(
                        $"No connection string found. Please specify either 'ConnectionStrings:DefaultConnection' or 'ConnectionStrings:{dbProvider}Connection'.");
                }
            }
            
            Console.WriteLine($"Using {dbProvider} database with connection string: {connectionString}");
            
            switch (dbProvider)
            {
                case "mysql":
                    services.AddDbContext<CasinoDbContext>(options =>
                        options.UseMySql(
                            connectionString, 
                            ServerVersion.AutoDetect(connectionString),
                            mySqlOptions => mySqlOptions.MigrationsAssembly("PPGameMgmt.Infrastructure")));
                    break;
                    
                case "sqlserver":
                    services.AddDbContext<CasinoDbContext>(options =>
                        options.UseSqlServer(
                            connectionString,
                            sqlServerOptions => sqlServerOptions.MigrationsAssembly("PPGameMgmt.Infrastructure")));
                    break;
                    
                case "inmemory":
                    services.AddDbContext<CasinoDbContext>(options =>
                        options.UseInMemoryDatabase("PPGameMgmtDb"));
                    break;
                    
                default:
                    throw new NotSupportedException($"Database provider '{dbProvider}' is not supported.");
            }
            
            return services;
        }
        
        /// <summary>
        /// Adds caching services with Redis support
        /// </summary>
        public static IServiceCollection AddCachingServices(this IServiceCollection services, IConfiguration configuration)
        {
            var redisConnectionString = configuration.GetConnectionString("Redis");
            
            if (!string.IsNullOrEmpty(redisConnectionString))
            {
                Console.WriteLine($"Using Redis for distributed caching: {redisConnectionString}");
                
                services.AddStackExchangeRedisCache(options =>
                {
                    options.Configuration = redisConnectionString;
                    options.InstanceName = "PPGameMgmt:";
                });
                
                services.AddSignalR()
                    .AddStackExchangeRedis(redisConnectionString, options =>
                    {
                        options.Configuration.ChannelPrefix = "PPGameMgmt:SignalR";
                    });
            }
            else
            {
                // Fallback to in-memory caching
                Console.WriteLine("Redis connection string not found. Using in-memory caching.");
                services.AddDistributedMemoryCache();
                services.AddSignalR();
            }
            
            // Register Redis cache service
            services.AddScoped<ICacheService, RedisCacheService>();
            
            return services;
        }
    }
}