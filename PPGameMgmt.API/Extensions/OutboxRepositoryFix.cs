using Microsoft.Extensions.DependencyInjection;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Interfaces.Repositories;
using PPGameMgmt.Infrastructure.Data.Repositories;

namespace PPGameMgmt.API.Extensions
{
    /// <summary>
    /// Extension methods to fix the OutboxRepository registration
    /// </summary>
    public static class OutboxRepositoryFix
    {
        /// <summary>
        /// Registers the OutboxRepository with both interfaces
        /// </summary>
        public static IServiceCollection RegisterOutboxRepository(this IServiceCollection services)
        {
            // Register with the new namespace
            services.AddScoped<PPGameMgmt.Core.Interfaces.Repositories.IOutboxRepository, OutboxRepository>();

            // Register the adapter for the old interface
            services.AddScoped<PPGameMgmt.Core.Interfaces.IOutboxRepository, OutboxRepositoryAdapter>();

            return services;
        }
    }
}
