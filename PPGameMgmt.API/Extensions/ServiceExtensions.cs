using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Services;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Services;
using PPGameMgmt.Infrastructure.ML.Features;
using PPGameMgmt.Infrastructure.ML.Models;
using PPGameMgmt.Infrastructure.Services;
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
            services.AddScoped<IPlayerService, PlayerService>();
            services.AddScoped<IGameService, GameService>();
            
            // Register our custom implementations with fully qualified names
            services.AddScoped<IBonusService, PPGameMgmt.Infrastructure.Services.BonusService>();
            services.AddScoped<IRecommendationService, PPGameMgmt.Infrastructure.Services.RecommendationService>();
            services.AddScoped<IBonusOptimizationService, PPGameMgmt.Infrastructure.Services.BonusOptimizationService>();
            
            return services;
        }
        
        /// <summary>
        /// Adds all cached service decorators to the service collection
        /// </summary>
        public static IServiceCollection AddCachedServices(this IServiceCollection services)
        {
            // Register cached service decorators
            // Note: We're using the Scrutor library's Decorate method which should be working
            services.AddScoped<CachedPlayerService>();
            services.AddScoped<CachedGameService>();
            services.AddScoped<CachedBonusService>();
            services.AddScoped<CachedRecommendationService>();
            
            services.Decorate<IPlayerService, CachedPlayerService>();
            services.Decorate<IGameService, CachedGameService>();
            services.Decorate<IBonusService, CachedBonusService>();
            services.Decorate<IRecommendationService, CachedRecommendationService>();
            
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