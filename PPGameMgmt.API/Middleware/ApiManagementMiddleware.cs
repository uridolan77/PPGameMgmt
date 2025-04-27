using Microsoft.Extensions.Options;
using PPGameMgmt.API.Models;
using System.Net;
using System.Text.Json;

namespace PPGameMgmt.API.Middleware
{
    /// <summary>
    /// Middleware to handle Azure API Management integration, including subscription key validation
    /// </summary>
    public class ApiManagementMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ApiManagementConfig _apiManagementConfig;
        private readonly ILogger<ApiManagementMiddleware> _logger;

        public ApiManagementMiddleware(
            RequestDelegate next, 
            IOptions<ApiManagementConfig> apiManagementOptions,
            ILogger<ApiManagementMiddleware> logger)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _apiManagementConfig = apiManagementOptions.Value;
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Skip subscription key validation for development environment or if not required
            if (!_apiManagementConfig.RequireSubscriptionKey || context.Request.Path.StartsWithSegments("/swagger") || 
                context.Request.Path.StartsWithSegments("/hubs"))
            {
                await _next(context);
                return;
            }

            bool hasValidSubscriptionKey = ValidateSubscriptionKey(context);

            if (!hasValidSubscriptionKey)
            {
                _logger.LogWarning("API request rejected due to missing or invalid subscription key");
                context.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                context.Response.ContentType = "application/json";
                
                var errorResponse = new 
                {
                    statusCode = (int)HttpStatusCode.Unauthorized,
                    message = "Missing or invalid subscription key."
                };
                
                await context.Response.WriteAsync(JsonSerializer.Serialize(errorResponse));
                return;
            }

            // Add request tracking
            AddRequestTracking(context);

            await _next(context);
        }

        private bool ValidateSubscriptionKey(HttpContext context)
        {
            // Check if subscription key is present in the header or query string
            if (context.Request.Headers.TryGetValue(_apiManagementConfig.SubscriptionKeyHeaderName, out var headerKey))
            {
                // In a production system, you would validate this key against a list of valid keys or
                // pass this validation to Azure API Management itself
                return !string.IsNullOrEmpty(headerKey);
            }

            // Check query string as a fallback
            if (context.Request.Query.TryGetValue("subscription-key", out var queryKey))
            {
                return !string.IsNullOrEmpty(queryKey);
            }

            return false;
        }

        private void AddRequestTracking(HttpContext context)
        {
            // Add correlation ID for request tracking
            string correlationId = context.TraceIdentifier;

            // Add correlation ID to response headers
            context.Response.Headers.Append("X-Correlation-Id", correlationId);

            // If a trace is requested (useful for debugging API Management policies)
            bool enableTrace = context.Request.Headers.ContainsKey(_apiManagementConfig.TraceHeaderName);
            if (enableTrace)
            {
                _logger.LogInformation("API Management trace enabled for request {CorrelationId}", correlationId);
            }
        }
    }

    // Extension method for registering the middleware
    public static class ApiManagementMiddlewareExtensions
    {
        public static IApplicationBuilder UseApiManagement(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<ApiManagementMiddleware>();
        }

        public static IServiceCollection AddApiManagementConfiguration(this IServiceCollection services, 
            IConfiguration configuration)
        {
            services.Configure<ApiManagementConfig>(configuration.GetSection("ApiManagement"));
            return services;
        }
    }
}