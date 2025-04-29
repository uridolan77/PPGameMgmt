using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.HealthChecks
{
    /// <summary>
    /// Health check for ML models
    /// </summary>
    public class MLModelHealthCheck : IHealthCheck
    {
        private readonly IMLModelService _mlModelService;
        private readonly ILogger<MLModelHealthCheck> _logger;
        
        public MLModelHealthCheck(IMLModelService mlModelService, ILogger<MLModelHealthCheck> logger)
        {
            _mlModelService = mlModelService ?? throw new ArgumentNullException(nameof(mlModelService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
        {
            try
            {
                // Check if ML models are ready
                var modelsReady = await _mlModelService.AreModelsReadyAsync();
                
                if (modelsReady)
                {
                    var lastUpdateTime = await _mlModelService.GetLastModelUpdateTimeAsync();
                    var daysSinceUpdate = (DateTime.UtcNow - lastUpdateTime).TotalDays;
                    
                    // If models haven't been updated in more than 30 days, report as degraded
                    if (daysSinceUpdate > 30)
                    {
                        _logger.LogWarning("ML models health check degraded - models are older than 30 days");
                        return HealthCheckResult.Degraded($"ML models are ready but haven't been updated in {daysSinceUpdate:F1} days");
                    }
                    
                    _logger.LogDebug("ML models health check succeeded");
                    return HealthCheckResult.Healthy($"ML models are ready. Last update: {lastUpdateTime}");
                }
                else
                {
                    _logger.LogWarning("ML models health check failed - models are not ready");
                    return HealthCheckResult.Unhealthy("ML models are not ready");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "ML models health check failed");
                return HealthCheckResult.Unhealthy("ML models health check failed", ex);
            }
        }
    }
}
