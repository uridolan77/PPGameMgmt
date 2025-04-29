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
        private readonly IMLOpsService _mlOpsService;
        private InferenceSession _session;
        private string _modelPath;
        private bool _isModelLoaded = false;
        private Dictionary<string, int> _gameIndexMap; // Maps game IDs to model output indices
        private List<string> _allGameIds; // All game IDs in order of model output
        internal const string MODEL_NAME = "game_recommendation";

        public GameRecommendationModel(
            ILogger<GameRecommendationModel> logger,
            IGameRepository gameRepository,
            IMLOpsService mlOpsService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _gameRepository = gameRepository ?? throw new ArgumentNullException(nameof(gameRepository));
            _mlOpsService = mlOpsService ?? throw new ArgumentNullException(nameof(mlOpsService));
        }

        public async Task InitializeAsync()
        {
            try
            {
                _logger.LogInformation("Initializing Game Recommendation Model (Mock Mode)");

                // Skip actual model initialization to avoid issues with missing model files
                // In a real implementation, we would initialize the model here

                // Set model as ready so we can use our mock implementation
                _isModelLoaded = true;

                // Load all games for reference
                var allGames = await _gameRepository.GetAllAsync();
                _allGameIds = allGames.Where(g => g.IsActive).Select(g => g.Id).ToList();
                _gameIndexMap = new Dictionary<string, int>();

                for (int i = 0; i < _allGameIds.Count; i++)
                {
                    _gameIndexMap[_allGameIds[i]] = i;
                }

                _logger.LogInformation($"Game Recommendation Model initialized in mock mode with {_allGameIds.Count} active games");
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

                _logger.LogInformation($"Generating mock game recommendations for player {features.PlayerId}");

                // Instead of using ML models, return mock recommendations
                // This avoids issues with missing ML model files
                var mockRecommendations = new List<GameRecommendation>();

                // Get some real games to use in our mock recommendations
                var popularGames = await _gameRepository.GetPopularGamesAsync(count);
                var newGames = await _gameRepository.GetNewReleasesAsync(count);

                // Combine and deduplicate
                var allGames = popularGames.Concat(newGames)
                    .GroupBy(g => g.Id)
                    .Select(g => g.First())
                    .Take(count)
                    .ToList();

                // Create recommendations
                for (int i = 0; i < Math.Min(count, allGames.Count); i++)
                {
                    var game = allGames[i];
                    mockRecommendations.Add(new GameRecommendation
                    {
                        GameId = game.Id,
                        GameName = game.Name,
                        Score = 0.95 - (i * 0.05),
                        RecommendationReason = GenerateRecommendationReason(game),
                        Game = game
                    });
                }

                _logger.LogInformation($"Generated {mockRecommendations.Count} mock game recommendations for player {features.PlayerId}");
                return mockRecommendations;
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