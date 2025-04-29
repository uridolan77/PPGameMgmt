using System.Text.Json;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace PPGameMgmt.API.HealthChecks
{
    /// <summary>
    /// Custom health check response writer
    /// </summary>
    public static class HealthCheckResponseWriter
    {
        public static Task WriteResponse(HttpContext context, HealthReport healthReport)
        {
            context.Response.ContentType = "application/json";
            
            var response = new
            {
                status = healthReport.Status.ToString(),
                totalDuration = healthReport.TotalDuration.TotalMilliseconds,
                timestamp = DateTime.UtcNow,
                checks = healthReport.Entries.Select(entry => new
                {
                    name = entry.Key,
                    status = entry.Value.Status.ToString(),
                    duration = entry.Value.Duration.TotalMilliseconds,
                    description = entry.Value.Description,
                    error = entry.Value.Exception?.Message,
                    data = entry.Value.Data.Count > 0 ? entry.Value.Data : null
                })
            };
            
            var options = new JsonSerializerOptions
            {
                WriteIndented = true,
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            };
            
            return context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }
    }
}
