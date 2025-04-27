using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.ML.OnnxRuntime;
using Microsoft.ML.OnnxRuntime.Tensors;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Infrastructure.ML.Models
{
    public class GameRecommendationModel
    {
        private readonly ILogger<GameRecommendationModel> _logger;
        private readonly IGameRepository _gameRepository;
        private InferenceSession _session;
        private readonly string _modelPath;
        private bool _isModelLoaded = false;
        private Dictionary<string, int> _gameIndexMap; // Maps game IDs to model output indices
        private List<string> _allGameIds; // All game IDs in order of model output

        public GameRecommendationModel(
            ILogger<GameRecommendationModel> logger,
            IGameRepository gameRepository,
            string modelPath = "ML/Models/game_recommendation_model.onnx")
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _gameRepository = gameRepository ?? throw new ArgumentNullException(nameof(gameRepository));
            _modelPath = modelPath ?? throw new ArgumentNullException(nameof(modelPath));
        }

        public async Task InitializeAsync()
        {
            try
            {
                _logger.LogInformation("Initializing Game Recommendation Model");
                
                // Load the ONNX model
                if (File.Exists(_modelPath))
                {
                    _session = new InferenceSession(_modelPath);
                    _isModelLoaded = true;
                    _logger.LogInformation($"Game Recommendation Model loaded successfully from {_modelPath}");
                }
                else
                {
                    _logger.LogWarning($"Game Recommendation Model not found at {_modelPath}. Using fallback recommendation logic.");
                }
                
                // Load all games and create game index mapping
                var allGames = await _gameRepository.GetAllAsync();
                _allGameIds = allGames.Where(g => g.IsActive).Select(g => g.Id).ToList();
                _gameIndexMap = new Dictionary<string, int>();
                
                for (int i = 0; i < _allGameIds.Count; i++)
                {
                    _gameIndexMap[_allGameIds[i]] = i;
                }
                
                _logger.LogInformation($"Game index mapping created for {_allGameIds.Count} active games");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing Game Recommendation Model");
                _isModelLoaded = false;
            }
        }

        public async Task<List<GameRecommendation>> PredictTopGamesAsync(PlayerFeatures features, int count = 5)
        {
            try
            {
                // Make sure we have initialized the model
                if (!_isModelLoaded)
                {
                    await InitializeAsync();
                    
                    // If initialization failed, use fallback recommendations
                    if (!_isModelLoaded)
                    {
                        return await GetFallbackRecommendations(features, count);
                    }
                }
                
                // Create input tensor from player features
                var inputTensor = CreateInputTensor(features);
                
                // Run inference
                var inputs = new List<NamedOnnxValue> { NamedOnnxValue.CreateFromTensor("input", inputTensor) };
                using var results = _session.Run(inputs);
                var scores = results.First().AsEnumerable<float>().ToList();
                
                // Convert scores to game recommendations
                var recommendedGames = await MapScoresToGameRecommendations(scores, count);
                
                _logger.LogInformation($"Generated {recommendedGames.Count} game recommendations for player {features.PlayerId}");
                return recommendedGames;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error predicting games for player {features.PlayerId}");
                return await GetFallbackRecommendations(features, count);
            }
        }

        private DenseTensor<float> CreateInputTensor(PlayerFeatures features)
        {
            // In a real implementation, this would map all relevant player features to a tensor
            // For this example, we will create a simplified feature vector
            
            var inputShape = new[] { 1, 15 }; // Batch size of 1, feature dimension of 15
            var tensor = new DenseTensor<float>(inputShape);
            
            // Fill in feature values (this would depend on your actual model)
            tensor[0, 0] = features.DaysSinceRegistration / 365.0f; // Normalize by year
            tensor[0, 1] = (float)features.AverageBetSize;
            tensor[0, 2] = (float)features.AverageSessionLengthMinutes / 60.0f; // Normalize by hour
            tensor[0, 3] = features.SessionFrequencyPerWeek / 7.0f; // Normalize by max sessions per week
            tensor[0, 4] = (float)features.AverageDepositAmount / 100.0f; // Normalize by typical deposit
            tensor[0, 5] = features.DepositFrequencyPerMonth / 30.0f; // Normalize by max deposit frequency
            tensor[0, 6] = (float)features.BonusUsageRate;
            tensor[0, 7] = (float)features.BonusToDepositConversionRate;
            tensor[0, 8] = (float)features.WageringCompletionRate;
            tensor[0, 9] = features.ReferredOthers ? 1.0f : 0.0f;
            tensor[0, 10] = features.TotalReferrals / 10.0f; // Normalize by typical max referrals
            tensor[0, 11] = (float)features.RiskScore;
            tensor[0, 12] = (float)features.ChurnProbability;
            tensor[0, 13] = (float)features.PlayerLifetimeValue / 1000.0f; // Normalize by typical LTV
            tensor[0, 14] = (float)features.CurrentSegment / 5.0f; // Normalize by enum count
            
            return tensor;
        }

        private async Task<List<GameRecommendation>> MapScoresToGameRecommendations(List<float> scores, int count)
        {
            // Get indices of top N scores
            var topIndices = scores
                .Select((score, index) => new { Score = score, Index = index })
                .OrderByDescending(x => x.Score)
                .Take(count)
                .ToList();
            
            var recommendedGames = new List<GameRecommendation>();
            
            foreach (var item in topIndices)
            {
                // Get game ID from index
                if (item.Index < _allGameIds.Count)
                {
                    var gameId = _allGameIds[item.Index];
                    var game = await _gameRepository.GetByIdAsync(gameId);
                    
                    if (game != null && game.IsActive)
                    {
                        recommendedGames.Add(new GameRecommendation
                        {
                            GameId = game.Id,
                            GameName = game.Name,
                            Score = item.Score,
                            RecommendationReason = GenerateRecommendationReason(game),
                            Game = game
                        });
                    }
                }
            }
            
            return recommendedGames;
        }

        private string GenerateRecommendationReason(Game game)
        {
            // In a real implementation, this would be more sophisticated and personalized
            var reasons = new List<string>
            {
                $"Based on your interest in {game.Type} games",
                $"Popular among players like you",
                $"New release you might enjoy",
                $"Matches your playing style",
                $"Players who play your favorite games also enjoy this",
                $"Recommended based on your recent gaming activity"
            };
            
            var random = new Random();
            return reasons[random.Next(reasons.Count)];
        }

        private async Task<List<GameRecommendation>> GetFallbackRecommendations(PlayerFeatures features, int count)
        {
            _logger.LogInformation($"Using fallback recommendation strategy for player {features.PlayerId}");
            
            List<Game> recommendedGames = new List<Game>();
            
            // Try to recommend games based on favorite game type
            if (features.FavoriteGameType.HasValue)
            {
                var typeGames = await _gameRepository.GetGamesByTypeAsync(features.FavoriteGameType.Value);
                recommendedGames.AddRange(typeGames.Take(count / 2));
            }
            
            // Add some popular games
            var popularGames = await _gameRepository.GetPopularGamesAsync(count);
            recommendedGames.AddRange(popularGames);
            
            // Add some new releases
            var newGames = await _gameRepository.GetNewReleasesAsync(count / 2);
            recommendedGames.AddRange(newGames);
            
            // Deduplicate and take top N
            var uniqueGames = recommendedGames
                .GroupBy(g => g.Id)
                .Select(g => g.First())
                .Take(count)
                .ToList();
            
            // Convert to GameRecommendation objects
            var recommendations = uniqueGames.Select(game => new GameRecommendation
            {
                GameId = game.Id,
                GameName = game.Name,
                Score = 0.5f, // Default score for fallback recommendations
                RecommendationReason = "Recommended based on popularity and your gaming preferences",
                Game = game
            }).ToList();
            
            return recommendations;
        }
    }
}