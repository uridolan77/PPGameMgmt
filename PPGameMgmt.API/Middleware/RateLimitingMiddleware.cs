using System.Collections.Concurrent;
using System.Net;
using System.Text.Json;
using Microsoft.Extensions.Options;
using PPGameMgmt.API.Models;

namespace PPGameMgmt.API.Middleware
{
    /// <summary>
    /// Middleware to implement rate limiting for API requests
    /// </summary>
    public class RateLimitingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RateLimitingMiddleware> _logger;
        private readonly RateLimitingConfig _options;
        
        // Thread-safe dictionary to store client request counts
        private static readonly ConcurrentDictionary<string, ClientStatistics> _clientStatistics = new();
        
        public RateLimitingMiddleware(
            RequestDelegate next,
            IOptions<RateLimitingConfig> options,
            ILogger<RateLimitingMiddleware> logger)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        public async Task InvokeAsync(HttpContext context)
        {
            // Skip rate limiting for:
            // 1. If globally disabled
            // 2. Swagger documentation
            // 3. Health checks
            // 4. Paths explicitly exempted in configuration
            if (!_options.EnableRateLimiting ||
                context.Request.Path.StartsWithSegments("/swagger") ||
                context.Request.Path.StartsWithSegments("/health") ||
                IsExemptPath(context.Request.Path))
            {
                await _next(context);
                return;
            }
            
            // Get client identifier (IP address or API key if available)
            string clientId = GetClientIdentifier(context);
            
            // Check if client has exceeded rate limit
            if (IsRateLimitExceeded(clientId))
            {
                _logger.LogWarning("Rate limit exceeded for client: {ClientId}, Path: {Path}", clientId, context.Request.Path);
                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.ContentType = "application/json";
                
                var retryAfterSeconds = GetRetryAfterSeconds(clientId);
                context.Response.Headers.Append("Retry-After", retryAfterSeconds.ToString());
                
                var errorResponse = new
                {
                    statusCode = (int)HttpStatusCode.TooManyRequests,
                    message = "Rate limit exceeded. Please try again later.",
                    retryAfterSeconds = retryAfterSeconds
                };
                
                await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
                return;
            }
            
            // Increment request count for client
            IncrementClientRequestCount(clientId);
            
            // Add rate limit headers
            AddRateLimitHeaders(context, clientId);
            
            await _next(context);
        }
        
        private string GetClientIdentifier(HttpContext context)
        {
            // Try to get API key from header
            if (context.Request.Headers.TryGetValue("Ocp-Apim-Subscription-Key", out var apiKey) && !string.IsNullOrEmpty(apiKey))
            {
                return $"api-key:{apiKey}";
            }
            
            // Fall back to IP address
            return $"ip:{context.Connection.RemoteIpAddress}";
        }
        
        private bool IsRateLimitExceeded(string clientId)
        {
            var clientStats = _clientStatistics.GetOrAdd(clientId, _ => new ClientStatistics());
            
            // Clean up old request timestamps
            CleanupOldRequests(clientStats);
            
            // Check if client has exceeded rate limit
            return clientStats.RequestTimestamps.Count >= _options.RequestsPerMinute;
        }
        
        private void IncrementClientRequestCount(string clientId)
        {
            var clientStats = _clientStatistics.GetOrAdd(clientId, _ => new ClientStatistics());
            clientStats.RequestTimestamps.Add(DateTime.UtcNow);
        }
        
        private void CleanupOldRequests(ClientStatistics clientStats)
        {
            var threshold = DateTime.UtcNow.AddMinutes(-1);
            clientStats.RequestTimestamps.RemoveAll(timestamp => timestamp < threshold);
        }
        
        private int GetRetryAfterSeconds(string clientId)
        {
            if (_clientStatistics.TryGetValue(clientId, out var clientStats) && clientStats.RequestTimestamps.Count > 0)
            {
                var oldestTimestamp = clientStats.RequestTimestamps.Min();
                var resetTime = oldestTimestamp.AddMinutes(1);
                var secondsToWait = Math.Max(1, (int)(resetTime - DateTime.UtcNow).TotalSeconds);
                return secondsToWait;
            }
            
            return 60; // Default to 60 seconds if no data available
        }
        
        private void AddRateLimitHeaders(HttpContext context, string clientId)
        {
            if (_clientStatistics.TryGetValue(clientId, out var clientStats))
            {
                var requestsRemaining = Math.Max(0, _options.RequestsPerMinute - clientStats.RequestTimestamps.Count);
                
                context.Response.Headers.Append("X-RateLimit-Limit", _options.RequestsPerMinute.ToString());
                context.Response.Headers.Append("X-RateLimit-Remaining", requestsRemaining.ToString());
                
                if (clientStats.RequestTimestamps.Count > 0)
                {
                    var oldestTimestamp = clientStats.RequestTimestamps.Min();
                    var resetTime = oldestTimestamp.AddMinutes(1);
                    var resetTimestamp = ((DateTimeOffset)resetTime).ToUnixTimeSeconds();
                    context.Response.Headers.Append("X-RateLimit-Reset", resetTimestamp.ToString());
                }
            }
        }
        
        private bool IsExemptPath(PathString path)
        {
            if (_options.ExemptPaths == null || _options.ExemptPaths.Count == 0)
            {
                return false;
            }
            
            // Check if the current path matches any of the exempt paths
            foreach (var exemptPath in _options.ExemptPaths)
            {
                if (path.StartsWithSegments(exemptPath, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogDebug("Path {Path} is exempt from rate limiting", path);
                    return true;
                }
            }
            
            return false;
        }
        
        /// <summary>
        /// Class to store client request statistics
        /// </summary>
        private class ClientStatistics
        {
            public List<DateTime> RequestTimestamps { get; } = new List<DateTime>();
        }
    }
    
    // Extension method for registering the middleware
    public static class RateLimitingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRateLimiting(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RateLimitingMiddleware>();
        }
        
        public static IServiceCollection AddRateLimitingConfiguration(this IServiceCollection services,
            IConfiguration configuration)
        {
            services.Configure<RateLimitingConfig>(configuration.GetSection("RateLimiting"));
            return services;
        }
    }
}
