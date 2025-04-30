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
            _logger.LogInformation("ApiManagementMiddleware processing request for path: {Path}", context.Request.Path);
            _logger.LogInformation("RequireSubscriptionKey setting: {RequireSubscriptionKey}", _apiManagementConfig.RequireSubscriptionKey);

            // Skip subscription key validation for:
            // 1. If globally disabled
            // 2. Swagger documentation
            // 3. SignalR hubs
            // 4. Paths explicitly exempted in configuration
            if (!_apiManagementConfig.RequireSubscriptionKey)
            {
                _logger.LogInformation("Subscription key validation is globally disabled");
                await _next(context);
                return;
            }

            if (context.Request.Path.StartsWithSegments("/swagger"))
            {
                _logger.LogInformation("Skipping subscription key validation for Swagger path");
                await _next(context);
                return;
            }

            if (context.Request.Path.StartsWithSegments("/hubs"))
            {
                _logger.LogInformation("Skipping subscription key validation for SignalR hub path");
                await _next(context);
                return;
            }

            if (IsExemptPath(context.Request.Path))
            {
                _logger.LogInformation("Skipping subscription key validation for exempt path: {Path}", context.Request.Path);
                await _next(context);
                return;
            }

            _logger.LogInformation("Validating subscription key for path: {Path}", context.Request.Path);
            bool hasValidSubscriptionKey = ValidateSubscriptionKey(context);

            if (!hasValidSubscriptionKey)
            {
                _logger.LogWarning("API request rejected due to missing or invalid subscription key: {Path}", context.Request.Path);
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

            _logger.LogInformation("Subscription key validation passed for path: {Path}", context.Request.Path);

            // Add request tracking
            AddRequestTracking(context);

            await _next(context);
        }

        private bool ValidateSubscriptionKey(HttpContext context)
        {
            _logger.LogInformation("Validating subscription key for request");
            _logger.LogInformation("Subscription key header name: {SubscriptionKeyHeaderName}", _apiManagementConfig.SubscriptionKeyHeaderName);

            // Check if subscription key is present in the header or query string
            if (context.Request.Headers.TryGetValue(_apiManagementConfig.SubscriptionKeyHeaderName, out var headerKey))
            {
                _logger.LogInformation("Found subscription key in header: {HeaderKey}", headerKey);

                // In a production system, you would validate this key against a list of valid keys or
                // pass this validation to Azure API Management itself
                bool isValid = !string.IsNullOrEmpty(headerKey);
                _logger.LogInformation("Header key is valid: {IsValid}", isValid);
                return isValid;
            }

            _logger.LogInformation("No subscription key found in header, checking query string");

            // Check query string as a fallback
            if (context.Request.Query.TryGetValue("subscription-key", out var queryKey))
            {
                _logger.LogInformation("Found subscription key in query string: {QueryKey}", queryKey);
                bool isValid = !string.IsNullOrEmpty(queryKey);
                _logger.LogInformation("Query key is valid: {IsValid}", isValid);
                return isValid;
            }

            _logger.LogInformation("No subscription key found in query string");
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

        private bool IsExemptPath(PathString path)
        {
            _logger.LogInformation("Checking if path {Path} is exempt from subscription key requirement", path);

            if (_apiManagementConfig.ExemptPaths == null || _apiManagementConfig.ExemptPaths.Count == 0)
            {
                _logger.LogInformation("No exempt paths configured");
                return false;
            }

            _logger.LogInformation("Exempt paths: {ExemptPaths}", string.Join(", ", _apiManagementConfig.ExemptPaths));

            // Check if the current path matches any of the exempt paths
            foreach (var exemptPath in _apiManagementConfig.ExemptPaths)
            {
                _logger.LogInformation("Checking if path {Path} starts with exempt path {ExemptPath}", path, exemptPath);

                if (path.StartsWithSegments(exemptPath, StringComparison.OrdinalIgnoreCase))
                {
                    _logger.LogInformation("Path {Path} is exempt from subscription key requirement", path);
                    return true;
                }
            }

            _logger.LogInformation("Path {Path} is not exempt from subscription key requirement", path);
            return false;
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