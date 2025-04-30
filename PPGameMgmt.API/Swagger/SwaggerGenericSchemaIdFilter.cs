using System;
using System.Linq;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Schema filter that generates unique schema IDs for generic types to avoid conflicts
    /// specifically targeted at ApiResponse&lt;T&gt; types
    /// </summary>
    public class SwaggerGenericSchemaIdFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            // Skip processing if no type info is available
            if (context.Type == null) return;

            // Only apply to generic types like ApiResponse<T>
            if (!context.Type.IsGenericType) return;

            var genericTypeDef = context.Type.GetGenericTypeDefinition();
            
            // We only want to handle our ApiResponse<T> to fix the specific issue
            if (genericTypeDef == typeof(PPGameMgmt.API.Models.ApiResponse<>))
            {
                var typeParams = context.Type.GetGenericArguments();
                if (typeParams.Length > 0)
                {
                    // Create schema title that accurately describes the generic instantiation
                    var innerType = typeParams[0];
                    string innerTypeName;
                    
                    if (innerType.IsGenericType)
                    {
                        // Handle nested generic types (like ApiResponse<List<T>>)
                        var innerGenericType = innerType.GetGenericTypeDefinition();
                        var innerTypeParams = innerType.GetGenericArguments();
                        
                        if (innerGenericType == typeof(System.Collections.Generic.IEnumerable<>) ||
                            innerGenericType == typeof(System.Collections.Generic.List<>) ||
                            innerGenericType == typeof(System.Collections.Generic.IList<>) ||
                            innerGenericType == typeof(System.Collections.Generic.ICollection<>))
                        {
                            innerTypeName = $"Collection_Of_{innerTypeParams[0].Name}";
                        }
                        else
                        {
                            innerTypeName = $"{innerType.Name.Split('`')[0]}_Of_{string.Join("_And_", innerTypeParams.Select(t => t.Name))}";
                        }
                    }
                    else
                    {
                        innerTypeName = innerType.Name;
                    }
                    
                    // Generate a unique title that captures the full generic structure
                    schema.Title = $"ApiResponseOf{innerTypeName}";
                }
            }
        }
    }
}