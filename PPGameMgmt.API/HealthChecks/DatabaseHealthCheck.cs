using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.API.HealthChecks
{
    /// <summary>
    /// Health check for the database
    /// </summary>
    public class DatabaseHealthCheck : IHealthCheck
    {
        private readonly CasinoDbContext _dbContext;
        private readonly ILogger<DatabaseHealthCheck> _logger;
        
        public DatabaseHealthCheck(CasinoDbContext dbContext, ILogger<DatabaseHealthCheck> logger)
        {
            _dbContext = dbContext ?? throw new ArgumentNullException(nameof(dbContext));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                // Check if the database is available
                var canConnect = await _dbContext.Database.CanConnectAsync(cancellationToken);
                
                if (canConnect)
                {
                    _logger.LogDebug("Database health check succeeded");
                    return HealthCheckResult.Healthy("Database is healthy");
                }
                else
                {
                    _logger.LogWarning("Database health check failed - cannot connect");
                    return HealthCheckResult.Unhealthy("Database is unhealthy - cannot connect");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Database health check failed");
                return HealthCheckResult.Unhealthy("Database is unhealthy", ex);
            }
        }
    }
}
