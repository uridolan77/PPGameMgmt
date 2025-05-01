using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Routing;

namespace PPGameMgmt.API.Extensions
{
    public static class EndpointExtensions
    {
        public static WebApplication ConfigureEndpoints(this WebApplication app)
        {
            // First add routing middleware
            app.UseRouting();
            
            // Then configure the endpoints
            app.UseEndpoints(endpoints =>
            {
                // Map controller endpoints
                endpoints.MapControllers();
                
                // Map minimal API endpoints
                endpoints.MapMinimalApis();
            });
            
            return app;
        }
    }
}
