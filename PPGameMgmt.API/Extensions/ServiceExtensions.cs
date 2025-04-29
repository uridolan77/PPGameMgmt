using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Services;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Services;
using PPGameMgmt.Infrastructure.ML.Features;
using PPGameMgmt.Infrastructure.ML.Models;
using System.Reflection;

namespace PPGameMgmt.API.Extensions
{
    /// <summary>
    /// Extension methods for registering service dependencies
    /// </summary>
    public static class ServiceExtensions
    {
        /// <summary>
        /// Adds all core services to the service collection
        /// </summary>
        public static IServiceCollection AddCoreServices(this IServiceCollection services)
        {
            // Register core services
            services.AddScoped<PlayerService>();
            services.AddScoped<GameService>();
            services.AddScoped<BonusService>();
            services.AddScoped<RecommendationService>();
            services.AddScoped<IBonusOptimizationService, BonusOptimizationService>();
            
            return services;
        }
        
        /// <summary>
        /// Adds all cached service decorators to the service collection
        /// </summary>
        public static IServiceCollection AddCachedServices(this IServiceCollection services)
        {
            // Register cached service decorators
            services.AddScoped<IPlayerService>(provider =>
                new CachedPlayerService(
                    provider.GetRequiredService<PlayerService>(),
                    provider.GetRequiredService<ICacheService>(),
                    provider.GetRequiredService<ILogger<CachedPlayerService>>()));

            services.AddScoped<IGameService>(provider =>
                new CachedGameService(
                    provider.GetRequiredService<GameService>(),
                    provider.GetRequiredService<ICacheService>(),
                    provider.GetRequiredService<ILogger<CachedGameService>>()));

            services.AddScoped<IBonusService>(provider =>
                new CachedBonusService(
                    provider.GetRequiredService<BonusService>(),
                    provider.GetRequiredService<ICacheService>(),
                    provider.GetRequiredService<ILogger<CachedBonusService>>()));

            services.AddScoped<IRecommendationService>(provider =>
                new CachedRecommendationService(
                    provider.GetRequiredService<RecommendationService>(),
                    provider.GetRequiredService<ICacheService>(),
                    provider.GetRequiredService<ILogger<CachedRecommendationService>>()));
            
            return services;
        }
        
        /// <summary>
        /// Adds all ML-related services to the service collection
        /// </summary>
        public static IServiceCollection AddMLServices(this IServiceCollection services)
        {
            // Register ML components
            services.AddSingleton<BackgroundFeatureProcessor>();
            services.AddHostedService(sp => sp.GetRequiredService<BackgroundFeatureProcessor>());
            services.AddScoped<IFeatureEngineeringService, FeatureEngineeringService>();
            services.AddScoped<GameRecommendationModel>();
            services.AddScoped<BonusOptimizationModel>();
            services.AddScoped<IMLModelService, MLModelService>();
            services.AddSingleton<IMLOpsService, MLOpsService>();
            
            return services;
        }
        
        /// <summary>
        /// Adds AutoMapper configuration to the service collection
        /// </summary>
        public static IServiceCollection AddAutoMapperServices(this IServiceCollection services)
        {
            services.AddAutoMapper(Assembly.GetExecutingAssembly());
            return services;
        }
    }
}