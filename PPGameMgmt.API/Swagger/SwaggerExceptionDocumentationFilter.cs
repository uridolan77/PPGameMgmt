using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using PPGameMgmt.API.Models;
using PPGameMgmt.Core.Exceptions;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Adds exception documentation to Swagger endpoints
    /// </summary>
    public class SwaggerExceptionDocumentationFilter : IOperationFilter
    {
        private readonly Dictionary<Type, (int StatusCode, string Description)> _exceptionMap = new()
        {
            { typeof(EntityNotFoundException), (404, "Entity not found") },
            { typeof(ValidationException), (400, "Validation error") },
            { typeof(BusinessRuleViolationException), (422, "Business rule violation") },
            { typeof(ConcurrencyException), (409, "Concurrency conflict") },
            { typeof(InfrastructureException), (503, "Infrastructure error") },
            { typeof(DomainException), (400, "Domain error") }
        };

        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            // Get the API action's attributes
            var attributes = context.MethodInfo.GetCustomAttributes(true);

            // Get all ProducesResponseType attributes
            var responsesAttributes = attributes
                .OfType<ProducesResponseTypeAttribute>()
                .ToList();

            // Only add our standard exception responses if the method doesn't explicitly define them
            var existingResponseCodes = responsesAttributes
                .Select(a => a.StatusCode)
                .ToHashSet();

            // Add response documentation for each exception type
            foreach (var (exceptionType, (statusCode, description)) in _exceptionMap)
            {
                // Skip if this status code is already documented
                if (existingResponseCodes.Contains(statusCode))
                {
                    continue;
                }

                // Create ApiErrorResponse schema reference
                var errorResponseRef = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.Schema,
                            Id = "ApiErrorResponse"
                        }
                    }
                };

                // Add the response if it doesn't already exist
                var statusCodeStr = statusCode.ToString();
                if (!operation.Responses.ContainsKey(statusCodeStr))
                {
                    operation.Responses.Add(statusCodeStr, new OpenApiResponse
                    {
                        Description = description,
                        Content = new Dictionary<string, OpenApiMediaType>
                        {
                            { "application/json", errorResponseRef }
                        }
                    });
                }
            }

            // Always add 500 Internal Server Error if not already present
            if (!existingResponseCodes.Contains(500))
            {
                // Create ApiErrorResponse schema reference
                var errorResponseRef = new OpenApiMediaType
                {
                    Schema = new OpenApiSchema
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.Schema,
                            Id = "ApiErrorResponse"
                        }
                    }
                };

                // Add the response if it doesn't already exist
                if (!operation.Responses.ContainsKey("500"))
                {
                    operation.Responses.Add("500", new OpenApiResponse
                    {
                        Description = "Internal server error",
                        Content = new Dictionary<string, OpenApiMediaType>
                        {
                            { "application/json", errorResponseRef }
                        }
                    });
                }
            }
        }
    }
}