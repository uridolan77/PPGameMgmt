using System.Collections.Generic;
using Microsoft.OpenApi.Models;
using PPGameMgmt.API.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Schema filter to ensure ApiErrorResponse is properly defined in the Swagger document
    /// </summary>
    public class ApiErrorResponseSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == typeof(ApiErrorResponse))
            {
                // Define the properties of ApiErrorResponse
                schema.Type = "object";
                schema.Properties = new Dictionary<string, OpenApiSchema>
                {
                    ["statusCode"] = new OpenApiSchema
                    {
                        Type = "integer",
                        Format = "int32",
                        Description = "HTTP status code"
                    },
                    ["message"] = new OpenApiSchema
                    {
                        Type = "string",
                        Description = "User-friendly error message"
                    },
                    ["correlationId"] = new OpenApiSchema
                    {
                        Type = "string",
                        Description = "Correlation ID for tracking the request"
                    },
                    ["errorCode"] = new OpenApiSchema
                    {
                        Type = "string",
                        Description = "Error code for domain-specific errors"
                    },
                    ["errors"] = new OpenApiSchema
                    {
                        Type = "array",
                        Items = new OpenApiSchema
                        {
                            Type = "string"
                        },
                        Description = "List of detailed error messages"
                    },
                    ["validationErrors"] = new OpenApiSchema
                    {
                        Type = "object",
                        AdditionalProperties = new OpenApiSchema
                        {
                            Type = "array",
                            Items = new OpenApiSchema
                            {
                                Type = "string"
                            }
                        },
                        Description = "Validation errors with property names"
                    },
                    ["developerMessage"] = new OpenApiSchema
                    {
                        Type = "string",
                        Description = "Technical error message (only included in development environment)"
                    },
                    ["exceptionType"] = new OpenApiSchema
                    {
                        Type = "string",
                        Description = "Exception type (only included in development environment)"
                    },
                    ["stackTrace"] = new OpenApiSchema
                    {
                        Type = "string",
                        Description = "Stack trace (only included in development environment)"
                    }
                };
            }
        }
    }
}
