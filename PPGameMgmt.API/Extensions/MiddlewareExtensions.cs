using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using PPGameMgmt.API.HealthChecks;
using PPGameMgmt.API.Hubs;
using PPGameMgmt.API.Middleware;

namespace PPGameMgmt.API.Extensions
{
    /// <summary>
    /// Extension methods for configuring the application's middleware pipeline
    /// </summary>
    public static class MiddlewareExtensions
    {
        /// <summary>
        /// Configures the application pipeline with standard middleware
        /// </summary>
        public static WebApplication ConfigureMiddleware(this WebApplication app, IConfiguration configuration)
        {
            // Configure environment-specific middleware
            if (app.Environment.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
                app.UseSwagger();
                app.UseSwaggerUI(options =>
                {
                    options.SwaggerEndpoint("/swagger/v1/swagger.json", "PPGameMgmt API v1");
                    options.SwaggerEndpoint("/swagger/v2/swagger.json", "PPGameMgmt API v2");
                });
            }
            else
            {
                app.UseHsts();
            }

            // Global middleware pipeline
            app.UseRequestExecutionTime(); // Add this first to accurately measure full request time
            app.UseGlobalExceptionHandling();
            app.UseRequestLogging();
            app.UseApiManagement();
            app.UseRateLimiting();

            app.UseHttpsRedirection();
            app.UseResponseCaching();
            app.UseCors("AllowFrontend");
            app.UseAuthorization();

            return app;
        }

        /// <summary>
        /// Configures health check endpoints
        /// </summary>
        public static WebApplication ConfigureHealthChecks(this WebApplication app)
        {
            // Main health check endpoint
            app.MapHealthChecks("/health", new HealthCheckOptions
            {
                ResponseWriter = HealthCheckResponseWriter.WriteResponse,
                AllowCachingResponses = false
            });

            // Individual component health check endpoints
            app.MapHealthChecks("/health/database", new HealthCheckOptions
            {
                ResponseWriter = HealthCheckResponseWriter.WriteResponse,
                Predicate = healthCheck => healthCheck.Tags.Contains("database"),
                AllowCachingResponses = false
            });

            app.MapHealthChecks("/health/redis", new HealthCheckOptions
            {
                ResponseWriter = HealthCheckResponseWriter.WriteResponse,
                Predicate = healthCheck => healthCheck.Tags.Contains("redis"),
                AllowCachingResponses = false
            });

            app.MapHealthChecks("/health/ml", new HealthCheckOptions
            {
                ResponseWriter = HealthCheckResponseWriter.WriteResponse,
                Predicate = healthCheck => healthCheck.Tags.Contains("ml"),
                AllowCachingResponses = false
            });

            return app;
        }

        /// <summary>
        /// Configures API endpoints including controllers and SignalR hubs
        /// </summary>
        public static WebApplication ConfigureEndpoints(this WebApplication app)
        {
            // Map SignalR hub
            app.MapHub<NotificationHub>("/hubs/notifications");

            // Map API controllers
            app.MapControllers();

            return app;
        }
    }
}