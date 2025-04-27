using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Infrastructure.ML.Models;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Service for managing ML model operations like versioning, deployment, and monitoring
    /// </summary>
    public interface IMLOpsService
    {
        /// <summary>
        /// Registers a new model version in the model registry
        /// </summary>
        /// <param name="modelName">The name of the model</param>
        /// <param name="modelPath">Path to the model file</param>
        /// <param name="version">Optional version identifier (auto-generated if not provided)</param>
        /// <returns>Metadata for the registered model</returns>
        Task<ModelMetadata> RegisterModelAsync(string modelName, string modelPath, string version = null);
        
        /// <summary>
        /// Gets the path to the active version of a model
        /// </summary>
        /// <param name="modelName">The name of the model</param>
        /// <returns>Path to the active model file</returns>
        string GetActiveModelPath(string modelName);
        
        /// <summary>
        /// Gets all versions of a specific model
        /// </summary>
        /// <param name="modelName">The name of the model</param>
        /// <returns>Collection of model metadata</returns>
        IEnumerable<ModelMetadata> GetModelVersions(string modelName);
        
        /// <summary>
        /// Activates a specific version of a model
        /// </summary>
        /// <param name="modelName">The name of the model</param>
        /// <param name="version">The version to activate</param>
        Task ActivateModelVersionAsync(string modelName, string version);
        
        /// <summary>
        /// Records monitoring metrics for a model
        /// </summary>
        /// <param name="modelName">The name of the model</param>
        /// <param name="metrics">Dictionary of metric names and values</param>
        Task RecordMetricsAsync(string modelName, Dictionary<string, double> metrics);
    }
}