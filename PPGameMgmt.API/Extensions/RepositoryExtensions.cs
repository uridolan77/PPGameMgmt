using Microsoft.Extensions.DependencyInjection;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Data.Repositories;

namespace PPGameMgmt.API.Extensions
{
    /// <summary>
    /// Extension methods for registering repository dependencies
    /// </summary>
    public static class RepositoryExtensions
    {
        /// <summary>
        /// Adds all repositories to the service collection
        /// </summary>
        public static IServiceCollection AddRepositories(this IServiceCollection services)
        {
            services.AddScoped<IPlayerRepository, PlayerRepository>();
            services.AddScoped<IGameRepository, GameRepository>();
            services.AddScoped<IBonusRepository, BonusRepository>();
            services.AddScoped<IGameSessionRepository, GameSessionRepository>();
            services.AddScoped<IRecommendationRepository, RecommendationRepository>();
            services.AddScoped<IBonusClaimRepository, BonusClaimRepository>();
            services.AddScoped<IPlayerFeaturesRepository, PlayerFeaturesRepository>();
            
            // Add Unit of Work
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            
            return services;
        }
    }
}