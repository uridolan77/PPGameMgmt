using System;
using System.Text;
using System.Linq;
using System.Collections.Generic;

namespace PPGameMgmt.API.Swagger
{
    /// <summary>
    /// Custom implementation of schema ID selector that handles generics consistently
    /// </summary>
    public class CustomSchemaIdSelector
    {
        private readonly Dictionary<Type, string> _typeToSchemaId = new Dictionary<Type, string>();

        /// <summary>
        /// Gets a unique schema identifier for the given type
        /// </summary>
        public string GetSchemaId(Type type)
        {
            // Check for cached schema ID
            if (_typeToSchemaId.TryGetValue(type, out var existingId))
            {
                return existingId;
            }

            // Generate new schema ID
            string schemaId = GenerateSchemaId(type);

            // Cache the result
            _typeToSchemaId[type] = schemaId;
            
            return schemaId;
        }

        private string GenerateSchemaId(Type type)
        {
            if (type == null) 
                return "Unknown";

            // Handle special cases for well-known types
            if (type == typeof(PPGameMgmt.Core.Entities.Bonuses.Bonus))
                return "BonusModel";
                
            if (type == typeof(PPGameMgmt.Core.Entities.Bonuses.BonusType))
                return "BonusTypeEnum";
                
            if (type.FullName != null && type.FullName.Contains("PPGameMgmt.API.Models.Bonuses"))
                return "Api" + type.Name;

            // For generic types, create a schema ID that includes the type parameters
            if (type.IsGenericType)
            {
                var genericTypeName = GetGenericTypeNameWithoutArity(type);
                var genericArgs = type.GetGenericArguments();
                
                // Handle ApiResponse<T> with special care
                if (type.GetGenericTypeDefinition() == typeof(PPGameMgmt.API.Models.ApiResponse<>))
                {
                    var dataType = genericArgs[0];
                    
                    // For collection types in ApiResponse
                    if (dataType.IsGenericType && 
                        (dataType.GetGenericTypeDefinition() == typeof(IEnumerable<>) ||
                         dataType.GetGenericTypeDefinition() == typeof(List<>) ||
                         dataType.GetGenericTypeDefinition() == typeof(IList<>) ||
                         dataType.GetGenericTypeDefinition() == typeof(ICollection<>)))
                    {
                        var elementType = dataType.GetGenericArguments()[0];
                        return $"ApiResponseOfListOf{elementType.Name}";
                    }
                    
                    // For regular types in ApiResponse
                    return $"ApiResponseOf{dataType.Name}";
                }
                
                // For other generic types
                StringBuilder sb = new StringBuilder();
                sb.Append(genericTypeName);
                sb.Append("Of");
                
                for (int i = 0; i < genericArgs.Length; i++)
                {
                    if (i > 0) sb.Append("And");
                    
                    // Handle nested generics recursively
                    sb.Append(GenerateSchemaId(genericArgs[i]));
                }
                
                return sb.ToString();
            }
            
            // For non-generic types, just use the name
            return type.Name;
        }

        private string GetGenericTypeNameWithoutArity(Type type)
        {
            string name = type.Name;
            int index = name.IndexOf('`');
            return index < 0 ? name : name.Substring(0, index);
        }
    }
}