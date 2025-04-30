using System.Diagnostics;

namespace PPGameMgmt.API.Middleware
{
    /// <summary>
    /// Middleware to measure request execution time and add it to the response context
    /// </summary>
    public class RequestExecutionTimeMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<RequestExecutionTimeMiddleware> _logger;

        public RequestExecutionTimeMiddleware(RequestDelegate next, ILogger<RequestExecutionTimeMiddleware> logger)
        {
            _next = next ?? throw new ArgumentNullException(nameof(next));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task InvokeAsync(HttpContext context)
        {
            // Start timing the request
            var stopwatch = Stopwatch.StartNew();

            // Store the stopwatch in HttpContext.Items so it can be accessed by other components
            context.Items["RequestStopwatch"] = stopwatch;

            // Add a callback to add the header when the response starts
            context.Response.OnStarting(() =>
            {
                // Get the current elapsed time
                var executionTime = stopwatch.ElapsedMilliseconds;

                // Add execution time to response headers - this is safe because the response hasn't started yet
                context.Response.Headers["X-Execution-Time-Ms"] = executionTime.ToString();

                return Task.CompletedTask;
            });

            try
            {
                // Call the next middleware in the pipeline
                await _next(context);
            }
            finally
            {
                // Stop timing
                stopwatch.Stop();

                // Log the execution time
                _logger.LogDebug("Request execution time: {ExecutionTimeMs}ms for {RequestPath}",
                    stopwatch.ElapsedMilliseconds, context.Request.Path);
            }
        }
    }

    // Extension method for registering the middleware
    public static class RequestExecutionTimeMiddlewareExtensions
    {
        public static IApplicationBuilder UseRequestExecutionTime(this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<RequestExecutionTimeMiddleware>();
        }
    }
}
