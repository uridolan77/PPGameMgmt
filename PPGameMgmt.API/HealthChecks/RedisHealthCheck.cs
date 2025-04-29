using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using StackExchange.Redis;

namespace PPGameMgmt.API.HealthChecks
{
    /// <summary>
    /// Health check for Redis
    /// </summary>
    public class RedisHealthCheck : IHealthCheck
    {
        private readonly string _redisConnectionString;
        private readonly ILogger<RedisHealthCheck> _logger;
        
        public RedisHealthCheck(IConfiguration configuration, ILogger<RedisHealthCheck> logger)
        {
            _redisConnectionString = configuration.GetConnectionString("Redis") ?? 
                throw new ArgumentNullException("Redis connection string is not configured");
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                var options = ConfigurationOptions.Parse(_redisConnectionString);
                options.AbortOnConnectFail = false;
                
                using var connection = await ConnectionMultiplexer.ConnectAsync(options, cancellationToken);
                var db = connection.GetDatabase();
                
                // Ping Redis to check if it's responsive
                var pingResult = await db.PingAsync();
                
                _logger.LogDebug("Redis health check ping result: {PingResult}ms", pingResult.TotalMilliseconds);
                
                return HealthCheckResult.Healthy($"Redis is healthy. Ping response time: {pingResult.TotalMilliseconds}ms");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Redis health check failed");
                return HealthCheckResult.Unhealthy("Redis is unhealthy", ex);
            }
        }
    }
}
