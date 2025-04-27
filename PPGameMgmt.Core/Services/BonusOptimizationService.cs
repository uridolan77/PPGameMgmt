using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.Services
{
    public class BonusOptimizationService : IBonusOptimizationService
    {
        private readonly ILogger<BonusOptimizationService> _logger;
        private readonly IFeatureEngineeringService _featureService;
        private readonly IBonusRepository _bonusRepository;
        private readonly IBonusClaimRepository _bonusClaimRepository;
        
        // Change model reference to use interface instead of concrete implementation
        private readonly IMLModelService _mlModelService;

        public BonusOptimizationService(
            ILogger<BonusOptimizationService> logger,
            IFeatureEngineeringService featureService,
            IBonusRepository bonusRepository,
            IBonusClaimRepository bonusClaimRepository,
            IMLModelService mlModelService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _featureService = featureService ?? throw new ArgumentNullException(nameof(featureService));
            _bonusRepository = bonusRepository ?? throw new ArgumentNullException(nameof(bonusRepository));
            _bonusClaimRepository = bonusClaimRepository ?? throw new ArgumentNullException(nameof(bonusClaimRepository));
            _mlModelService = mlModelService ?? throw new ArgumentNullException(nameof(mlModelService));
        }

        public async Task<BonusRecommendation> GetOptimalBonusAsync(string playerId)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }

            // Get player features
            var features = await _featureService.GetCachedFeaturesAsync(playerId);
            if (features == null)
            {
                _logger.LogInformation($"No cached features found for player {playerId}, extracting new features");
                features = await _featureService.ExtractFeaturesAsync(playerId);
            }

            if (features == null)
            {
                _logger.LogWarning($"Unable to extract features for player {playerId}");
                return null;
            }

            return await GetOptimalBonusAsync(features);
        }

        public async Task<BonusRecommendation> GetOptimalBonusAsync(PlayerFeatures playerFeatures)
        {
            if (playerFeatures == null)
            {
                throw new ArgumentNullException(nameof(playerFeatures));
            }

            try
            {
                _logger.LogInformation($"Finding optimal bonus for player {playerFeatures.PlayerId}");
                return await _mlModelService.PredictBestBonusAsync(playerFeatures);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error finding optimal bonus for player {playerFeatures.PlayerId}");
                throw;
            }
        }

        public async Task<IEnumerable<Bonus>> RankBonusesForPlayerAsync(string playerId)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }

            // Get player features
            var features = await _featureService.GetCachedFeaturesAsync(playerId);
            if (features == null)
            {
                features = await _featureService.ExtractFeaturesAsync(playerId);
            }

            if (features == null)
            {
                _logger.LogWarning($"Unable to extract features for player {playerId}");
                return Enumerable.Empty<Bonus>();
            }

            // Get all applicable bonuses
            var allBonuses = await _bonusRepository.GetActiveGlobalBonusesAsync();
            var segmentBonuses = await _bonusRepository.GetBonusesForPlayerSegmentAsync(features.CurrentSegment);
            
            // Combine and deduplicate
            var applicableBonuses = allBonuses
                .Concat(segmentBonuses)
                .GroupBy(b => b.Id)
                .Select(g => g.First())
                .ToList();

            // Rank bonuses based on appropriateness scores
            var bonusScores = new List<(Bonus Bonus, decimal Score)>();
            foreach (var bonus in applicableBonuses)
            {
                var isAppropriate = await IsBonusAppropriateForPlayerAsync(features, bonus);
                // Convert to consistent decimal type for scoring
                decimal score = isAppropriate ? await PredictBonusConversionRateAsync(features, bonus) : 0.1m;
                bonusScores.Add((bonus, score));
            }

            // Return bonuses ordered by score
            return bonusScores
                .OrderByDescending(pair => pair.Score)
                .Select(pair => pair.Bonus)
                .ToList();
        }

        public async Task<bool> IsBonusAppropriateForPlayerAsync(string playerId, string bonusId)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }

            if (string.IsNullOrEmpty(bonusId))
            {
                throw new ArgumentNullException(nameof(bonusId));
            }

            // Get player features and bonus
            var features = await _featureService.GetCachedFeaturesAsync(playerId);
            if (features == null)
            {
                features = await _featureService.ExtractFeaturesAsync(playerId);
            }

            var bonus = await _bonusRepository.GetByIdAsync(bonusId);

            if (features == null || bonus == null)
            {
                return false;
            }

            return await IsBonusAppropriateForPlayerAsync(features, bonus);
        }

        private async Task<bool> IsBonusAppropriateForPlayerAsync(PlayerFeatures features, Bonus bonus)
        {
            // Initial appropriateness check based on segment
            if (bonus.TargetSegments != null && bonus.TargetSegments.Length > 0)
            {
                if (!bonus.TargetSegments.Contains(features.CurrentSegment))
                {
                    return false;
                }
            }

            // Deposit match bonus appropriateness
            if (bonus.Type == BonusType.DepositMatch && bonus.MinimumDeposit.HasValue)
            {
                // Check if player typically deposits more than minimum
                if (features.AverageDepositAmount < bonus.MinimumDeposit.Value)
                {
                    return false;
                }
            }

            // Free spins appropriateness for slot players
            if (bonus.Type == BonusType.FreeSpins && features.FavoriteGameType != GameType.Slot)
            {
                return false;
            }

            // High wagering requirement vs completion rate check
            if (bonus.WageringRequirement.HasValue && bonus.WageringRequirement.Value > 30)
            {
                if (features.WageringCompletionRate < 0.3)
                {
                    return false;
                }
            }

            // Check if bonus applies to player's favorite games
            if (bonus.ApplicableGameIds != null && bonus.ApplicableGameIds.Length > 0 &&
                features.TopPlayedGameIds != null && features.TopPlayedGameIds.Length > 0)
            {
                // If there's no overlap between applicable games and player's favorites
                if (!bonus.ApplicableGameIds.Any(gameId => features.TopPlayedGameIds.Contains(gameId)))
                {
                    return false;
                }
            }

            // If passed all checks, consider it appropriate
            return true;
        }

        public async Task<decimal> PredictBonusConversionRateAsync(string playerId, string bonusId)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }

            if (string.IsNullOrEmpty(bonusId))
            {
                throw new ArgumentNullException(nameof(bonusId));
            }

            // Get player features and bonus
            var features = await _featureService.GetCachedFeaturesAsync(playerId);
            if (features == null)
            {
                features = await _featureService.ExtractFeaturesAsync(playerId);
            }

            var bonus = await _bonusRepository.GetByIdAsync(bonusId);

            if (features == null || bonus == null)
            {
                return 0;
            }

            return await PredictBonusConversionRateAsync(features, bonus);
        }

        private async Task<decimal> PredictBonusConversionRateAsync(PlayerFeatures features, Bonus bonus)
        {
            // This would normally use the ML model to predict conversion rate
            // For this example, we'll use a simplified calculation

            decimal baseRate = 0.5m; // 50% base rate
            
            // Adjust based on player segment
            switch (features.CurrentSegment)
            {
                case PlayerSegment.VIP:
                    baseRate += 0.2m;
                    break;
                case PlayerSegment.Regular:
                    baseRate += 0.1m;
                    break;
                case PlayerSegment.New:
                    baseRate -= 0.1m;
                    break;
                case PlayerSegment.Dormant:
                    baseRate -= 0.2m;
                    break;
            }
            
            // Adjust based on bonus type and player preferences
            if (features.PreferredBonusType.HasValue && features.PreferredBonusType.Value == bonus.Type)
            {
                baseRate += 0.15m;
            }
            
            // Adjust based on historical bonus usage
            baseRate += (decimal)features.BonusUsageRate * 0.2m;
            
            // Adjust based on wagering completion rate for bonuses with wagering requirements
            if (bonus.WageringRequirement.HasValue && bonus.WageringRequirement.Value > 0)
            {
                baseRate -= (1 - (decimal)features.WageringCompletionRate) * 0.2m;
            }
            
            // Ensure the rate is between 0 and 1
            return Math.Max(0, Math.Min(1, baseRate));
        }
    }
}