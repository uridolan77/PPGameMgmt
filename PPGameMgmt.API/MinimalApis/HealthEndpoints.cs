using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.OpenApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Threading.Tasks;

namespace PPGameMgmt.API.MinimalApis
{
    public static class HealthEndpoints
    {
        public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder endpoints)
        {
            // Simple health check endpoint
            endpoints.MapGet("/api/health", async context =>
            {
                var healthCheck = context.RequestServices.GetRequiredService<HealthCheckService>();
                var report = await healthCheck.CheckHealthAsync();
                
                var response = new
                {
                    Status = report.Status.ToString(),
                    Checks = report.Entries.Select(e => new
                    {
                        Component = e.Key,
                        Status = e.Value.Status.ToString(),
                        Description = e.Value.Description,
                        Duration = e.Value.Duration.TotalMilliseconds
                    }),
                    TotalDuration = report.TotalDuration.TotalMilliseconds
                };
                
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = report.Status == HealthStatus.Healthy ? 
                    StatusCodes.Status200OK : 
                    StatusCodes.Status503ServiceUnavailable;
                
                await JsonSerializer.SerializeAsync(context.Response.Body, response, new JsonSerializerOptions
                {
                    WriteIndented = true
                });
            })
            .WithName("GetHealth")
            .WithOpenApi(operation =>
            {
                operation.Summary = "Gets the health status of the API and its dependencies";
                operation.Description = "Returns detailed health information about the API and its dependencies";
                operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Health" } };
                return operation;
            });

            // Liveness probe for Kubernetes
            endpoints.MapGet("/api/health/live", async context =>
            {
                var healthCheck = context.RequestServices.GetRequiredService<HealthCheckService>();
                var report = await healthCheck.CheckHealthAsync();
                
                context.Response.StatusCode = report.Status == HealthStatus.Healthy ? 
                    StatusCodes.Status200OK : 
                    StatusCodes.Status503ServiceUnavailable;
            })
            .WithName("GetLiveness")
            .WithOpenApi(operation =>
            {
                operation.Summary = "Liveness probe for container orchestration";
                operation.Description = "Simple endpoint to check if the application is running";
                operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Health" } };
                return operation;
            });

            // Readiness probe for Kubernetes
            endpoints.MapGet("/api/health/ready", async context =>
            {
                var healthCheck = context.RequestServices.GetRequiredService<HealthCheckService>();
                var report = await healthCheck.CheckHealthAsync();
                
                context.Response.StatusCode = report.Status == HealthStatus.Healthy ? 
                    StatusCodes.Status200OK : 
                    StatusCodes.Status503ServiceUnavailable;
            })
            .WithName("GetReadiness")
            .WithOpenApi(operation =>
            {
                operation.Summary = "Readiness probe for container orchestration";
                operation.Description = "Checks if the application is ready to receive traffic";
                operation.Tags = new List<OpenApiTag> { new OpenApiTag { Name = "Health" } };
                return operation;
            });

            return endpoints;
        }
    }
}
