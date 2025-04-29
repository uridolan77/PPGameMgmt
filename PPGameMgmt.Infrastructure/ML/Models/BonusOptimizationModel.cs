using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.ML;
using Microsoft.ML.Data;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Infrastructure.ML.Models
{
    public class BonusOptimizationModel
    {
        private readonly ILogger<BonusOptimizationModel> _logger;
        private MLContext _mlContext;
        private ITransformer _model;
        private string _modelPath;
        private bool _isInitialized = false;

        public BonusOptimizationModel(ILogger<BonusOptimizationModel> logger)
        {
            _logger = logger;
            _mlContext = new MLContext(seed: 42);
            _modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ML", "Models", "bonus_optimization_model.zip");
        }

        public async Task<bool> InitializeAsync()
        {
            try
            {
                _logger.LogInformation("Initializing bonus optimization model");
                
                if (File.Exists(_modelPath))
                {
                    _logger.LogInformation($"Loading model from: {_modelPath}");
                    _model = await Task.Run(() => _mlContext.Model.Load(_modelPath, out _));
                    _isInitialized = true;
                    _logger.LogInformation("Bonus optimization model loaded successfully");
                }
                else
                {
                    _logger.LogWarning($"Model file not found at: {_modelPath}");
                    _isInitialized = false;
                }
                
                return _isInitialized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing bonus optimization model");
                return false;
            }
        }

        public async Task<List<BonusRecommendation>> GetRecommendationsAsync(string playerId, PlayerFeatures playerFeatures, List<Bonus> availableBonuses, int maxRecommendations = 3)
        {
            if (!_isInitialized)
            {
                _logger.LogWarning("Model not initialized. Cannot generate bonus recommendations");
                return new List<BonusRecommendation>();
            }

            try
            {
                _logger.LogInformation($"Generating bonus recommendations for player: {playerId}");
                
                // Create prediction engine
                var predictionEngine = _mlContext.Model.CreatePredictionEngine<PlayerBonusFeatureInput, BonusOptimizationPrediction>(_model);
                
                // Generate recommendations for each available bonus
                var recommendations = new List<BonusRecommendation>();
                foreach (var bonus in availableBonuses)
                {
                    // Convert player features to input format
                    var input = new PlayerBonusFeatureInput
                    {
                        PlayerId = playerId,
                        BonusId = bonus.Id,
                        BonusTypeIndex = (int)bonus.Type,
                        BonusAmount = (float)bonus.Amount,
                        WageringRequirement = bonus.WageringRequirement,
                        DepositFrequencyPerMonth = playerFeatures.DepositFrequencyPerMonth,
                        AverageDepositAmount = (float)playerFeatures.AverageDepositAmount,
                        DaysSinceRegistration = playerFeatures.DaysSinceRegistration,
                        PlayerLifetimeValue = (float)playerFeatures.PlayerLifetimeValue,
                        BonusUsageRate = (float)playerFeatures.BonusUsageRate,
                        TotalBonusesClaimed = playerFeatures.TotalBonusesClaimed,
                        PreferredBonusTypeIndex = (int?)playerFeatures.PreferredBonusType ?? -1
                    };
                    
                    // Get prediction
                    var prediction = await Task.Run(() => predictionEngine.Predict(input));
                    
                    // Add recommendation if score is above threshold
                    if (prediction.ConversionProbability > 0.3) // Threshold can be adjusted
                    {
                        recommendations.Add(new BonusRecommendation
                        {
                            Id = Guid.NewGuid().ToString(),
                            PlayerId = playerId,
                            BonusId = bonus.Id,
                            Score = prediction.ConversionProbability,
                            RecommendationDate = DateTime.UtcNow,
                            Reason = $"ML-based optimization (ROI: {prediction.ExpectedROI:P2})"
                        });
                    }
                }
                
                // Sort by score and take top recommendations
                recommendations.Sort((a, b) => b.Score.CompareTo(a.Score));
                var topRecommendations = recommendations.Count <= maxRecommendations ? 
                    recommendations : recommendations.GetRange(0, maxRecommendations);
                
                _logger.LogInformation($"Generated {topRecommendations.Count} bonus recommendations for player: {playerId}");
                return topRecommendations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating bonus recommendations for player: {playerId}");
                return new List<BonusRecommendation>();
            }
        }
        
        public class PlayerBonusFeatureInput
        {
            [LoadColumn(0)]
            public string PlayerId { get; set; }
            
            [LoadColumn(1)]
            public string BonusId { get; set; }
            
            [LoadColumn(2)]
            public int BonusTypeIndex { get; set; }
            
            [LoadColumn(3)]
            public float BonusAmount { get; set; }
            
            [LoadColumn(4)]
            public int WageringRequirement { get; set; }
            
            [LoadColumn(5)]
            public int DepositFrequencyPerMonth { get; set; }
            
            [LoadColumn(6)]
            public float AverageDepositAmount { get; set; }
            
            [LoadColumn(7)]
            public int DaysSinceRegistration { get; set; }
            
            [LoadColumn(8)]
            public float PlayerLifetimeValue { get; set; }
            
            [LoadColumn(9)]
            public float BonusUsageRate { get; set; }
            
            [LoadColumn(10)]
            public int TotalBonusesClaimed { get; set; }
            
            [LoadColumn(11)]
            public int PreferredBonusTypeIndex { get; set; }
        }
        
        public class BonusOptimizationPrediction
        {
            [ColumnName("PredictedLabel")]
            public bool WillClaim { get; set; }
            
            public float ConversionProbability { get; set; }
            
            public float ExpectedROI { get; set; }
        }
    }
}