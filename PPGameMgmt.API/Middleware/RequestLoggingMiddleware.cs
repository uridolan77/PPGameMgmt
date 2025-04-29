using System.Diagnostics;
using System.Security.Claims;

namespace PPGameMgmt.API.Middleware
{
    /// <summary>
    /// Middleware to enrich logs with request information
    /// </summary>
    public class RequestLoggingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestLoggingMiddleware> _logger;
        
        public RequestLoggingMiddleware(RequestDelegate next, ILogger<RequestLoggingMiddleware> logger)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }
        
        public async Task InvokeAsync(HttpContext context)
        {
            // Start timing the request
            var stopwatch = Stopwatch.StartNew();
            
            // Capture the request path and method
            var requestPath = context.Request.Path;
            var requestMethod = context.Request.Method;
            var correlationId = context.TraceIdentifier;
            
            // Add correlation ID to response headers
            context.Response.OnStarting(() =>
            {
                context.Response.Headers.Append("X-Correlation-Id", correlationId);
                return Task.CompletedTask;
            });
            
            // Enrich the logging context with request information
            using (_logger.BeginScope(new Dictionary<string, object>
            {
                ["CorrelationId"] = correlationId,
                ["RequestPath"] = requestPath,
                ["RequestMethod"] = requestMethod,
                ["RemoteIpAddress"] = context.Connection.RemoteIpAddress?.ToString(),
                ["UserAgent"] = context.Request.Headers.UserAgent.ToString(),
                ["UserId"] = GetUserId(context)
            }))
            {
                try
                {
                    _logger.LogDebug("Request started {RequestMethod} {RequestPath}", requestMethod, requestPath);
                    
                    // Call the next middleware in the pipeline
                    await _next(context);
                    
                    stopwatch.Stop();
                    
                    // Log the response
                    _logger.LogInformation(
                        "Request completed {RequestMethod} {RequestPath} {StatusCode} in {ElapsedMilliseconds}ms",
                        requestMethod,
                        requestPath,
                        context.Response.StatusCode,
                        stopwatch.ElapsedMilliseconds);
                }
                catch (Exception)
                {
                    // Don't handle the exception here, let the global exception middleware handle it
                    stopwatch.Stop();
                    _logger.LogInformation(
                        "Request failed {RequestMethod} {RequestPath} in {ElapsedMilliseconds}ms",
                        requestMethod,
                        requestPath,
                        stopwatch.ElapsedMilliseconds);
                    throw;
                }
            }
        }
        
        private static string GetUserId(HttpContext context)
        {
            // Try to get user ID from claims
            var userIdClaim = context.User?.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim != null)
            {
                return userIdClaim.Value;
            }
            
            // Try to get from custom header
            if (context.Request.Headers.TryGetValue("X-User-Id", out var userId) && !string.IsNullOrEmpty(userId))
            {
                return userId;
            }
            
            return "anonymous";
        }
    }
    
    // Extension method for registering the middleware
    public static class RequestLoggingMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestLogging(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestLoggingMiddleware>();
        }
    }
}
