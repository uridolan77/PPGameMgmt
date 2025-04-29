using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Migrations
{
    /// <summary>
    /// Service responsible for running database migrations
    /// </summary>
    public class MigrationRunner
    {
        private readonly CasinoDbContext _dbContext;
        private readonly IEnumerable<IMigration> _migrations;
        private readonly ILogger<MigrationRunner>? _logger;

        public MigrationRunner(CasinoDbContext dbContext, IEnumerable<IMigration> migrations, ILogger<MigrationRunner>? logger = null)
        {
            _dbContext = dbContext;
            _migrations = migrations;
            _logger = logger;
        }

        /// <summary>
        /// Ensures the migration history table exists in the database
        /// </summary>
        private async Task EnsureMigrationTableExistsAsync()
        {
            _logger?.LogInformation("Ensuring migration history table exists");
            
            // Check if the database exists, if not, create it
            await _dbContext.Database.EnsureCreatedAsync();
            
            // Create migration history table if it doesn't exist
            if (!(await _dbContext.Database.GetPendingMigrationsAsync()).Any())
            {
                var sql = @"
                    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='MigrationHistory' and xtype='U')
                    CREATE TABLE MigrationHistory (
                        Id NVARCHAR(255) PRIMARY KEY,
                        Description NVARCHAR(MAX) NOT NULL,
                        AppliedAt DATETIME2 NOT NULL
                    )";
                
                await _dbContext.Database.ExecuteSqlRawAsync(sql);
            }
            
            _logger?.LogInformation("Migration history table exists or was created");
        }

        /// <summary>
        /// Gets the IDs of migrations that have already been applied
        /// </summary>
        private async Task<List<string>> GetAppliedMigrationIdsAsync()
        {
            _logger?.LogInformation("Retrieving applied migration IDs");
            
            return await _dbContext.Set<MigrationHistory>()
                .Select(m => m.Id)
                .ToListAsync();
        }

        /// <summary>
        /// Gets migrations that need to be applied to the database
        /// </summary>
        public async Task<List<IMigration>> GetPendingMigrationsAsync()
        {
            await EnsureMigrationTableExistsAsync();
            
            var appliedMigrationIds = await GetAppliedMigrationIdsAsync();
            
            var pendingMigrations = _migrations
                .Where(m => !appliedMigrationIds.Contains(m.Id))
                .OrderBy(m => m.CreatedAt)
                .ToList();
            
            _logger?.LogInformation("{Count} pending migrations found", pendingMigrations.Count);
            
            return pendingMigrations;
        }

        /// <summary>
        /// Applies all pending migrations to the database
        /// </summary>
        public async Task ApplyPendingMigrationsAsync()
        {
            var pendingMigrations = await GetPendingMigrationsAsync();
            
            if (!pendingMigrations.Any())
            {
                _logger?.LogInformation("No pending migrations to apply");
                return;
            }
            
            _logger?.LogInformation("Applying {Count} migrations", pendingMigrations.Count);
            
            foreach (var migration in pendingMigrations)
            {
                try
                {
                    _logger?.LogInformation("Applying migration: {MigrationId} - {Description}", 
                        migration.Id, migration.Description);
                    
                    // Apply the migration
                    await migration.ApplyAsync();
                    
                    // Record the migration as applied
                    _dbContext.Set<MigrationHistory>().Add(new MigrationHistory
                    {
                        Id = migration.Id,
                        Description = migration.Description,
                        AppliedAt = DateTime.UtcNow
                    });
                    
                    await _dbContext.SaveChangesAsync();
                    
                    _logger?.LogInformation("Successfully applied migration: {MigrationId}", migration.Id);
                }
                catch (Exception ex)
                {
                    _logger?.LogError(ex, "Error applying migration: {MigrationId}", migration.Id);
                    throw;
                }
            }
            
            _logger?.LogInformation("Successfully applied all pending migrations");
        }

        /// <summary>
        /// Reverts the last applied migration
        /// </summary>
        public async Task RevertLastMigrationAsync()
        {
            await EnsureMigrationTableExistsAsync();
            
            // Get the last applied migration from the database
            var lastAppliedMigration = await _dbContext.Set<MigrationHistory>()
                .OrderByDescending(m => m.AppliedAt)
                .FirstOrDefaultAsync();
            
            if (lastAppliedMigration == null)
            {
                _logger?.LogInformation("No migrations to revert");
                return;
            }
            
            // Find the corresponding migration object
            var migration = _migrations.FirstOrDefault(m => m.Id == lastAppliedMigration.Id);
            
            if (migration == null)
            {
                _logger?.LogError("Migration with ID {MigrationId} not found in registered migrations", lastAppliedMigration.Id);
                throw new InvalidOperationException($"Migration with ID {lastAppliedMigration.Id} not found");
            }
            
            try
            {
                _logger?.LogInformation("Reverting migration: {MigrationId} - {Description}", 
                    migration.Id, migration.Description);
                
                // Revert the migration
                await migration.RevertAsync();
                
                // Remove the migration from history
                _dbContext.Set<MigrationHistory>().Remove(lastAppliedMigration);
                await _dbContext.SaveChangesAsync();
                
                _logger?.LogInformation("Successfully reverted migration: {MigrationId}", migration.Id);
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error reverting migration: {MigrationId}", migration.Id);
                throw;
            }
        }
    }
}