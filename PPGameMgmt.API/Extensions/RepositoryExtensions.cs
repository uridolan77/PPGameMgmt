using Microsoft.Extensions.DependencyInjection;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Interfaces.Repositories;
using PPGameMgmt.Infrastructure.Data;
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
            // Register standard repositories
            services.AddScoped<IPlayerRepository, PlayerRepository>();
            services.AddScoped<IGameRepository, GameRepository>();
            services.AddScoped<IBonusRepository, BonusRepository>();
            services.AddScoped<IGameSessionRepository, GameSessionRepository>();
            services.AddScoped<IRecommendationRepository, RecommendationRepository>();
            services.AddScoped<IPlayerFeaturesRepository, PlayerFeaturesRepository>();

            // Register BonusClaim repository implementation with fully qualified name
            services.AddScoped<PPGameMgmt.Core.Interfaces.Repositories.IBonusClaimRepository, BonusClaimRepository>();

            // Register it as a generic repository too for classes that need IRepository<BonusClaim>
            // Use fully qualified name for the repository interface
            services.AddScoped<PPGameMgmt.Core.Interfaces.Repositories.IRepository<Core.Entities.Bonuses.BonusClaim>>(sp =>
                sp.GetRequiredService<PPGameMgmt.Core.Interfaces.Repositories.IBonusClaimRepository>());

            // Add Unit of Work - ensure it's properly scoped
            services.AddScoped<IUnitOfWork, UnitOfWork>();
            
            // Add Transaction Manager - ensure it's properly scoped
            services.AddScoped<ITransactionManager, TransactionManager>();

            // Register additional repositories
            services.AddScoped<IUserRepository, UserRepository>();

            return services;
        }
    }
}