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
            // Create a dictionary to track schema IDs that have been used
            var schemaIds = new Dictionary<string, int>();

            // Process all schemas to ensure unique IDs
            var schemasCopy = swaggerDoc.Components.Schemas.ToList();
            swaggerDoc.Components.Schemas.Clear();

            foreach (var schema in schemasCopy)
            {
                var key = schema.Key;

                // Handle duplicate schema IDs
                if (key.Contains("`") || key.Contains("Bonus"))
                {
                    string baseName;

                    if (key.Contains("`"))
                    {
                        // Extract the base type name for generic types
                        baseName = key.Split('`')[0];
                    }
                    else if (key.Contains("PPGameMgmt.Core.Entities.Bonuses.Bonus"))
                    {
                        // Special case for Bonus in the Bonuses namespace
                        baseName = "BonusesNamespace";
                    }
                    else if (key.Contains("PPGameMgmt.Core.Entities.Bonus"))
                    {
                        // Special case for Bonus in the root namespace
                        baseName = "Bonus";
                    }
                    else
                    {
                        baseName = key;
                    }

                    // If we've already used this base name, add a counter
                    if (schemaIds.ContainsKey(baseName))
                    {
                        schemaIds[baseName]++;
                        key = $"{baseName}{schemaIds[baseName]}";
                    }
                    else
                    {
                        schemaIds[baseName] = 1;
                        key = baseName;
                    }
                }

                // Add the schema with the potentially modified key
                swaggerDoc.Components.Schemas[key] = schema.Value;
            }

            // Update all references to use the new schema IDs
            UpdateSchemaReferences(swaggerDoc);
        }

        private void UpdateSchemaReferences(OpenApiDocument swaggerDoc)
        {
            // Update path references
            foreach (var path in swaggerDoc.Paths)
            {
                foreach (var operation in path.Value.Operations)
                {
                    // Update request body references
                    if (operation.Value.RequestBody?.Reference != null)
                    {
                        UpdateReference(operation.Value.RequestBody.Reference);
                    }

                    // Update response references
                    foreach (var response in operation.Value.Responses)
                    {
                        if (response.Value.Reference != null)
                        {
                            UpdateReference(response.Value.Reference);
                        }

                        // Update content schema references
                        foreach (var content in response.Value.Content)
                        {
                            if (content.Value.Schema?.Reference != null)
                            {
                                UpdateReference(content.Value.Schema.Reference);
                            }
                        }
                    }

                    // Update parameter references
                    foreach (var parameter in operation.Value.Parameters)
                    {
                        if (parameter.Reference != null)
                        {
                            UpdateReference(parameter.Reference);
                        }

                        if (parameter.Schema?.Reference != null)
                        {
                            UpdateReference(parameter.Schema.Reference);
                        }
                    }
                }
            }
        }

        private void UpdateReference(OpenApiReference reference)
        {
            if (reference.Type == ReferenceType.Schema)
            {
                if (reference.Id.Contains("`"))
                {
                    // Simplify the reference ID for generic types
                    var baseName = reference.Id.Split('`')[0];
                    reference.Id = baseName;
                }
                else if (reference.Id.Contains("PPGameMgmt.Core.Entities.Bonuses.Bonus"))
                {
                    // Special case for Bonus in the Bonuses namespace
                    reference.Id = "BonusesNamespace";
                }
                else if (reference.Id.Contains("PPGameMgmt.Core.Entities.Bonus"))
                {
                    // Special case for Bonus in the root namespace
                    reference.Id = "Bonus";
                }
            }
        }
    }
}
