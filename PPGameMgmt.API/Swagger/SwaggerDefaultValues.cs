using System.Linq;
using Microsoft.AspNetCore.Mvc.ApiExplorer;
using Microsoft.OpenApi.Models;
using Microsoft.OpenApi.Any;
using Swashbuckle.AspNetCore.SwaggerGen;
using System;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Represents the Swagger/Swashbuckle operation filter used to document the implicit API version parameter.
    /// </summary>
    public class SwaggerDefaultValues : IOperationFilter
    {
        /// <summary>
        /// Applies the filter to the specified operation using the given context.
        /// </summary>
        /// <param name="operation">The operation to apply the filter to.</param>
        /// <param name="context">The current operation filter context.</param>
        public void Apply(OpenApiOperation operation, OperationFilterContext context)
        {
            var apiDescription = context.ApiDescription;

            operation.Deprecated |= apiDescription.IsDeprecated();

            // REF: https://github.com/domaindrivendev/Swashbuckle.AspNetCore/issues/1752#issue-663991077
            foreach (var responseType in context.ApiDescription.SupportedResponseTypes)
            {
                // REF: https://github.com/domaindrivendev/Swashbuckle.AspNetCore/blob/b7cf75e7905050305b115dd96640ddd6e74c7ac9/src/Swashbuckle.AspNetCore.SwaggerGen/SwaggerGenerator/SwaggerGenerator.cs#L383-L387
                var responseKey = responseType.IsDefaultResponse ? "default" : responseType.StatusCode.ToString();
                var response = operation.Responses[responseKey];

                foreach (var contentType in response.Content.Keys)
                {
                    if (!responseType.ApiResponseFormats.Any(x => x.MediaType == contentType))
                    {
                        response.Content.Remove(contentType);
                    }
                }
            }

            if (operation.Parameters == null)
            {
                return;
            }

            // REF: https://github.com/domaindrivendev/Swashbuckle.AspNetCore/issues/412
            // REF: https://github.com/domaindrivendev/Swashbuckle.AspNetCore/pull/413
            foreach (var parameter in operation.Parameters)
            {
                var description = apiDescription.ParameterDescriptions.First(p => p.Name == parameter.Name);

                if (parameter.Description == null)
                {
                    parameter.Description = description.ModelMetadata?.Description;
                }

                if (parameter.Schema.Default == null && description.DefaultValue != null)
                {
                    // Instead of using OpenApiAnyFactory, create the appropriate OpenApiAny type directly
                    parameter.Schema.Default = CreateOpenApiAnyFromDefaultValue(description.DefaultValue);
                }

                parameter.Required |= description.IsRequired;
            }
        }

        private IOpenApiAny CreateOpenApiAnyFromDefaultValue(object defaultValue)
        {
            if (defaultValue == null)
                return new OpenApiNull();  // Return OpenApiNull instead of null

            switch (defaultValue)
            {
                case string stringValue:
                    return new OpenApiString(stringValue);
                case int intValue:
                    return new OpenApiInteger(intValue);
                case long longValue:
                    return new OpenApiLong(longValue);
                case double doubleValue:
                    return new OpenApiDouble(doubleValue);
                case float floatValue:
                    return new OpenApiFloat(floatValue);
                case bool boolValue:
                    return new OpenApiBoolean(boolValue);
                case DateTime dateTimeValue:
                    return new OpenApiDateTime(dateTimeValue);
                default:
                    // For complex types, we just use string representation
                    return new OpenApiString(defaultValue.ToString());
            }
        }
    }
}
