using System.Reflection;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Filter to enhance Swagger documentation with XML comments
    /// </summary>
    public class SwaggerDocumentationFilter : IOperationFilter
    {
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Add response descriptions based on status codes
            foreach (var (statusCode, response) in operation.Responses)
            {
                switch (statusCode)
                {
                    case "200":
                        response.Description ??= "Success";
                        break;
                    case "201":
                        response.Description ??= "Created";
                        break;
                    case "204":
                        response.Description ??= "No Content";
                        break;
                    case "400":
                        response.Description ??= "Bad Request - The request was invalid or cannot be processed";
                        break;
                    case "401":
                        response.Description ??= "Unauthorized - Authentication is required and has failed or has not been provided";
                        break;
                    case "403":
                        response.Description ??= "Forbidden - You do not have permission to access this resource";
                        break;
                    case "404":
                        response.Description ??= "Not Found - The requested resource was not found";
                        break;
                    case "409":
                        response.Description ??= "Conflict - The request could not be completed due to a conflict with the current state of the resource";
                        break;
                    case "429":
                        response.Description ??= "Too Many Requests - You have sent too many requests in a given amount of time";
                        break;
                    case "500":
                        response.Description ??= "Internal Server Error - An unexpected error occurred on the server";
                        break;
                    case "503":
                        response.Description ??= "Service Unavailable - The server is currently unavailable";
                        break;
                }
            }
            
            // Add operation-specific metadata
            var methodInfo = context.MethodInfo;
            
            // Add rate limiting information if applicable
            if (operation.Parameters != null)
            {
                // Add pagination information for collection endpoints
                var paginationParameters = operation.Parameters.Where(p => 
                    p.Name == "pageNumber" || p.Name == "pageSize").ToList();
                
                if (paginationParameters.Count > 0)
                {
                    operation.Description += "\n\n### Pagination\n" +
                        "This endpoint supports pagination. Use the following query parameters:\n" +
                        "- `pageNumber`: The page number to retrieve (1-based, default: 1)\n" +
                        "- `pageSize`: The number of items per page (default: 10, max: 100)\n\n" +
                        "The response includes pagination metadata in the `pagination` property.";
                }
            }
            
            // Add rate limiting information
            operation.Description += "\n\n### Rate Limiting\n" +
                "This endpoint is subject to rate limiting. The following headers are included in the response:\n" +
                "- `X-RateLimit-Limit`: The maximum number of requests allowed per minute\n" +
                "- `X-RateLimit-Remaining`: The number of requests remaining in the current time window\n" +
                "- `X-RateLimit-Reset`: The time at which the current rate limit window resets (Unix timestamp)";
            
            // Add error response information
            operation.Description += "\n\n### Error Responses\n" +
                "Error responses include the following properties:\n" +
                "- `statusCode`: The HTTP status code\n" +
                "- `message`: A user-friendly error message\n" +
                "- `correlationId`: A unique identifier for the request, useful for troubleshooting\n" +
                "- `errors`: A list of detailed error messages";
        }
    }
}
