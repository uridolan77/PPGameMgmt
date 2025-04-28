using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.Extensions.Configuration;
using System.Data.SqlClient;
using System.Data;
using Azure.Identity;
using Azure.Core;
using System.Net.Http.Json;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Entities;
using CoreModelMetadata = PPGameMgmt.Core.Entities.ModelMetadata;

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
        private readonly Dictionary<string, CoreModelMetadata> _activeModels = new();
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
                        var registry = JsonSerializer.Deserialize<Dictionary<string, CoreModelMetadata>>(registryJson);
                        
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
        public async Task<CoreModelMetadata> RegisterModelAsync(string modelName, string modelPath, string? version = null)
        {
            if (string.IsNullOrEmpty(modelName))
                throw new ArgumentNullException(nameof(modelName));
            
            if (string.IsNullOrEmpty(modelPath) || !File.Exists(modelPath))
                throw new ArgumentException("Model file does not exist", nameof(modelPath));

            // Generate version if not provided
            version ??= DateTime.UtcNow.ToString("yyyyMMdd-HHmmss");
            
            // Create model metadata
            var metadata = new CoreModelMetadata
            {
                Id = Guid.NewGuid(),
                ModelName = modelName,
                Version = version,
                ModelPath = Path.Combine(_modelStoragePath, $"{modelName}-{version}.onnx"),
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
                .FirstOrDefault(m => m.ModelName == modelName && m.IsActive);
                
            if (activeModel != null)
            {
                return activeModel.ModelPath;
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
                    return activeModel.ModelPath;
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
        public IEnumerable<CoreModelMetadata> GetModelVersions(string modelName)
        {
            // First check in-memory cache
            var modelsFromCache = _activeModels.Values
                .Where(m => m.ModelName == modelName)
                .ToList();
                
            if (modelsFromCache.Any())
            {
                return modelsFromCache.OrderByDescending(m => m.RegisteredTimestamp);
            }
            
            // If not in cache, try to pull from storage (async here would be better, but interface constraint)
            try
            {
                IEnumerable<CoreModelMetadata> models = null;
                
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
                        var key = $"{model.ModelName}_{model.Version}";
                        _activeModels[key] = model;
                    }
                    
                    return models.OrderByDescending(m => m.RegisteredTimestamp);
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving model versions for {ModelName}", modelName);
            }
            
            return Enumerable.Empty<CoreModelMetadata>();
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
                foreach (var m in _activeModels.Values.Where(m => m.ModelName == modelName))
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
                    .FirstOrDefault(m => m.ModelName == modelName && m.IsActive);
                    
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
                    _activeModels[$"{activeModel.ModelName}_{activeModel.Version}"] = activeModel;
                }
                
                // Update metrics
                foreach (var (key, value) in metrics)
                {
                    activeModel.Metrics[key] = value;
                }
                
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
        private async Task RegisterModelInFileSystemAsync(string modelName, string modelPath, CoreModelMetadata metadata)
        {
            // Copy model file to storage
            File.Copy(modelPath, metadata.ModelPath, overwrite: true);
            
            // Validate the model by trying to create a session
            try
            {
                using var session = new InferenceSession(metadata.ModelPath);
                // Note: We can't store InputFeatures and OutputFeatures as they were previously internal properties
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating model {ModelName} version {Version}", modelName, metadata.Version);
                File.Delete(metadata.ModelPath);
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
                        Id UNIQUEIDENTIFIER PRIMARY KEY,
                        ModelName NVARCHAR(100) NOT NULL,
                        Version NVARCHAR(50) NOT NULL,
                        ModelPath NVARCHAR(500) NOT NULL,
                        RegisteredTimestamp DATETIME2 NOT NULL,
                        LastMetricsUpdate DATETIME2 NULL,
                        IsActive BIT NOT NULL,
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
                var model = new CoreModelMetadata
                {
                    Id = (Guid)reader["Id"],
                    ModelName = reader["ModelName"].ToString(),
                    Version = reader["Version"].ToString(),
                    ModelPath = reader["ModelPath"].ToString(),
                    RegisteredTimestamp = (DateTime)reader["RegisteredTimestamp"],
                    IsActive = (bool)reader["IsActive"],
                    Metrics = DeserializeMetrics(reader["Metrics"])
                };
                
                if (reader["LastMetricsUpdate"] != DBNull.Value)
                {
                    // Use reflection to set LastMetricsUpdate if the property exists
                    var property = typeof(CoreModelMetadata).GetProperty("LastMetricsUpdate");
                    if (property != null)
                    {
                        property.SetValue(model, (DateTime)reader["LastMetricsUpdate"]);
                    }
                }
                
                _activeModels[$"{model.ModelName}_{model.Version}"] = model;
            }
            
            _logger.LogInformation("Loaded {Count} models from database", _activeModels.Count);
        }

        /// <summary>
        /// Gets the active model for a given model name from the database
        /// </summary>
        private async Task<CoreModelMetadata> GetActiveModelFromDatabaseAsync(string modelName)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            using var cmd = new SqlCommand(
                "SELECT * FROM dbo.ModelRegistry WHERE ModelName = @ModelName AND IsActive = 1", connection);
            cmd.Parameters.AddWithValue("@ModelName", modelName);
            
            using var reader = await cmd.ExecuteReaderAsync();
            
            if (await reader.ReadAsync())
            {
                var model = new CoreModelMetadata
                {
                    Id = (Guid)reader["Id"],
                    ModelName = reader["ModelName"].ToString(),
                    Version = reader["Version"].ToString(),
                    ModelPath = reader["ModelPath"].ToString(),
                    RegisteredTimestamp = (DateTime)reader["RegisteredTimestamp"],
                    IsActive = (bool)reader["IsActive"],
                    Metrics = DeserializeMetrics(reader["Metrics"])
                };
                
                if (reader["LastMetricsUpdate"] != DBNull.Value)
                {
                    // Use reflection to set LastMetricsUpdate if the property exists
                    var property = typeof(CoreModelMetadata).GetProperty("LastMetricsUpdate");
                    if (property != null)
                    {
                        property.SetValue(model, (DateTime)reader["LastMetricsUpdate"]);
                    }
                }
                
                return model;
            }
            
            return null;
        }

        /// <summary>
        /// Gets all versions of a model from the database
        /// </summary>
        private async Task<IEnumerable<CoreModelMetadata>> GetModelVersionsFromDatabaseAsync(string modelName)
        {
            var models = new List<CoreModelMetadata>();
            
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            using var cmd = new SqlCommand(
                "SELECT * FROM dbo.ModelRegistry WHERE ModelName = @ModelName", connection);
            cmd.Parameters.AddWithValue("@ModelName", modelName);
            
            using var reader = await cmd.ExecuteReaderAsync();
            
            while (await reader.ReadAsync())
            {
                var model = new CoreModelMetadata
                {
                    Id = (Guid)reader["Id"],
                    ModelName = reader["ModelName"].ToString(),
                    Version = reader["Version"].ToString(),
                    ModelPath = reader["ModelPath"].ToString(),
                    RegisteredTimestamp = (DateTime)reader["RegisteredTimestamp"],
                    IsActive = (bool)reader["IsActive"],
                    Metrics = DeserializeMetrics(reader["Metrics"])
                };
                
                if (reader["LastMetricsUpdate"] != DBNull.Value)
                {
                    // Use reflection to set LastMetricsUpdate if the property exists
                    var property = typeof(CoreModelMetadata).GetProperty("LastMetricsUpdate");
                    if (property != null)
                    {
                        property.SetValue(model, (DateTime)reader["LastMetricsUpdate"]);
                    }
                }
                
                models.Add(model);
            }
            
            return models;
        }

        /// <summary>
        /// Registers a model in the database
        /// </summary>
        private async Task RegisterModelInDatabaseAsync(string modelName, string modelPath, CoreModelMetadata metadata)
        {
            // Copy model file to storage
            File.Copy(modelPath, metadata.ModelPath, overwrite: true);
            
            // Validate the model by trying to create a session
            try
            {
                using var session = new InferenceSession(metadata.ModelPath);
                // We no longer store InputFeatures and OutputFeatures as they were internal properties
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error validating model {ModelName} version {Version}", modelName, metadata.Version);
                File.Delete(metadata.ModelPath);
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
                      (Id, ModelName, Version, ModelPath, RegisteredTimestamp, IsActive, Metrics) 
                      VALUES (@Id, @ModelName, @Version, @ModelPath, @RegisteredTimestamp, @IsActive, @Metrics)",
                    connection);
                
                insertCmd.Parameters.AddWithValue("@Id", metadata.Id);
                insertCmd.Parameters.AddWithValue("@ModelName", metadata.ModelName);
                insertCmd.Parameters.AddWithValue("@Version", metadata.Version);
                insertCmd.Parameters.AddWithValue("@ModelPath", metadata.ModelPath);
                insertCmd.Parameters.AddWithValue("@RegisteredTimestamp", metadata.RegisteredTimestamp);
                insertCmd.Parameters.AddWithValue("@IsActive", metadata.IsActive);
                insertCmd.Parameters.AddWithValue("@Metrics", JsonSerializer.Serialize(metadata.Metrics));
                
                await insertCmd.ExecuteNonQueryAsync();
            }
            
            // Update local cache
            _activeModels[$"{metadata.ModelName}_{metadata.Version}"] = metadata;
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
        private async Task SaveMetricsToDatabase(CoreModelMetadata model)
        {
            using var connection = new SqlConnection(_connectionString);
            await connection.OpenAsync();
            
            using var cmd = new SqlCommand(
                @"UPDATE dbo.ModelRegistry 
                  SET Metrics = @Metrics, LastMetricsUpdate = @LastMetricsUpdate 
                  WHERE ModelName = @ModelName AND Version = @Version", connection);
            
            cmd.Parameters.AddWithValue("@Metrics", JsonSerializer.Serialize(model.Metrics));
            cmd.Parameters.AddWithValue("@LastMetricsUpdate", DateTime.UtcNow);
            cmd.Parameters.AddWithValue("@ModelName", model.ModelName);
            cmd.Parameters.AddWithValue("@Version", model.Version);
            
            await cmd.ExecuteNonQueryAsync();
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

        /// <summary>
        /// Gets authentication token for Azure ML API calls
        /// </summary>
        private async Task<string> GetAzureMLTokenAsync()
        {
            try
            {
                var credential = new DefaultAzureCredential();
                var tokenRequestContext = new TokenRequestContext(new[] { "https://management.azure.com/.default" });
                var token = await credential.GetTokenAsync(tokenRequestContext);
                return token.Token;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to get Azure ML authentication token");
                throw;
            }
        }

        /// <summary>
        /// Gets Azure ML API client with proper authorization
        /// </summary>
        private async Task<HttpClient> GetAzureMLClientAsync()
        {
            var client = new HttpClient();
            string token = await GetAzureMLTokenAsync();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            return client;
        }

        /// <summary>
        /// Load models from Azure ML Registry
        /// </summary>
        private async Task<IEnumerable<CoreModelMetadata>> GetModelVersionsFromAzureMLAsync(string modelName)
        {
            try
            {
                var client = await GetAzureMLClientAsync();
                
                // API URL for listing models
                string url = $"https://management.azure.com/subscriptions/{_azureSubscriptionId}/resourceGroups/{_azureResourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/{_azureMLWorkspace}/models?api-version=2022-10-01";
                
                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to get models from Azure ML: {StatusCode} - {Content}", 
                        response.StatusCode, await response.Content.ReadAsStringAsync());
                    return Enumerable.Empty<CoreModelMetadata>();
                }
                
                var content = await response.Content.ReadFromJsonAsync<AzureMLModelListResponse>();
                var models = new List<CoreModelMetadata>();
                
                // Filter models by name
                foreach (var azureModel in content.Value)
                {
                    if (azureModel.Name.StartsWith(modelName))
                    {
                        // Get model details
                        var detailsUrl = $"https://management.azure.com{azureModel.Id}?api-version=2022-10-01";
                        var detailsResponse = await client.GetAsync(detailsUrl);
                        
                        if (detailsResponse.IsSuccessStatusCode)
                        {
                            var modelDetails = await detailsResponse.Content.ReadFromJsonAsync<AzureMLModelDetails>();
                            
                            // Map Azure ML model to our metadata format
                            var metadata = new CoreModelMetadata
                            {
                                Id = Guid.NewGuid(),
                                ModelName = modelName,
                                Version = azureModel.Version,
                                ModelPath = await DownloadAndCacheModelIfNeeded(modelName, azureModel.Version, modelDetails),
                                RegisteredTimestamp = DateTimeOffset.Parse(azureModel.CreatedTime).DateTime,
                                IsActive = azureModel.Properties.ContainsKey("IsActive") && 
                                           bool.Parse(azureModel.Properties["IsActive"])
                            };
                            
                            if (azureModel.Properties.ContainsKey("Metrics"))
                            {
                                metadata.Metrics = JsonSerializer.Deserialize<Dictionary<string, double>>(
                                    azureModel.Properties["Metrics"]);
                            }
                            
                            models.Add(metadata);
                        }
                    }
                }
                
                return models;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting model versions from Azure ML");
                return Enumerable.Empty<CoreModelMetadata>();
            }
        }
        
        /// <summary>
        /// Get active model from Azure ML Registry
        /// </summary>
        private async Task<CoreModelMetadata> GetActiveModelFromAzureMLAsync(string modelName)
        {
            try
            {
                var models = await GetModelVersionsFromAzureMLAsync(modelName);
                return models.FirstOrDefault(m => m.IsActive);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error getting active model from Azure ML");
                return null;
            }
        }
        
        /// <summary>
        /// Register model in Azure ML
        /// </summary>
        private async Task RegisterModelInAzureMLAsync(string modelName, string modelPath, CoreModelMetadata metadata)
        {
            try
            {
                var client = await GetAzureMLClientAsync();
                
                // Step 1: Create a storage location in Azure ML workspace
                string uploadUrl = await CreateAzureMLModelUploadUrlAsync(client, modelName, metadata.Version);
                
                // Step 2: Upload the model file
                await UploadModelFileAsync(uploadUrl, modelPath);
                
                // Step 3: Register the model in Azure ML
                await CompleteModelRegistrationAsync(client, modelName, metadata);
                
                // Step 4: Copy the model locally for fast inference
                File.Copy(modelPath, metadata.ModelPath, overwrite: true);
                
                // Step 5: Validate the model by trying to create a session
                using var session = new InferenceSession(metadata.ModelPath);
                
                // Add to local cache
                _activeModels[$"{modelName}_{metadata.Version}"] = metadata;
                
                _logger.LogInformation("Successfully registered model in Azure ML: {ModelName} - {Version}", 
                    modelName, metadata.Version);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error registering model in Azure ML");
                throw;
            }
        }
        
        /// <summary>
        /// Activate a model version in Azure ML
        /// </summary>
        private async Task ActivateModelVersionInAzureMLAsync(string modelName, string version)
        {
            try
            {
                var client = await GetAzureMLClientAsync();
                
                // Get all models with this name
                var models = await GetModelVersionsFromAzureMLAsync(modelName);
                
                foreach (var model in models)
                {
                    // Construct API URL for updating model properties
                    string url = $"https://management.azure.com/subscriptions/{_azureSubscriptionId}/resourceGroups/{_azureResourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/{_azureMLWorkspace}/models/{modelName}/{model.Version}?api-version=2022-10-01";
                    
                    // Update the IsActive property
                    var properties = new Dictionary<string, string>
                    {
                        ["IsActive"] = (model.Version == version).ToString()
                    };
                    
                    var payload = new
                    {
                        properties = properties
                    };
                    
                    var response = await client.PatchAsync(url, 
                        new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));
                    
                    if (!response.IsSuccessStatusCode)
                    {
                        _logger.LogError("Failed to update model in Azure ML: {StatusCode} - {Content}", 
                            response.StatusCode, await response.Content.ReadAsStringAsync());
                    }
                    
                    // Update in-memory cache as well
                    if (_activeModels.ContainsKey($"{modelName}_{model.Version}"))
                    {
                        _activeModels[$"{modelName}_{model.Version}"].IsActive = (model.Version == version);
                    }
                }
                
                _logger.LogInformation("Activated model {ModelName} version {Version} in Azure ML", modelName, version);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error activating model in Azure ML");
                throw;
            }
        }
        
        /// <summary>
        /// Save metrics to Azure ML model
        /// </summary>
        private async Task SaveMetricsToAzureML(CoreModelMetadata model)
        {
            try
            {
                var client = await GetAzureMLClientAsync();
                
                // Construct API URL for updating model properties
                string url = $"https://management.azure.com/subscriptions/{_azureSubscriptionId}/resourceGroups/{_azureResourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/{_azureMLWorkspace}/models/{model.ModelName}/{model.Version}?api-version=2022-10-01";
                
                // Update properties with metrics
                var properties = new Dictionary<string, string>
                {
                    ["Metrics"] = JsonSerializer.Serialize(model.Metrics),
                    ["LastMetricsUpdate"] = DateTime.UtcNow.ToString("o")
                };
                
                var payload = new
                {
                    properties = properties
                };
                
                var response = await client.PatchAsync(url, 
                    new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));
                
                if (!response.IsSuccessStatusCode)
                {
                    _logger.LogError("Failed to update model metrics in Azure ML: {StatusCode} - {Content}", 
                        response.StatusCode, await response.Content.ReadAsStringAsync());
                    throw new InvalidOperationException("Failed to update model metrics in Azure ML");
                }
                
                _logger.LogInformation("Updated metrics for model {ModelName} version {Version} in Azure ML", 
                    model.ModelName, model.Version);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving metrics to Azure ML");
                throw;
            }
        }
        
        /// <summary>
        /// Helper method to create upload URL in Azure ML
        /// </summary>
        private async Task<string> CreateAzureMLModelUploadUrlAsync(HttpClient client, string modelName, string version)
        {
            string url = $"https://management.azure.com/subscriptions/{_azureSubscriptionId}/resourceGroups/{_azureResourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/{_azureMLWorkspace}/models/{modelName}/versions/{version}/uploadUrl?api-version=2022-10-01";
            
            var response = await client.PostAsync(url, null);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to create upload URL in Azure ML: {StatusCode} - {Content}", 
                    response.StatusCode, await response.Content.ReadAsStringAsync());
                throw new InvalidOperationException("Failed to create upload URL in Azure ML");
            }
            
            var content = await response.Content.ReadFromJsonAsync<AzureMLUploadUrlResponse>();
            return content.UploadUrl;
        }
        
        /// <summary>
        /// Upload model file to Azure ML storage
        /// </summary>
        private async Task UploadModelFileAsync(string uploadUrl, string modelPath)
        {
            using var client = new HttpClient();
            using var fileStream = new FileStream(modelPath, FileMode.Open, FileAccess.Read);
            
            var request = new HttpRequestMessage(HttpMethod.Put, uploadUrl);
            request.Content = new StreamContent(fileStream);
            request.Content.Headers.ContentType = new MediaTypeHeaderValue("application/octet-stream");
            
            var response = await client.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to upload model file: {StatusCode} - {Content}", 
                    response.StatusCode, await response.Content.ReadAsStringAsync());
                throw new InvalidOperationException("Failed to upload model file");
            }
        }
        
        /// <summary>
        /// Complete model registration in Azure ML after upload
        /// </summary>
        private async Task CompleteModelRegistrationAsync(HttpClient client, string modelName, CoreModelMetadata metadata)
        {
            string url = $"https://management.azure.com/subscriptions/{_azureSubscriptionId}/resourceGroups/{_azureResourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/{_azureMLWorkspace}/models/{modelName}/versions/{metadata.Version}?api-version=2022-10-01";
            
            var properties = new Dictionary<string, string>
            {
                ["IsActive"] = metadata.IsActive.ToString(),
                ["RegisteredTimestamp"] = metadata.RegisteredTimestamp.ToString("o")
            };
            
            var payload = new
            {
                properties = properties,
                modelType = "ONNX"
            };
            
            var response = await client.PutAsync(url, 
                new StringContent(JsonSerializer.Serialize(payload), Encoding.UTF8, "application/json"));
            
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to complete model registration in Azure ML: {StatusCode} - {Content}", 
                    response.StatusCode, await response.Content.ReadAsStringAsync());
                throw new InvalidOperationException("Failed to complete model registration in Azure ML");
            }
        }
        
        /// <summary>
        /// Download model from Azure ML and cache locally for fast inference
        /// </summary>
        private async Task<string> DownloadAndCacheModelIfNeeded(string modelName, string version, AzureMLModelDetails details)
        {
            string localPath = Path.Combine(_modelStoragePath, $"{modelName}-{version}.onnx");
            
            // If file already exists, don't download again
            if (File.Exists(localPath))
            {
                return localPath;
            }
            
            // Get download URL from Azure ML
            using var client = await GetAzureMLClientAsync();
            string url = $"https://management.azure.com/subscriptions/{_azureSubscriptionId}/resourceGroups/{_azureResourceGroup}/providers/Microsoft.MachineLearningServices/workspaces/{_azureMLWorkspace}/models/{modelName}/versions/{version}/downloadUrl?api-version=2022-10-01";
            
            var response = await client.PostAsync(url, null);
            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Failed to get download URL from Azure ML: {StatusCode} - {Content}", 
                    response.StatusCode, await response.Content.ReadAsStringAsync());
                throw new InvalidOperationException("Failed to get download URL from Azure ML");
            }
            
            var content = await response.Content.ReadFromJsonAsync<AzureMLDownloadUrlResponse>();
            string downloadUrl = content.DownloadUrl;
            
            // Download the file
            using var downloadClient = new HttpClient();
            using var downloadStream = await downloadClient.GetStreamAsync(downloadUrl);
            using var fileStream = File.Create(localPath);
            await downloadStream.CopyToAsync(fileStream);
            
            return localPath;
        }

        #endregion
        
        /// <summary>
        /// Load models from the appropriate storage
        /// </summary>
        private async Task LoadModelsFromStorage()
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

/// <summary>
/// Helper classes for Azure ML API responses
/// </summary>
public class AzureMLModelListResponse
{
    public List<AzureMLModelItem> Value { get; set; } = new();
}

public class AzureMLModelItem
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Version { get; set; }
    public string CreatedTime { get; set; }
    public Dictionary<string, string> Properties { get; set; } = new();
}

public class AzureMLModelDetails
{
    public string Id { get; set; }
    public string Name { get; set; }
    public string Version { get; set; }
    public string Description { get; set; }
    public Dictionary<string, string> Properties { get; set; } = new();
    public string ModelUri { get; set; }
}

public class AzureMLUploadUrlResponse
{
    public string UploadUrl { get; set; }
    public string ExpiryTime { get; set; }
}

public class AzureMLDownloadUrlResponse
{
    public string DownloadUrl { get; set; }
    public string ExpiryTime { get; set; }
}