using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.Extensions.Configuration;
using System.Text.Json;
using System.Data.SqlClient;
using System.Data;
using Azure;
using Microsoft.Extensions.Options;

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
        private readonly MLOpsStorageType _storageType;
        private readonly string _connectionString;
        private readonly string _azureMLWorkspace;
        private readonly string _azureMLEndpoint;
        private readonly string _azureSubscriptionId;
        private readonly string _azureResourceGroup;

        /// <summary>
        /// Creates a new instance of the MLOpsService
        /// </summary>
        public MLOpsService(ILogger<MLOpsService> logger, IConfiguration configuration)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
            
            // Get storage type from configuration
            var storageTypeStr = _configuration["MLOps:StorageType"] ?? "FileSystem";
            _storageType = Enum.Parse<MLOpsStorageType>(storageTypeStr, true);
            
            // Get model paths from configuration
            _modelStoragePath = _configuration["MLOps:ModelStoragePath"] ?? Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ML", "Models");
            _modelRegistryPath = Path.Combine(_modelStoragePath, "registry.json");
            
            // Get database connection string if using SQL storage
            if (_storageType == MLOpsStorageType.SqlDatabase)
            {
                _connectionString = _configuration.GetConnectionString("ModelRegistry") 
                    ?? throw new InvalidOperationException("Connection string 'ModelRegistry' not found in configuration");
                
                // Ensure database schema exists
                EnsureDatabaseSchemaExists().GetAwaiter().GetResult();
            }
            
            // Get Azure ML configuration if using Azure ML
            else if (_storageType == MLOpsStorageType.AzureML)
            {
                _azureMLWorkspace = _configuration["MLOps:AzureML:Workspace"] 
                    ?? throw new InvalidOperationException("Azure ML Workspace not configured");
                _azureMLEndpoint = _configuration["MLOps:AzureML:Endpoint"] 
                    ?? throw new InvalidOperationException("Azure ML Endpoint not configured");
                _azureSubscriptionId = _configuration["MLOps:AzureML:SubscriptionId"] 
                    ?? throw new InvalidOperationException("Azure Subscription ID not configured");
                _azureResourceGroup = _configuration["MLOps:AzureML:ResourceGroup"]
                    ?? throw new InvalidOperationException("Azure Resource Group not configured");
            }
            
            // For file system storage, ensure directories exist and load registry
            if (_storageType == MLOpsStorageType.FileSystem)
            {
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
                            _logger.LogInformation("Loaded model registry with {Count} models from file system", _activeModels.Count);
                        }
                    }
                    catch (Exception ex)
                    {
                        _logger.LogError(ex, "Error loading model registry from file system");
                    }
                }
            }
            else
            {
                // For other storage types, load registry from the appropriate source
                LoadRegistryFromStorage().GetAwaiter().GetResult();
            }
        }

        /// <summary>
        /// Registers a new model version in the model registry
        /// </summary>
        /// <param name="modelName">The name of the model</param>
        /// <param name="modelPath">Path to the model file</param>
        /// <param name="version">Optional version identifier (auto-generated if not provided)</param>
        /// <returns>Metadata for the registered model</returns>
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
            
            try
            {
                switch (_storageType)
                {
                    case MLOpsStorageType.FileSystem:
                        await RegisterModelInFileSystemAsync(modelName, modelPath, metadata);
                        break;
                    case MLOpsStorageType.SqlDatabase:
                        await RegisterModelInDatabaseAsync(modelName, modelPath, metadata);
                        break;
                    case MLOpsStorageType.AzureML:
                        await RegisterModelInAzureMLAsync(modelName, modelPath, metadata);
                        break;
                    default:
                        throw new NotSupportedException($"Storage type {_storageType} is not supported");
                }
                
                // Mark previous versions as inactive (in local cache)
                var modelVersions = GetModelVersions(modelName).ToList();
                foreach (var existingModel in modelVersions)
                {
                    if (existingModel.Version != version)
                    {
                        existingModel.IsActive = false;
                    }
                }
                
                _logger.LogInformation("Registered model {ModelName} version {Version}", modelName, version);
                return metadata;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering model {ModelName} version {Version}", modelName, version);
                throw;
            }
        }

        /// <summary>
        /// Gets the path to the active version of a model
        /// </summary>
        /// <param name="modelName">The name of the model</param>
        /// <returns>Path to the active model file</returns>
        public string GetActiveModelPath(string modelName)
        {
            // First check in-memory cache
            var activeModel = _activeModels.Values
                .FirstOrDefault(m => m.Name == modelName && m.IsActive);
                
            if (activeModel != null)
            {
                return activeModel.StoragePath;
            }
            
            // If not in cache, try to pull from storage (async here would be better, but interface constraint)
            try
            {
                switch (_storageType)
                {
                    case MLOpsStorageType.SqlDatabase:
                        activeModel = GetActiveModelFromDatabaseAsync(modelName).GetAwaiter().GetResult();
                        break;
                    case MLOpsStorageType.AzureML:
                        activeModel = GetActiveModelFromAzureMLAsync(modelName).GetAwaiter().GetResult();
                        break;
                }
                
                if (activeModel != null)
                {
                    // Add to cache
                    if (!_activeModels.ContainsKey(modelName))
                    {
                        _activeModels[modelName] = activeModel;
                    }
                    return activeModel.StoragePath;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving active model for {ModelName}", modelName);
            }
            
            throw new KeyNotFoundException($"No active model found with name {modelName}");
        }

        /// <summary>
        /// Gets all versions of a specific model
        /// </summary>
        /// <param name="modelName">The name of the model</param>
        /// <returns>Collection of model metadata</returns>
        public IEnumerable<ModelMetadata> GetModelVersions(string modelName)
        {
            // First check in-memory cache
            var modelsFromCache = _activeModels.Values
                .Where(m => m.Name == modelName)
                .ToList();
                
            if (modelsFromCache.Any())
            {
                return modelsFromCache.OrderByDescending(m => m.RegisteredTimestamp);
            }
            
            // If not in cache, try to pull from storage (async here would be better, but interface constraint)
            try
            {
                IEnumerable<ModelMetadata> models = null;
                
                switch (_storageType)
                {
                    case MLOpsStorageType.SqlDatabase:
                        models = GetModelVersionsFromDatabaseAsync(modelName).GetAwaiter().GetResult();
                        break;
                    case MLOpsStorageType.AzureML:
                        models = GetModelVersionsFromAzureMLAsync(modelName).GetAwaiter().GetResult();
                        break;
                }
                
                if (models != null && models.Any())
                {
                    // Add to cache
                    foreach (var model in models)
                    {
                        var key = $"{model.Name}_{model.Version}";
                        _activeModels[key] = model;
                    }
                    
                    return models.OrderByDescending(m => m.RegisteredTimestamp);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving model versions for {ModelName}", modelName);
            }
            
            return Enumerable.Empty<ModelMetadata>();
        }

        /// <summary>
        /// Activates a specific version of a model
        /// </summary>
        /// <param name="modelName">The name of the model</param>
        /// <param name="version">The version to activate</param>
        public async Task ActivateModelVersionAsync(string modelName, string version)
        {
            try
            {
                var models = GetModelVersions(modelName).ToList();
                var model = models.FirstOrDefault(m => m.Version == version);
                
                if (model == null)
                {
                    throw new KeyNotFoundException($"Model {modelName} version {version} not found");
                }
                
                // Update models in storage
                switch (_storageType)
                {
                    case MLOpsStorageType.FileSystem:
                        // Deactivate all versions in memory
                        foreach (var m in models)
                        {
                            m.IsActive = false;
                        }
                        // Activate requested version in memory
                        model.IsActive = true;
                        // Save to file
                        await SaveRegistryAsync();
                        break;
                    case MLOpsStorageType.SqlDatabase:
                        await ActivateModelVersionInDatabaseAsync(modelName, version);
                        break;
                    case MLOpsStorageType.AzureML:
                        await ActivateModelVersionInAzureMLAsync(modelName, version);
                        break;
                }
                
                // Update in-memory cache
                foreach (var m in _activeModels.Values.Where(m => m.Name == modelName))
                {
                    m.IsActive = m.Version == version;
                }
                
                _logger.LogInformation("Activated model {ModelName} version {Version}", modelName, version);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating model {ModelName} version {Version}", modelName, version);
                throw;
            }
        }

        /// <summary>
        /// Records monitoring metrics for a model
        /// </summary>
        /// <param name="modelName">The name of the model</param>
        /// <param name="metrics">Dictionary of metric names and values</param>
        public async Task RecordMetricsAsync(string modelName, Dictionary<string, double> metrics)
        {
            try
            {
                // Get active model
                var activeModel = _activeModels.Values
                    .FirstOrDefault(m => m.Name == modelName && m.IsActive);
                    
                if (activeModel == null)
                {
                    // Try to get from storage
                    switch (_storageType)
                    {
                        case MLOpsStorageType.SqlDatabase:
                            activeModel = await GetActiveModelFromDatabaseAsync(modelName);
                            break;
                        case MLOpsStorageType.AzureML:
                            activeModel = await GetActiveModelFromAzureMLAsync(modelName);
                            break;
                    }
                    
                    if (activeModel == null)
                    {
                        throw new KeyNotFoundException($"Model {modelName} not found");
                    }
                    
                    // Add to cache
                    _activeModels[$"{activeModel.Name}_{activeModel.Version}"] = activeModel;
                }
                
                // Update metrics
                foreach (var (key, value) in metrics)
                {
                    activeModel.Metrics[key] = value;
                }
                
                // Record timestamp of the metrics update
                activeModel.LastMetricsUpdate = DateTime.UtcNow;
                
                // Update in storage
                switch (_storageType)
                {
                    case MLOpsStorageType.FileSystem:
                        await SaveRegistryAsync();
                        break;
                    case MLOpsStorageType.SqlDatabase:
                        await SaveMetricsToDatabase(activeModel);
                        break;
                    case MLOpsStorageType.AzureML:
                        await SaveMetricsToAzureML(activeModel);
                        break;
                }
                
                _logger.LogInformation("Recorded metrics for model {ModelName}", modelName);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error recording metrics for model {ModelName}", modelName);
                throw;
            }
        }

        #region Private methods for file system storage

        /// <summary>
        /// Registers a model in the file system
        /// </summary>
        private async Task RegisterModelInFileSystemAsync(string modelName, string modelPath, ModelMetadata metadata)
        {
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
                _logger.LogError(ex, "Error validating model {ModelName} version {Version}", modelName, metadata.Version);
                File.Delete(metadata.StoragePath);
                throw;
            }
            
            // Update registry
            _activeModels[$"{modelName}_{metadata.Version}"] = metadata;
            await SaveRegistryAsync();
        }

        /// <summary>
        /// Saves the model registry to disk
        /// </summary>
        private async Task SaveRegistryAsync()
        {
            if (_storageType != MLOpsStorageType.FileSystem)
            {
                return;
            }
            
            var options = new JsonSerializerOptions { WriteIndented = true };
            var registryJson = JsonSerializer.Serialize(_activeModels, options);
            await File.WriteAllTextAsync(_modelRegistryPath, registryJson);
        }

        #endregion

        #region Private methods for SQL Database storage

        /// <summary>
        /// Ensures that the database schema exists
        /// </summary>
        private async Task EnsureDatabaseSchemaExists()
        {
            if (_storageType != MLOpsStorageType.SqlDatabase)
            {
                return;
            }
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            // Check if models table exists
            var tableExists = false;
            using (var cmd = new SqlCommand(
                @"SELECT COUNT(*) FROM INFORMATION_SCHEMA.TABLES 
                WHERE TABLE_SCHEMA = 'dbo' AND TABLE_NAME = 'ModelRegistry'", connection))
            {
                tableExists = (int)await cmd.ExecuteScalarAsync() > 0;
            }
            
            if (!tableExists)
            {
                // Create the table
                using var createTableCmd = new SqlCommand(
                    @"CREATE TABLE dbo.ModelRegistry (
                        Id INT IDENTITY(1,1) PRIMARY KEY,
                        ModelName NVARCHAR(100) NOT NULL,
                        Version NVARCHAR(50) NOT NULL,
                        StoragePath NVARCHAR(500) NOT NULL,
                        RegisteredTimestamp DATETIME2 NOT NULL,
                        LastMetricsUpdate DATETIME2 NULL,
                        IsActive BIT NOT NULL,
                        InputFeatures NVARCHAR(MAX) NULL,
                        OutputFeatures NVARCHAR(MAX) NULL,
                        Metrics NVARCHAR(MAX) NULL,
                        CONSTRAINT UC_ModelRegistry_ModelName_Version UNIQUE (ModelName, Version)
                    )", connection);
                await createTableCmd.ExecuteNonQueryAsync();
                
                _logger.LogInformation("Created ModelRegistry table in database");
            }
        }

        /// <summary>
        /// Loads all models from the database into memory cache
        /// </summary>
        private async Task LoadRegistryFromStorage()
        {
            if (_storageType != MLOpsStorageType.SqlDatabase)
            {
                return;
            }
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            using var cmd = new SqlCommand("SELECT * FROM dbo.ModelRegistry", connection);
            using var reader = await cmd.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                var model = new ModelMetadata
                {
                    Name = reader["ModelName"].ToString(),
                    Version = reader["Version"].ToString(),
                    StoragePath = reader["StoragePath"].ToString(),
                    RegisteredTimestamp = (DateTime)reader["RegisteredTimestamp"],
                    IsActive = (bool)reader["IsActive"],
                    InputFeatures = DeserializeStringList(reader["InputFeatures"]),
                    OutputFeatures = DeserializeStringList(reader["OutputFeatures"]),
                    Metrics = DeserializeMetrics(reader["Metrics"])
                };
                
                if (reader["LastMetricsUpdate"] != DBNull.Value)
                {
                    model.LastMetricsUpdate = (DateTime)reader["LastMetricsUpdate"];
                }
                
                _activeModels[$"{model.Name}_{model.Version}"] = model;
            }
            
            _logger.LogInformation("Loaded {Count} models from database", _activeModels.Count);
        }

        /// <summary>
        /// Gets the active model for a given model name from the database
        /// </summary>
        private async Task<ModelMetadata> GetActiveModelFromDatabaseAsync(string modelName)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            using var cmd = new SqlCommand(
                "SELECT * FROM dbo.ModelRegistry WHERE ModelName = @ModelName AND IsActive = 1", connection);
            cmd.Parameters.AddWithValue("@ModelName", modelName);
            
            using var reader = await cmd.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var model = new ModelMetadata
                {
                    Name = reader["ModelName"].ToString(),
                    Version = reader["Version"].ToString(),
                    StoragePath = reader["StoragePath"].ToString(),
                    RegisteredTimestamp = (DateTime)reader["RegisteredTimestamp"],
                    IsActive = (bool)reader["IsActive"],
                    InputFeatures = DeserializeStringList(reader["InputFeatures"]),
                    OutputFeatures = DeserializeStringList(reader["OutputFeatures"]),
                    Metrics = DeserializeMetrics(reader["Metrics"])
                };
                
                if (reader["LastMetricsUpdate"] != DBNull.Value)
                {
                    model.LastMetricsUpdate = (DateTime)reader["LastMetricsUpdate"];
                }
                
                return model;
            }
            
            return null;
        }

        /// <summary>
        /// Gets all versions of a model from the database
        /// </summary>
        private async Task<IEnumerable<ModelMetadata>> GetModelVersionsFromDatabaseAsync(string modelName)
        {
            var models = new List<ModelMetadata>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            using var cmd = new SqlCommand(
                "SELECT * FROM dbo.ModelRegistry WHERE ModelName = @ModelName", connection);
            cmd.Parameters.AddWithValue("@ModelName", modelName);
            
            using var reader = await cmd.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                var model = new ModelMetadata
                {
                    Name = reader["ModelName"].ToString(),
                    Version = reader["Version"].ToString(),
                    StoragePath = reader["StoragePath"].ToString(),
                    RegisteredTimestamp = (DateTime)reader["RegisteredTimestamp"],
                    IsActive = (bool)reader["IsActive"],
                    InputFeatures = DeserializeStringList(reader["InputFeatures"]),
                    OutputFeatures = DeserializeStringList(reader["OutputFeatures"]),
                    Metrics = DeserializeMetrics(reader["Metrics"])
                };
                
                if (reader["LastMetricsUpdate"] != DBNull.Value)
                {
                    model.LastMetricsUpdate = (DateTime)reader["LastMetricsUpdate"];
                }
                
                models.Add(model);
            }
            
            return models;
        }

        /// <summary>
        /// Registers a model in the database
        /// </summary>
        private async Task RegisterModelInDatabaseAsync(string modelName, string modelPath, ModelMetadata metadata)
        {
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
                _logger.LogError(ex, "Error validating model {ModelName} version {Version}", modelName, metadata.Version);
                File.Delete(metadata.StoragePath);
                throw;
            }
            
            // First deactivate all existing versions of this model
            using (var connection = new SqlConnection(_connectionString))
            {
                await connection.OpenAsync();
                
                using var deactivateCmd = new SqlCommand(
                    "UPDATE dbo.ModelRegistry SET IsActive = 0 WHERE ModelName = @ModelName", connection);
                deactivateCmd.Parameters.AddWithValue("@ModelName", modelName);
                await deactivateCmd.ExecuteNonQueryAsync();
                
                // Now insert the new model
                using var insertCmd = new SqlCommand(
                    @"INSERT INTO dbo.ModelRegistry 
                      (ModelName, Version, StoragePath, RegisteredTimestamp, IsActive, InputFeatures, OutputFeatures, Metrics) 
                      VALUES (@ModelName, @Version, @StoragePath, @RegisteredTimestamp, @IsActive, @InputFeatures, @OutputFeatures, @Metrics)",
                    connection);
                
                insertCmd.Parameters.AddWithValue("@ModelName", metadata.Name);
                insertCmd.Parameters.AddWithValue("@Version", metadata.Version);
                insertCmd.Parameters.AddWithValue("@StoragePath", metadata.StoragePath);
                insertCmd.Parameters.AddWithValue("@RegisteredTimestamp", metadata.RegisteredTimestamp);
                insertCmd.Parameters.AddWithValue("@IsActive", metadata.IsActive);
                insertCmd.Parameters.AddWithValue("@InputFeatures", JsonSerializer.Serialize(metadata.InputFeatures));
                insertCmd.Parameters.AddWithValue("@OutputFeatures", JsonSerializer.Serialize(metadata.OutputFeatures));
                insertCmd.Parameters.AddWithValue("@Metrics", JsonSerializer.Serialize(metadata.Metrics));
                
                await insertCmd.ExecuteNonQueryAsync();
            }
            
            // Update local cache
            _activeModels[$"{metadata.Name}_{metadata.Version}"] = metadata;
        }

        /// <summary>
        /// Activates a model version in the database
        /// </summary>
        private async Task ActivateModelVersionInDatabaseAsync(string modelName, string version)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            // First deactivate all versions
            using (var deactivateCmd = new SqlCommand(
                "UPDATE dbo.ModelRegistry SET IsActive = 0 WHERE ModelName = @ModelName", connection))
            {
                deactivateCmd.Parameters.AddWithValue("@ModelName", modelName);
                await deactivateCmd.ExecuteNonQueryAsync();
            }
            
            // Then activate the specific version
            using (var activateCmd = new SqlCommand(
                "UPDATE dbo.ModelRegistry SET IsActive = 1 WHERE ModelName = @ModelName AND Version = @Version", connection))
            {
                activateCmd.Parameters.AddWithValue("@ModelName", modelName);
                activateCmd.Parameters.AddWithValue("@Version", version);
                await activateCmd.ExecuteNonQueryAsync();
            }
        }

        /// <summary>
        /// Saves metrics for a model to the database
        /// </summary>
        private async Task SaveMetricsToDatabase(ModelMetadata model)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            using var cmd = new SqlCommand(
                @"UPDATE dbo.ModelRegistry 
                  SET Metrics = @Metrics, LastMetricsUpdate = @LastMetricsUpdate 
                  WHERE ModelName = @ModelName AND Version = @Version", connection);
            
            cmd.Parameters.AddWithValue("@Metrics", JsonSerializer.Serialize(model.Metrics));
            cmd.Parameters.AddWithValue("@LastMetricsUpdate", model.LastMetricsUpdate ?? DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModelName", model.Name);
            cmd.Parameters.AddWithValue("@Version", model.Version);
            
            await cmd.ExecuteNonQueryAsync();
        }

        /// <summary>
        /// Helper to deserialize a JSON string to a list of strings
        /// </summary>
        private List<string> DeserializeStringList(object dbValue)
        {
            if (dbValue == null || dbValue == DBNull.Value)
            {
                return new List<string>();
            }
            
            try
            {
                return JsonSerializer.Deserialize<List<string>>(dbValue.ToString());
            }
            catch
            {
                return new List<string>();
            }
        }

        /// <summary>
        /// Helper to deserialize a JSON string to a dictionary
        /// </summary>
        private Dictionary<string, double> DeserializeMetrics(object dbValue)
        {
            if (dbValue == null || dbValue == DBNull.Value)
            {
                return new Dictionary<string, double>();
            }
            
            try
            {
                return JsonSerializer.Deserialize<Dictionary<string, double>>(dbValue.ToString());
            }
            catch
            {
                return new Dictionary<string, double>();
            }
        }

        #endregion

        #region Private methods for Azure ML Registry storage

        // Load models from Azure ML Registry (stub for now)
        private async Task<IEnumerable<ModelMetadata>> GetModelVersionsFromAzureMLAsync(string modelName)
        {
            _logger.LogWarning("Azure ML Registry integration not implemented - falling back to file system");
            return _activeModels.Values.Where(m => m.Name == modelName);
        }
        
        // Get active model from Azure ML Registry (stub for now)
        private async Task<ModelMetadata> GetActiveModelFromAzureMLAsync(string modelName)
        {
            _logger.LogWarning("Azure ML Registry integration not implemented - falling back to file system");
            return _activeModels.Values.FirstOrDefault(m => m.Name == modelName && m.IsActive);
        }
        
        // Register model in Azure ML (stub for now)
        private async Task RegisterModelInAzureMLAsync(string modelName, string modelPath, ModelMetadata metadata)
        {
            _logger.LogWarning("Azure ML Registry integration not implemented - falling back to file system");
            await RegisterModelInFileSystemAsync(modelName, modelPath, metadata);
        }
        
        // Activate model in Azure ML (stub for now)
        private async Task ActivateModelVersionInAzureMLAsync(string modelName, string version)
        {
            _logger.LogWarning("Azure ML Registry integration not implemented - falling back to file system");
            
            // Deactivate all versions in memory
            var models = _activeModels.Values.Where(m => m.Name == modelName).ToList();
            foreach (var m in models)
            {
                m.IsActive = false;
            }
            
            // Activate requested version in memory
            var model = models.FirstOrDefault(m => m.Version == version);
            if (model != null)
            {
                model.IsActive = true;
            }
            
            // Save to file
            await SaveRegistryAsync();
        }
        
        // Save metrics to Azure ML (stub for now)
        private async Task SaveMetricsToAzureML(ModelMetadata model)
        {
            _logger.LogWarning("Azure ML Registry integration not implemented - falling back to file system");
            await SaveRegistryAsync();
        }

        #endregion
        
        /// <summary>
        /// Load models from the appropriate storage
        /// </summary>
        private async Task LoadRegistryFromStorage()
        {
            switch (_storageType)
            {
                case MLOpsStorageType.SqlDatabase:
                    await LoadRegistryFromStorage();
                    break;
                case MLOpsStorageType.AzureML:
                    // In a real implementation, this would load metadata from Azure ML
                    _logger.LogWarning("Azure ML integration not fully implemented - using local cache");
                    break;
            }
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

    /// <summary>
    /// Storage types for MLOps service
    /// </summary>
    public enum MLOpsStorageType
    {
        FileSystem,
        SqlDatabase,
        AzureML,
        // Could add other types like AzureBlobStorage, AWS S3, etc.
    }
}