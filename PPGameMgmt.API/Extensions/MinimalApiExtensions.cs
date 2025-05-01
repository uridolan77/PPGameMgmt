using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;
using PPGameMgmt.API.MinimalApis;

namespace PPGameMgmt.API.Extensions
{
    public static class MinimalApiExtensions
    {
        public static IEndpointRouteBuilder MapMinimalApis(this IEndpointRouteBuilder endpoints)
        {
            // Map all minimal API endpoints
            endpoints.MapHealthEndpoints();
            endpoints.MapGameEndpoints();
            endpoints.MapPlayerEndpoints();
            
            return endpoints;
        }
    }
}
