using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.Extensions.Configuration;
using System.Text.Json;

namespace PPGameMgmt.Infrastructure.ML.Models
{
    /// <summary>
    /// Service for managing ML model operations like versioning, deployment, and monitoring
    /// </summary>
    public class MLOpsService : IMLOpsService
    {
        private readonly ILogger<MLOpsService> _logger;
        private readonly IConfiguration _configuration;
        private readonly string _modelStoragePath;
        private readonly string _modelRegistryPath;
        private readonly Dictionary<string, ModelMetadata> _activeModels = new();

        public MLOpsService(ILogger<MLOpsService> logger, IConfiguration configuration)
        {
            _logger = logger;
            _configuration = configuration;
            
            // Get model paths from configuration
            _modelStoragePath = _configuration["MLOps:ModelStoragePath"] ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ML", "Models");
            _modelRegistryPath = Path.Combine(_modelStoragePath, "registry.json");
            
            // Ensure directories exist
            Directory.CreateDirectory(_modelStoragePath);
            
            // Load model registry if it exists
            if (File.Exists(_modelRegistryPath))
            {
                try
                {
                    var registryJson = File.ReadAllText(_modelRegistryPath);
                    var registry = JsonSerializer.Deserialize<Dictionary<string, ModelMetadata>>(registryJson);
                    
                    if (registry != null)
                    {
                        _activeModels = registry;
                        _logger.LogInformation("Loaded model registry with {Count} models", _activeModels.Count);
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error loading model registry");
                }
            }
        }

        /// <summary>
        /// Registers a new model version in the model registry
        /// </summary>
        public async Task<ModelMetadata> RegisterModelAsync(string modelName, string modelPath, string version = null)
        {
            if (string.IsNullOrEmpty(modelName))
                throw new ArgumentNullException(nameof(modelName));
            
            if (string.IsNullOrEmpty(modelPath) || !File.Exists(modelPath))
                throw new ArgumentException("Model file does not exist", nameof(modelPath));

            // Generate version if not provided
            version ??= DateTime.UtcNow.ToString("yyyyMMdd-HHmmss");
            
            // Create model metadata
            var metadata = new ModelMetadata
            {
                Name = modelName,
                Version = version,
                StoragePath = Path.Combine(_modelStoragePath, $"{modelName}-{version}.onnx"),
                RegisteredTimestamp = DateTime.UtcNow,
                IsActive = true,
                Metrics = new Dictionary<string, double>()
            };
            
            // Copy model file to storage
            File.Copy(modelPath, metadata.StoragePath, overwrite: true);
            
            // Validate the model by trying to create a session
            try
            {
                using var session = new InferenceSession(metadata.StoragePath);
                metadata.InputFeatures = session.InputMetadata.Keys.ToList();
                metadata.OutputFeatures = session.OutputMetadata.Keys.ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating model {ModelName} version {Version}", modelName, version);
                throw new InvalidOperationException("Invalid ONNX model", ex);
            }

            // Mark previous versions as inactive
            if (_activeModels.TryGetValue(modelName, out var existingModel))
            {
                existingModel.IsActive = false;
            }
            
            // Update registry
            _activeModels[modelName] = metadata;
            await SaveRegistryAsync();
            
            _logger.LogInformation("Registered model {ModelName} version {Version}", modelName, version);
            return metadata;
        }

        /// <summary>
        /// Gets the path to the active version of a model
        /// </summary>
        public string GetActiveModelPath(string modelName)
        {
            if (!_activeModels.TryGetValue(modelName, out var metadata) || !metadata.IsActive)
            {
                throw new KeyNotFoundException($"No active model found with name {modelName}");
            }
            
            return metadata.StoragePath;
        }

        /// <summary>
        /// Gets all versions of a specific model
        /// </summary>
        public IEnumerable<ModelMetadata> GetModelVersions(string modelName)
        {
            return _activeModels.Values
                .Where(m => m.Name == modelName)
                .OrderByDescending(m => m.RegisteredTimestamp);
        }

        /// <summary>
        /// Activates a specific version of a model
        /// </summary>
        public async Task ActivateModelVersionAsync(string modelName, string version)
        {
            var models = GetModelVersions(modelName).ToList();
            var model = models.FirstOrDefault(m => m.Version == version);
            
            if (model == null)
            {
                throw new KeyNotFoundException($"Model {modelName} version {version} not found");
            }
            
            // Deactivate all versions
            foreach (var m in models)
            {
                m.IsActive = false;
            }
            
            // Activate requested version
            model.IsActive = true;
            
            // Update registry
            await SaveRegistryAsync();
            
            _logger.LogInformation("Activated model {ModelName} version {Version}", modelName, version);
        }

        /// <summary>
        /// Records monitoring metrics for a model
        /// </summary>
        public async Task RecordMetricsAsync(string modelName, Dictionary<string, double> metrics)
        {
            if (!_activeModels.TryGetValue(modelName, out var metadata))
            {
                throw new KeyNotFoundException($"Model {modelName} not found");
            }
            
            // Update metrics
            foreach (var (key, value) in metrics)
            {
                metadata.Metrics[key] = value;
            }
            
            // Record timestamp of the metrics update
            metadata.LastMetricsUpdate = DateTime.UtcNow;
            
            // Update registry
            await SaveRegistryAsync();
            
            _logger.LogInformation("Recorded metrics for model {ModelName}", modelName);
        }

        /// <summary>
        /// Saves the model registry to disk
        /// </summary>
        private async Task SaveRegistryAsync()
        {
            var options = new JsonSerializerOptions { WriteIndented = true };
            var registryJson = JsonSerializer.Serialize(_activeModels, options);
            await File.WriteAllTextAsync(_modelRegistryPath, registryJson);
        }
    }

    /// <summary>
    /// Represents metadata for a model version
    /// </summary>
    public class ModelMetadata
    {
        public string Name { get; set; }
        public string Version { get; set; }
        public string StoragePath { get; set; }
        public DateTime RegisteredTimestamp { get; set; }
        public DateTime? LastMetricsUpdate { get; set; }
        public bool IsActive { get; set; }
        public List<string> InputFeatures { get; set; } = new();
        public List<string> OutputFeatures { get; set; } = new();
        public Dictionary<string, double> Metrics { get; set; } = new();
    }
}