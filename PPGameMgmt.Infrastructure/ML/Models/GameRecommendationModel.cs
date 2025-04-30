using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.ML;
using Microsoft.ML.Data;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Recommendations;

namespace PPGameMgmt.Infrastructure.ML.Models
{
    public class GameRecommendationModel
    {
        public const string MODEL_NAME = "game_recommendation_model";

        private readonly ILogger<GameRecommendationModel> _logger;
        private MLContext _mlContext;
        private ITransformer? _model;
        private string _modelPath;
        private bool _isInitialized = false;

        public GameRecommendationModel(ILogger<GameRecommendationModel> logger)
        {
            _logger = logger;
            _mlContext = new MLContext(seed: 42);
            _modelPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "ML", "Models", "game_recommendation_model.zip");
        }

        public async Task<bool> InitializeAsync()
        {
            try
            {
                _logger.LogInformation("Initializing game recommendation model");

                if (File.Exists(_modelPath))
                {
                    _logger.LogInformation($"Loading model from: {_modelPath}");
                    _model = await Task.Run(() => _mlContext.Model.Load(_modelPath, out _));
                    _isInitialized = true;
                    _logger.LogInformation("Game recommendation model loaded successfully");
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
                _logger.LogError(ex, "Error initializing game recommendation model");
                return false;
            }
        }

        public async Task<List<GameRecommendation>> GetRecommendationsAsync(string playerId, PlayerFeatures playerFeatures, int maxRecommendations = 5)
        {
            if (!_isInitialized)
            {
                _logger.LogWarning("Model not initialized. Cannot generate recommendations");
                return new List<GameRecommendation>();
            }

            try
            {
                _logger.LogInformation($"Generating game recommendations for player: {playerId}");

                // Create prediction engine
                var predictionEngine = _mlContext.Model.CreatePredictionEngine<PlayerFeatureInput, GameRecommendationPrediction>(_model);

                // Convert player features to input format
                var input = new PlayerFeatureInput
                {
                    PlayerId = playerId,
                    DaysSinceRegistration = playerFeatures.DaysSinceRegistration,
                    FavoriteGameTypeIndex = (int?)playerFeatures.FavoriteGameType ?? -1,
                    AverageBetSize = (float)playerFeatures.AverageBetSize,
                    SessionsPerWeek = (float)playerFeatures.SessionsPerWeek,
                    SessionFrequency = (float)playerFeatures.SessionFrequency,
                    CountryCode = playerFeatures.Country,
                    PreferredDevice = playerFeatures.PreferredDevice,
                    AverageSessionDurationMinutes = (float)playerFeatures.AverageSessionLengthMinutes
                };

                // Get prediction
                var prediction = await Task.Run(() => predictionEngine.Predict(input));

                // Convert prediction to recommendations
                var recommendations = new List<GameRecommendation>();
                for (int i = 0; i < Math.Min(maxRecommendations, prediction.GameIds.Length); i++)
                {
                    recommendations.Add(new GameRecommendation
                    {
                        Id = Guid.NewGuid().ToString(),
                        PlayerId = playerId,
                        GameId = prediction.GameIds[i],
                        Score = prediction.Scores[i],
                        RecommendationDate = DateTime.UtcNow,
                        Reason = "ML-based recommendation"
                    });
                }

                _logger.LogInformation($"Generated {recommendations.Count} game recommendations for player: {playerId}");
                return recommendations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating game recommendations for player: {playerId}");
                return new List<GameRecommendation>();
            }
        }

        public class PlayerFeatureInput
        {
            [LoadColumn(0)]
            public required string PlayerId { get; set; }

            [LoadColumn(1)]
            public int DaysSinceRegistration { get; set; }

            [LoadColumn(2)]
            public int FavoriteGameTypeIndex { get; set; }

            [LoadColumn(3)]
            public float AverageBetSize { get; set; }

            [LoadColumn(4)]
            public float SessionsPerWeek { get; set; }

            [LoadColumn(5)]
            public float SessionFrequency { get; set; }

            [LoadColumn(6)]
            public required string CountryCode { get; set; }

            [LoadColumn(7)]
            public required string PreferredDevice { get; set; }

            [LoadColumn(8)]
            public float AverageSessionDurationMinutes { get; set; }
        }

        public class GameRecommendationPrediction
        {
            [VectorType(10)]
            public string[] GameIds { get; set; } = Array.Empty<string>();

            [VectorType(10)]
            public float[] Scores { get; set; } = Array.Empty<float>();
        }
    }
}