using System;
using System.Collections.Generic;

namespace PPGameMgmt.Core.Entities
{
    /// <summary>
    /// Represents metadata for a machine learning model in the model registry
    /// </summary>
    public class ModelMetadata
    {
        /// <summary>
        /// Gets or sets the unique identifier for the model
        /// </summary>
        public Guid Id { get; set; }
        
        /// <summary>
        /// Gets or sets the name of the model
        /// </summary>
        public string ModelName { get; set; }
        
        /// <summary>
        /// Gets or sets the version of the model
        /// </summary>
        public string Version { get; set; }
        
        /// <summary>
        /// Gets or sets the file path where the model is stored
        /// </summary>
        public string ModelPath { get; set; }
        
        /// <summary>
        /// Gets or sets the timestamp when the model was registered
        /// </summary>
        public DateTime RegisteredTimestamp { get; set; }
        
        /// <summary>
        /// Gets or sets whether this model version is active
        /// </summary>
        public bool IsActive { get; set; }
        
        /// <summary>
        /// Gets or sets model metrics as key-value pairs
        /// </summary>
        public Dictionary<string, double> Metrics { get; set; } = new Dictionary<string, double>();
    }
}