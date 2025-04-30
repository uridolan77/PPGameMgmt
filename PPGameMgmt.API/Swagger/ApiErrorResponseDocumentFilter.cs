using System;
using System.Collections.Generic;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;
using PPGameMgmt.API.Models;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Document filter to ensure ApiErrorResponse is added to the components section
    /// </summary>
    public class ApiErrorResponseDocumentFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            // Ensure components and schemas sections exist
            swaggerDoc.Components ??= new OpenApiComponents();
            swaggerDoc.Components.Schemas ??= new Dictionary<string, OpenApiSchema>();

            // Only add if not already in schema repository
            if (!context.SchemaRepository.Schemas.ContainsKey("ApiErrorResponse") && 
                !swaggerDoc.Components.Schemas.ContainsKey("ApiErrorResponse"))
            {
                try
                {
                    var apiErrorSchema = context.SchemaGenerator.GenerateSchema(typeof(ApiErrorResponse), context.SchemaRepository);
                    swaggerDoc.Components.Schemas.Add("ApiErrorResponse", apiErrorSchema);
                }
                catch (ArgumentException ex) when (ex.Message.Contains("same key"))
                {
                    // Schema was added by another filter or process
                    // Just continue without throwing an error
                }
            }
        }
    }
}