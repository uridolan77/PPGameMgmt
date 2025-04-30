using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.ML.Models;
// Use namespace aliases to distinguish between ambiguous types
using CoreEntities = PPGameMgmt.Core.Entities;
using BonusEntities = PPGameMgmt.Core.Entities.Bonuses;
using RecommendationEntities = PPGameMgmt.Core.Entities.Recommendations;

namespace PPGameMgmt.Infrastructure.Services
{
    /// <summary>
    /// Implementation of the bonus optimization service
    /// </summary>
    public class BonusOptimizationService : IBonusOptimizationService
    {
        private readonly IBonusRepository _bonusRepository;
        private readonly IPlayerService _playerService;
        private readonly IMLModelService _mlModelService;
        private readonly BonusOptimizationModel _optimizationModel;
        private readonly ILogger<BonusOptimizationService> _logger;

        public BonusOptimizationService(
            IBonusRepository bonusRepository,
            IPlayerService playerService,
            IMLModelService mlModelService,
            BonusOptimizationModel optimizationModel,
            ILogger<BonusOptimizationService> logger)
        {
            _bonusRepository = bonusRepository ?? throw new ArgumentNullException(nameof(bonusRepository));
            _playerService = playerService ?? throw new ArgumentNullException(nameof(playerService));
            _mlModelService = mlModelService ?? throw new ArgumentNullException(nameof(mlModelService));
            _optimizationModel = optimizationModel ?? throw new ArgumentNullException(nameof(optimizationModel));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<RecommendationEntities.BonusRecommendation> GetOptimalBonusAsync(string playerId)
        {
            _logger.LogInformation("Getting optimal bonus for player: {PlayerId}", playerId);
            
            try
            {
                // Get player features for ML input
                var playerFeatures = await GetPlayerFeaturesAsync(playerId);
                if (playerFeatures == null)
                {
                    _logger.LogWarning("Unable to get features for player: {PlayerId}", playerId);
                    return GenerateDefaultBonusRecommendation(playerId);
                }

                // Get all available bonuses
                var allBonuses = await _bonusRepository.ListAllAsync();
                var activeBonuses = allBonuses
                    .Where(b => b is BonusEntities.Bonus)
                    .Cast<BonusEntities.Bonus>()
                    .Where(b => b.IsActive && b.ValidFrom <= DateTime.UtcNow && b.ValidTo >= DateTime.UtcNow)
                    .ToList<object>();

                if (!activeBonuses.Any())
                {
                    _logger.LogWarning("No active bonuses found");
                    return GenerateDefaultBonusRecommendation(playerId);
                }

                // Use the ML model to get a bonus recommendation
                await _optimizationModel.InitializeAsync();
                var recommendations = await _optimizationModel.GetRecommendationsAsync(
                    playerId, 
                    playerFeatures, 
                    activeBonuses, 
                    1); // Get the top recommendation

                if (recommendations.Any())
                {
                    _logger.LogInformation("Found optimal bonus for player: {PlayerId}", playerId);
                    // Convert from Core BonusRecommendation to Recommendations.BonusRecommendation
                    var coreRec = recommendations.First();
                    return new RecommendationEntities.BonusRecommendation
                    {
                        Id = coreRec.Id,
                        BonusId = coreRec.BonusId,
                        PlayerId = coreRec.PlayerId,
                        Score = coreRec.Score,
                        RecommendationDate = coreRec.RecommendationDate,
                        Reason = coreRec.Reason,
                        IsShown = coreRec.IsShown,
                        IsClaimed = coreRec.IsClaimed,
                        ShownDate = coreRec.ShownDate,
                        ClaimedDate = coreRec.ClaimedDate
                    };
                }

                // Fallback to default if no recommendation was generated
                _logger.LogWarning("No bonus recommendation generated for player: {PlayerId}", playerId);
                return GenerateDefaultBonusRecommendation(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error finding optimal bonus for player: {PlayerId}", playerId);
                return GenerateDefaultBonusRecommendation(playerId);
            }
        }

        public async Task<bool> IsBonusAppropriateForPlayerAsync(string playerId, string bonusId)
        {
            _logger.LogInformation("Checking if bonus {BonusId} is appropriate for player: {PlayerId}", bonusId, playerId);
            
            try
            {
                // Get player and bonus details
                var playerFeatures = await GetPlayerFeaturesAsync(playerId);
                var bonus = await _bonusRepository.GetByIdAsync(Guid.Parse(bonusId)); // Convert string to Guid
                
                if (playerFeatures == null || bonus == null)
                {
                    _logger.LogWarning("Player features or bonus not found for player: {PlayerId}, bonus: {BonusId}", playerId, bonusId);
                    return false;
                }
                
                // Use ML model to score the bonus for this player
                // For this stub implementation, we'll return true if the player is VIP or if the bonus is welcome type
                var typedBonus = bonus as BonusEntities.Bonus;
                if (typedBonus == null)
                {
                    return false;
                }
                
                bool isAppropriate = playerFeatures.CurrentSegment == CoreEntities.PlayerSegment.VIP ||
                                    typedBonus.Type == BonusEntities.BonusType.DepositMatch ||
                                    (typedBonus.TargetSegments == null || typedBonus.TargetSegments.Length == 0);
                
                _logger.LogInformation("Bonus {BonusId} appropriate for player {PlayerId}: {IsAppropriate}", bonusId, playerId, isAppropriate);
                return isAppropriate;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error checking if bonus is appropriate for player: {PlayerId}, bonus: {BonusId}", playerId, bonusId);
                return false;
            }
        }

        public async Task<IEnumerable<BonusEntities.Bonus>> RankBonusesForPlayerAsync(string playerId)
        {
            _logger.LogInformation("Ranking bonuses for player: {PlayerId}", playerId);
            
            try
            {
                // Get player features and all active bonuses
                var playerFeatures = await GetPlayerFeaturesAsync(playerId);
                var allBonuses = await _bonusRepository.ListAllAsync();
                
                var activeBonuses = allBonuses
                    .Where(b => b is BonusEntities.Bonus)
                    .Cast<BonusEntities.Bonus>()
                    .Where(b => b.IsActive && b.ValidFrom <= DateTime.UtcNow && b.ValidTo >= DateTime.UtcNow)
                    .ToList();

                if (!activeBonuses.Any())
                {
                    _logger.LogWarning("No active bonuses found for ranking");
                    return new List<BonusEntities.Bonus>();
                }

                if (playerFeatures == null)
                {
                    _logger.LogWarning("Unable to get features for player: {PlayerId}, returning default ranking", playerId);
                    return activeBonuses.OrderByDescending(b => b.Value);
                }

                // In a real implementation, we'd score each bonus using the ML model
                // and sort them by their predicted effectiveness for this player
                
                // For this stub implementation, we'll sort bonuses by:
                // 1. Bonuses that match the player's preferred type
                // 2. Bonuses targeting player's segment
                // 3. Bonus value
                var preferredType = playerFeatures.PreferredBonusType;
                
                var rankedBonuses = activeBonuses
                    .OrderByDescending(b => preferredType.HasValue && b.Type.Equals(preferredType.Value) ? 1 : 0)
                    .ThenByDescending(b => b.TargetSegments != null && 
                                     b.TargetSegments.Contains(playerFeatures.CurrentSegment) ? 1 : 0)
                    .ThenByDescending(b => b.Value)
                    .ToList();
                
                _logger.LogInformation("Ranked {Count} bonuses for player: {PlayerId}", rankedBonuses.Count, playerId);
                return rankedBonuses;
            }
            catch (Exception ex)
            {
                // Fix the logging error by using the correct LogError overload
                _logger.LogError(ex, "Error ranking bonuses for player: {PlayerId}", playerId);
                return new List<BonusEntities.Bonus>();
            }
        }

        private async Task<PlayerFeatures> GetPlayerFeaturesAsync(string playerId)
        {
            try
            {
                // In a real implementation, we'd retrieve actual player features
                // from a repository or player service
                
                // For this stub implementation, we'll check if the player exists
                var player = await _playerService.GetPlayerAsync(playerId);
                if (player == null)
                {
                    return null;
                }
                
                // Create a mock player features object
                return new PlayerFeatures
                {
                    PlayerId = playerId,
                    DepositFrequencyPerMonth = new Random().Next(1, 10),
                    AverageDepositAmount = new Random().Next(50, 500),
                    DaysSinceRegistration = new Random().Next(1, 365),
                    PlayerLifetimeValue = new Random().Next(100, 10000),
                    BonusUsageRate = new Random().NextDouble(),
                    TotalBonusesClaimed = new Random().Next(0, 20),
                    CurrentSegment = CoreEntities.PlayerSegment.Regular,
                    // Use null-coalescing to handle the nullable type correctly
                    PreferredBonusType = (CoreEntities.BonusType?)(int)BonusEntities.BonusType.DepositMatch
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving player features for: {PlayerId}", playerId);
                return null;
            }
        }

        private RecommendationEntities.BonusRecommendation GenerateDefaultBonusRecommendation(string playerId)
        {
            _logger.LogInformation("Generating default bonus recommendation for player: {PlayerId}", playerId);
            
            return new RecommendationEntities.BonusRecommendation
            {
                Id = Guid.NewGuid().ToString(),
                PlayerId = playerId,
                BonusId = "B001", // Default welcome bonus
                Score = 0.7,
                RecommendationDate = DateTime.UtcNow,
                Reason = "Default recommendation when no optimal bonus is found"
            };
        }
    }
}