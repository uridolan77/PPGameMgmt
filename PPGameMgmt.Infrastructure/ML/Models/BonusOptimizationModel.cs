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
    public class BonusOptimizationModel
    {
        private readonly ILogger<BonusOptimizationModel> _logger;
        private readonly IBonusRepository _bonusRepository;
        private readonly IMLOpsService _mlOpsService;
        private InferenceSession _session;
        private string _modelPath;
        private bool _isModelLoaded = false;
        private const string MODEL_NAME = "bonus_optimization";

        public BonusOptimizationModel(
            ILogger<BonusOptimizationModel> logger,
            IBonusRepository bonusRepository,
            IMLOpsService mlOpsService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _bonusRepository = bonusRepository ?? throw new ArgumentNullException(nameof(bonusRepository));
            _mlOpsService = mlOpsService ?? throw new ArgumentNullException(nameof(mlOpsService));
        }

        public async Task InitializeAsync()
        {
            try
            {
                _logger.LogInformation("Initializing Bonus Optimization Model");
                
                // Get model path from MLOpsService
                try {
                    _modelPath = _mlOpsService.GetActiveModelPath(MODEL_NAME);
                    _logger.LogInformation($"Using model path from MLOps registry: {_modelPath}");
                }
                catch (KeyNotFoundException) {
                    _logger.LogWarning("No active model found in registry. Using fallback bonus optimization logic.");
                    _isModelLoaded = false;
                    return;
                }
                
                // Load the ONNX model
                if (File.Exists(_modelPath))
                {
                    _session = new InferenceSession(_modelPath);
                    _isModelLoaded = true;
                    _logger.LogInformation($"Bonus Optimization Model loaded successfully from {_modelPath}");
                }
                else
                {
                    _logger.LogWarning($"Bonus Optimization Model not found at {_modelPath}. Using fallback bonus optimization logic.");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error initializing Bonus Optimization Model");
                _isModelLoaded = false;
            }
        }

        public async Task<BonusRecommendation> PredictBestBonusAsync(PlayerFeatures features)
        {
            try
            {
                // Make sure we have initialized the model
                if (!_isModelLoaded)
                {
                    await InitializeAsync();
                    
                    // If initialization failed, use fallback optimization
                    if (!_isModelLoaded)
                    {
                        return await GetFallbackBonusRecommendation(features);
                    }
                }
                
                // Get all active bonuses that could be applicable to this player
                var allBonuses = await _bonusRepository.GetActiveGlobalBonusesAsync();
                var bonusesForSegment = await _bonusRepository.GetBonusesForPlayerSegmentAsync(features.CurrentSegment);
                
                // Combine all applicable bonuses
                var allApplicableBonuses = allBonuses.Concat(bonusesForSegment)
                    .GroupBy(b => b.Id) // Deduplicate
                    .Select(g => g.First())
                    .ToList();
                
                if (!allApplicableBonuses.Any())
                {
                    _logger.LogWarning($"No applicable bonuses found for player {features.PlayerId}");
                    return null;
                }
                
                // Predict bonus suitability score for each bonus
                var bestBonus = await ScoreAndSelectBestBonus(features, allApplicableBonuses);
                
                _logger.LogInformation($"Selected optimal bonus {bestBonus?.BonusId} for player {features.PlayerId}");
                return bestBonus;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error predicting optimal bonus for player {features.PlayerId}");
                return await GetFallbackBonusRecommendation(features);
            }
        }

        private async Task<BonusRecommendation> ScoreAndSelectBestBonus(
            PlayerFeatures features, 
            List<Bonus> applicableBonuses)
        {
            var bonusScores = new List<(Bonus Bonus, double Score)>();
            
            foreach (var bonus in applicableBonuses)
            {
                var score = await PredictBonusScore(features, bonus);
                bonusScores.Add((bonus, score));
            }
            
            // Select the bonus with the highest score
            var bestBonusPair = bonusScores.OrderByDescending(pair => pair.Score).FirstOrDefault();
            
            if (bestBonusPair.Bonus == null)
            {
                return null;
            }
            
            return new BonusRecommendation
            {
                BonusId = bestBonusPair.Bonus.Id,
                BonusName = bestBonusPair.Bonus.Name,
                BonusType = bestBonusPair.Bonus.Type,
                Amount = bestBonusPair.Bonus.Amount,
                PercentageMatch = bestBonusPair.Bonus.PercentageMatch,
                Score = bestBonusPair.Score,
                RecommendationReason = GenerateRecommendationReason(bestBonusPair.Bonus, features),
                Bonus = bestBonusPair.Bonus
            };
        }

        private async Task<double> PredictBonusScore(PlayerFeatures features, Bonus bonus)
        {
            // If we have the ML model loaded, use it for prediction
            if (_isModelLoaded)
            {
                // Create input tensor
                var inputTensor = CreateInputTensor(features, bonus);
                
                // Run inference
                var inputs = new List<NamedOnnxValue> { NamedOnnxValue.CreateFromTensor("input", inputTensor) };
                using var results = _session.Run(inputs);
                var score = results.First().AsEnumerable<float>().First();
                
                return score;
            }
            
            // Otherwise use a heuristic approach
            return CalculateHeuristicScore(features, bonus);
        }

        private DenseTensor<float> CreateInputTensor(PlayerFeatures features, Bonus bonus)
        {
            // In a real implementation, this would map all relevant features and bonus attributes
            // to a tensor based on the model's expected input format
            
            var inputShape = new[] { 1, 20 }; // Batch size of 1, feature dimension of 20
            var tensor = new DenseTensor<float>(inputShape);
            
            // Fill in player features (similar to GameRecommendationModel)
            tensor[0, 0] = features.DaysSinceRegistration / 365.0f;
            tensor[0, 1] = (float)features.AverageBetSize;
            tensor[0, 2] = (float)features.AverageSessionLengthMinutes / 60.0f;
            tensor[0, 3] = features.SessionFrequencyPerWeek / 7.0f;
            tensor[0, 4] = (float)features.AverageDepositAmount / 100.0f;
            tensor[0, 5] = features.DepositFrequencyPerMonth / 30.0f;
            tensor[0, 6] = (float)features.BonusUsageRate;
            tensor[0, 7] = (float)features.BonusToDepositConversionRate;
            tensor[0, 8] = (float)features.WageringCompletionRate;
            tensor[0, 9] = (float)features.RiskScore;
            tensor[0, 10] = (float)features.ChurnProbability;
            tensor[0, 11] = (float)features.PlayerLifetimeValue / 1000.0f;
            tensor[0, 12] = (float)features.CurrentSegment / 5.0f;
            
            // Fill in bonus features
            tensor[0, 13] = (float)bonus.Type / Enum.GetValues(typeof(BonusType)).Length;
            tensor[0, 14] = (float)bonus.Amount / 1000.0f; // Normalize by typical max bonus amount
            tensor[0, 15] = bonus.PercentageMatch.HasValue ? (float)bonus.PercentageMatch.Value / 100.0f : 0.0f;
            tensor[0, 16] = bonus.MinimumDeposit.HasValue ? (float)bonus.MinimumDeposit.Value / 100.0f : 0.0f;
            tensor[0, 17] = bonus.WageringRequirement.HasValue ? (float)bonus.WageringRequirement.Value / 50.0f : 0.0f;
            
            // Check if preferred bonus type matches
            tensor[0, 18] = (features.PreferredBonusType.HasValue && features.PreferredBonusType == bonus.Type) ? 1.0f : 0.0f;
            
            // Check if player has enough deposits for minimum deposit requirement
            tensor[0, 19] = (!bonus.MinimumDeposit.HasValue || features.AverageDepositAmount >= bonus.MinimumDeposit.Value) ? 1.0f : 0.0f;
            
            return tensor;
        }

        private double CalculateHeuristicScore(PlayerFeatures features, Bonus bonus)
        {
            double score = 0.5; // Base score
            
            // Preferred bonus type match
            if (features.PreferredBonusType.HasValue && features.PreferredBonusType.Value == bonus.Type)
            {
                score += 0.2;
            }
            
            // Deposit match appropriateness
            if (bonus.Type == BonusType.DepositMatch)
            {
                // If player has low deposit frequency, deposit match is more valuable
                if (features.DepositFrequencyPerMonth < 3)
                {
                    score += 0.1;
                }
                
                // If player's average deposit is close to minimum requirement, it's a good match
                if (bonus.MinimumDeposit.HasValue && 
                    features.AverageDepositAmount >= bonus.MinimumDeposit.Value &&
                    features.AverageDepositAmount <= bonus.MinimumDeposit.Value * 2)
                {
                    score += 0.1;
                }
            }
            
            // Free spins appropriateness
            if (bonus.Type == BonusType.FreeSpins)
            {
                // If player prefers slots, free spins are more valuable
                if (features.FavoriteGameType == GameType.Slot)
                {
                    score += 0.2;
                }
            }
            
            // Cashback appropriateness
            if (bonus.Type == BonusType.Cashback)
            {
                // Cashback is better for high-value players
                if (features.PlayerLifetimeValue > 500)
                {
                    score += 0.2;
                }
            }
            
            // Wagering requirement appropriateness
            if (bonus.WageringRequirement.HasValue)
            {
                // If player has low wagering completion rate and high requirement, reduce score
                if (features.WageringCompletionRate < 0.5 && bonus.WageringRequirement.Value > 20)
                {
                    score -= 0.2;
                }
            }
            
            // Churn risk consideration
            if (features.ChurnProbability > 0.6)
            {
                // For high churn risk, no-deposit bonuses are better
                if (bonus.Type == BonusType.NoDeposit || bonus.Type == BonusType.FreeSpins)
                {
                    score += 0.2;
                }
            }
            
            // Normalize final score
            return Math.Max(0.1, Math.Min(0.9, score));
        }

        private string GenerateRecommendationReason(Bonus bonus, PlayerFeatures features)
        {
            // Generate a personalized reason based on player features and bonus type
            switch (bonus.Type)
            {
                case BonusType.DepositMatch:
                    if (features.DepositFrequencyPerMonth > 5)
                        return "Perfect for your regular deposit pattern";
                    else
                        return "Great way to boost your next deposit";
                
                case BonusType.FreeSpins:
                    if (features.FavoriteGameType == GameType.Slot)
                        return "Matched to your love of slot games";
                    else
                        return "Try out some exciting slot games on us";
                
                case BonusType.Cashback:
                    return "Protection for your gameplay with cashback";
                
                case BonusType.NoDeposit:
                    if (features.ChurnProbability > 0.6)
                        return "Welcome back with this no deposit bonus";
                    else
                        return "Enjoy this bonus with no deposit required";
                
                case BonusType.LoyaltyPoints:
                    if (features.PlayerLifetimeValue > 1000)
                        return "A reward for your continued loyalty";
                    else
                        return "Start building your loyalty rewards";
                
                default:
                    return "Selected based on your playing patterns";
            }
        }

        private async Task<BonusRecommendation> GetFallbackBonusRecommendation(PlayerFeatures features)
        {
            _logger.LogInformation($"Using fallback bonus recommendation strategy for player {features.PlayerId}");
            
            // Get active bonuses for player segment
            var segmentBonuses = await _bonusRepository.GetBonusesForPlayerSegmentAsync(features.CurrentSegment);
            
            // If no segment bonuses, get global bonuses
            if (!segmentBonuses.Any())
            {
                segmentBonuses = await _bonusRepository.GetActiveGlobalBonusesAsync();
            }
            
            // If still no bonuses, return null
            if (!segmentBonuses.Any())
            {
                return null;
            }
            
            // Find a bonus that matches preferred type if available
            Bonus selectedBonus = null;
            if (features.PreferredBonusType.HasValue)
            {
                selectedBonus = segmentBonuses
                    .FirstOrDefault(b => b.Type == features.PreferredBonusType.Value);
            }
            
            // If no match by type or no preference, select highest value bonus
            if (selectedBonus == null)
            {
                selectedBonus = segmentBonuses
                    .OrderByDescending(b => b.Amount)
                    .FirstOrDefault();
            }
            
            // Create recommendation
            if (selectedBonus != null)
            {
                return new BonusRecommendation
                {
                    BonusId = selectedBonus.Id,
                    BonusName = selectedBonus.Name,
                    BonusType = selectedBonus.Type,
                    Amount = selectedBonus.Amount,
                    PercentageMatch = selectedBonus.PercentageMatch,
                    Score = 0.5, // Default score for fallback
                    RecommendationReason = "Selected based on your player profile",
                    Bonus = selectedBonus
                };
            }
            
            return null;
        }
    }
}