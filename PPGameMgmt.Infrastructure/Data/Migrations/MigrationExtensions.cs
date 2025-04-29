using System;
using System.Linq;
using System.Reflection;
using Microsoft.Extensions.DependencyInjection;
using PPGameMgmt.Infrastructure.Data.Migrations.Implementations;

namespace PPGameMgmt.Infrastructure.Data.Migrations
{
    /// <summary>
    /// Extension methods for configuring migrations in the DI container
    /// </summary>
    public static class MigrationExtensions
    {
        /// <summary>
        /// Adds database migration services to the service collection
        /// </summary>
        /// <param name="services">The service collection to add migrations to</param>
        /// <returns>The service collection for method chaining</returns>
        public static IServiceCollection AddDatabaseMigrations(this IServiceCollection services)
        {
            // Register all migrations
            RegisterAllMigrations(services);
            
            // Register the migration runner
            services.AddScoped<MigrationRunner>();
            
            return services;
        }

        /// <summary>
        /// Registers all migration implementations from the assembly
        /// </summary>
        /// <param name="services">The service collection to add migrations to</param>
        private static void RegisterAllMigrations(IServiceCollection services)
        {
            // Find all migration classes in the assembly
            var migrationTypes = typeof(CreateOutboxTableMigration).Assembly
                .GetTypes()
                .Where(t => !t.IsAbstract && typeof(IMigration).IsAssignableFrom(t))
                .ToList();
            
            // Register each migration type both as its concrete type and as IMigration
            foreach (var migrationType in migrationTypes)
            {
                services.AddScoped(migrationType);
                services.AddScoped(sp => (IMigration)sp.GetRequiredService(migrationType));
            }
        }
    }
}