using System;
using System.Collections.Generic;
using System.Linq;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Document filter to ensure schema IDs are unique and properly formatted
    /// </summary>
    public class SwaggerSchemaDocumentFilter : IDocumentFilter
    {
        public void Apply(OpenApiDocument swaggerDoc, DocumentFilterContext context)
        {
            // Track schema name replacements
            var schemaReplacements = new Dictionary<string, string>();
            
            // Create a dictionary to track schema IDs that have been used
            var schemaIds = new Dictionary<string, int>();

            // Process all schemas to ensure unique IDs
            var schemasCopy = swaggerDoc.Components.Schemas.ToList();
            swaggerDoc.Components.Schemas.Clear();

            foreach (var schema in schemasCopy)
            {
                var originalKey = schema.Key;
                var newKey = originalKey;

                // Handle duplicate schema IDs
                if (newKey.Contains("`"))
                {
                    // Extract the base type name for generic types
                    var baseName = newKey.Split('`')[0];
                    
                    // If we've already used this base name, add a counter
                    if (schemaIds.ContainsKey(baseName))
                    {
                        schemaIds[baseName]++;
                        newKey = $"{baseName}{schemaIds[baseName]}";
                    }
                    else
                    {
                        schemaIds[baseName] = 1;
                        newKey = baseName;
                    }
                    
                    // Record the replacement
                    schemaReplacements[originalKey] = newKey;
                }
                // For other cases, use specific schema IDs that match our CustomSchemaIds
                else if (newKey == "BonusModel" || newKey == "BonusTypeEnum" || newKey == "ApiBonus")
                {
                    // Keep the key as is - these are our designated schema IDs for different types
                }
                // For other cases, just keep the original key
                else
                {
                    // Check if we need to disambiguate
                    if (schemaIds.ContainsKey(newKey))
                    {
                        schemaIds[newKey]++;
                        var disambiguatedKey = $"{newKey}{schemaIds[newKey]}";
                        schemaReplacements[originalKey] = disambiguatedKey;
                        newKey = disambiguatedKey;
                    }
                    else
                    {
                        schemaIds[newKey] = 1;
                    }
                }

                // Add the schema with the potentially modified key
                swaggerDoc.Components.Schemas[newKey] = schema.Value;
            }

            // Update all references using the mapping dictionary
            UpdateSchemaReferences(swaggerDoc, schemaReplacements);
        }

        private void UpdateSchemaReferences(OpenApiDocument swaggerDoc, Dictionary<string, string> schemaReplacements)
        {
            // Update path references
            foreach (var path in swaggerDoc.Paths)
            {
                foreach (var operation in path.Value.Operations)
                {
                    // Update request body references
                    if (operation.Value.RequestBody?.Reference != null)
                    {
                        UpdateReference(operation.Value.RequestBody.Reference, schemaReplacements);
                    }

                    // Update request body content schema references
                    if (operation.Value.RequestBody?.Content != null)
                    {
                        foreach (var content in operation.Value.RequestBody.Content)
                        {
                            if (content.Value.Schema?.Reference != null)
                            {
                                UpdateReference(content.Value.Schema.Reference, schemaReplacements);
                            }
                        }
                    }

                    // Update response references
                    foreach (var response in operation.Value.Responses)
                    {
                        if (response.Value.Reference != null)
                        {
                            UpdateReference(response.Value.Reference, schemaReplacements);
                        }

                        // Update content schema references
                        foreach (var content in response.Value.Content)
                        {
                            if (content.Value.Schema?.Reference != null)
                            {
                                UpdateReference(content.Value.Schema.Reference, schemaReplacements);
                            }
                        }
                    }

                    // Update parameter references
                    foreach (var parameter in operation.Value.Parameters)
                    {
                        if (parameter.Reference != null)
                        {
                            UpdateReference(parameter.Reference, schemaReplacements);
                        }

                        if (parameter.Schema?.Reference != null)
                        {
                            UpdateReference(parameter.Schema.Reference, schemaReplacements);
                        }
                    }
                }
            }
        }

        private void UpdateReference(OpenApiReference reference, Dictionary<string, string> schemaReplacements)
        {
            if (reference.Type == ReferenceType.Schema)
            {
                // Check if this reference ID needs to be replaced based on our mapping
                if (schemaReplacements.TryGetValue(reference.Id, out string newId))
                {
                    reference.Id = newId;
                }
            }
        }
    }
}
