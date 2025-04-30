using System;
using System.Collections.Generic;
using Microsoft.OpenApi.Models;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Bonuses;
using Swashbuckle.AspNetCore.SwaggerGen;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Schema filter to handle the Bonus types
    /// </summary>
    public class BonusSchemaFilter : ISchemaFilter
    {
        public void Apply(OpenApiSchema schema, SchemaFilterContext context)
        {
            // Handle the Bonus types
            if (context.Type == typeof(PPGameMgmt.Core.Entities.Bonuses.Bonus))
            {
                // Define the properties of Bonus
                schema.Type = "object";
                schema.Properties = new Dictionary<string, OpenApiSchema>
                {
                    ["id"] = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "uuid",
                        Description = "Bonus ID"
                    },
                    ["name"] = new OpenApiSchema
                    {
                        Type = "string",
                        Description = "Bonus name"
                    },
                    ["description"] = new OpenApiSchema
                    {
                        Type = "string",
                        Description = "Bonus description"
                    },
                    ["bonusType"] = new OpenApiSchema
                    {
                        Type = "integer",
                        Format = "int32",
                        Description = "Bonus type"
                    },
                    ["amount"] = new OpenApiSchema
                    {
                        Type = "number",
                        Format = "double",
                        Description = "Bonus amount"
                    },
                    ["startDate"] = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "date-time",
                        Description = "Bonus start date"
                    },
                    ["endDate"] = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "date-time",
                        Description = "Bonus end date"
                    },
                    ["isActive"] = new OpenApiSchema
                    {
                        Type = "boolean",
                        Description = "Whether the bonus is active"
                    },
                    ["wageringRequirement"] = new OpenApiSchema
                    {
                        Type = "number",
                        Format = "double",
                        Description = "Wagering requirement"
                    },
                    ["maxConversion"] = new OpenApiSchema
                    {
                        Type = "number",
                        Format = "double",
                        Description = "Maximum conversion amount"
                    },
                    ["applicableGameIds"] = new OpenApiSchema
                    {
                        Type = "array",
                        Items = new OpenApiSchema
                        {
                            Type = "string",
                            Format = "uuid"
                        },
                        Description = "IDs of games this bonus applies to"
                    },
                    ["targetSegments"] = new OpenApiSchema
                    {
                        Type = "array",
                        Items = new OpenApiSchema
                        {
                            Type = "string"
                        },
                        Description = "Target player segments"
                    }
                };
            }
            else if (context.Type == typeof(PPGameMgmt.Core.Entities.Bonuses.Bonus))
            {
                // Define the properties of Bonus in the Bonuses namespace
                schema.Type = "object";
                schema.Properties = new Dictionary<string, OpenApiSchema>
                {
                    ["id"] = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "uuid",
                        Description = "Bonus ID"
                    },
                    ["name"] = new OpenApiSchema
                    {
                        Type = "string",
                        Description = "Bonus name"
                    },
                    ["description"] = new OpenApiSchema
                    {
                        Type = "string",
                        Description = "Bonus description"
                    },
                    ["bonusType"] = new OpenApiSchema
                    {
                        Type = "integer",
                        Format = "int32",
                        Description = "Bonus type"
                    },
                    ["amount"] = new OpenApiSchema
                    {
                        Type = "number",
                        Format = "double",
                        Description = "Bonus amount"
                    },
                    ["startDate"] = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "date-time",
                        Description = "Bonus start date"
                    },
                    ["endDate"] = new OpenApiSchema
                    {
                        Type = "string",
                        Format = "date-time",
                        Description = "Bonus end date"
                    },
                    ["isActive"] = new OpenApiSchema
                    {
                        Type = "boolean",
                        Description = "Whether the bonus is active"
                    },
                    ["wageringRequirement"] = new OpenApiSchema
                    {
                        Type = "number",
                        Format = "double",
                        Description = "Wagering requirement"
                    },
                    ["maxConversion"] = new OpenApiSchema
                    {
                        Type = "number",
                        Format = "double",
                        Description = "Maximum conversion amount"
                    },
                    ["applicableGameIds"] = new OpenApiSchema
                    {
                        Type = "array",
                        Items = new OpenApiSchema
                        {
                            Type = "string",
                            Format = "uuid"
                        },
                        Description = "IDs of games this bonus applies to"
                    },
                    ["targetSegments"] = new OpenApiSchema
                    {
                        Type = "array",
                        Items = new OpenApiSchema
                        {
                            Type = "string"
                        },
                        Description = "Target player segments"
                    }
                };
            }
        }
    }
}
