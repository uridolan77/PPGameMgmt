using System;
using System.Text;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Schema filter to ensure that generic types have unique schema IDs in Swagger
    /// Fixes the problem with ApiResponse&lt;T&gt; types causing conflicts
    /// </summary>
    public class SwaggerGenericTypeSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            if (context.Type == null) return;

            // Only process generic types
            if (!context.Type.IsGenericType) return;

            // Generate a more descriptive schema ID for the generic type that includes type parameters
            var genericTypeDefinition = context.Type.GetGenericTypeDefinition();
            var genericArguments = context.Type.GetGenericArguments();
            
            // Add discriminator information for generic types to help with serialization
            if (schema.Properties != null && genericTypeDefinition == typeof(PPGameMgmt.API.Models.ApiResponse<>))
            {
                // For ApiResponse<T>, enhance with additional metadata that won't affect serialization
                schema.Description = $"API response wrapper for {GetFriendlyTypeName(genericArguments[0])}";
                
                // This is optional but helps with documentation clarity
                if (!schema.Properties.ContainsKey("$responseType"))
                {
                    schema.Properties.Add("$responseType", new OpenApiSchema
                    {
                        Type = "string",
                        Description = "The type of data in this response",
                        ReadOnly = true,
                        Example = new Microsoft.OpenApi.Any.OpenApiString(GetFriendlyTypeName(genericArguments[0]))
                    });
                }
            }
        }

        /// <summary>
        /// Get a human-readable name for a type, including generic arguments if applicable
        /// </summary>
        private string GetFriendlyTypeName(Type type)
        {
            if (!type.IsGenericType)
            {
                return type.Name;
            }

            var builder = new StringBuilder();
            var genericTypeName = type.Name;
            
            // Remove the generic type marker (`1, `2, etc.)
            int backtickIndex = genericTypeName.IndexOf('`');
            if (backtickIndex > 0)
            {
                builder.Append(genericTypeName.Substring(0, backtickIndex));
            }
            else
            {
                builder.Append(genericTypeName);
            }

            builder.Append('<');
            var genericArgs = type.GetGenericArguments();
            for (var i = 0; i < genericArgs.Length; i++)
            {
                if (i > 0)
                {
                    builder.Append(", ");
                }
                builder.Append(GetFriendlyTypeName(genericArgs[i]));
            }
            builder.Append('>');

            return builder.ToString();
        }
    }
}