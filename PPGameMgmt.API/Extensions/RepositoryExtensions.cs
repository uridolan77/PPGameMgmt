using Microsoft.Extensions.DependencyInjection;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Interfaces.Repositories;
using PPGameMgmt.Infrastructure.Data;
using PPGameMgmt.Infrastructure.Data.Repositories;
using PPGameMgmt.Core.Entities.Bonuses;

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
            // Register standard repositories
            services.AddScoped<IPlayerRepository, PlayerRepository>();
            services.AddScoped<IGameRepository, GameRepository>();
            services.AddScoped<IBonusRepository, BonusRepository>();
            services.AddScoped<IGameSessionRepository, GameSessionRepository>();
            services.AddScoped<IRecommendationRepository, RecommendationRepository>();
            services.AddScoped<IPlayerFeaturesRepository, PlayerFeaturesRepository>();

            // Register BonusClaim repository implementation
            services.AddScoped<Core.Interfaces.Repositories.IBonusClaimRepository, BonusClaimRepository>();

            // Register it as a generic repository too for classes that need IRepository<BonusClaim>
            services.AddScoped<Core.Interfaces.Repositories.IRepository<BonusClaim>>(sp =>
                sp.GetRequiredService<Core.Interfaces.Repositories.IBonusClaimRepository>());

            // Add Unit of Work
            services.AddScoped<IUnitOfWork, UnitOfWork>();

            // Add Transaction Manager
            services.AddScoped<ITransactionManager, TransactionManager>();

            return services;
        }
    }
}