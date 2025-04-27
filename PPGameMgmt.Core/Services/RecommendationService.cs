using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.Services
{
    public class RecommendationService : IRecommendationService
    {
        private readonly ILogger<RecommendationService> _logger;
        private readonly IFeatureEngineeringService _featureService;
        private readonly IGameRepository _gameRepository;
        private readonly IBonusRepository _bonusRepository;
        private readonly IRecommendationRepository _recommendationRepository;
        private readonly IPlayerRepository _playerRepository;
        private readonly IMLModelService _mlModelService;

        public RecommendationService(
            ILogger<RecommendationService> logger,
            IFeatureEngineeringService featureService,
            IGameRepository gameRepository,
            IBonusRepository bonusRepository,
            IRecommendationRepository recommendationRepository,
            IPlayerRepository playerRepository,
            IMLModelService mlModelService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _featureService = featureService ?? throw new ArgumentNullException(nameof(featureService));
            _gameRepository = gameRepository ?? throw new ArgumentNullException(nameof(gameRepository));
            _bonusRepository = bonusRepository ?? throw new ArgumentNullException(nameof(bonusRepository));
            _recommendationRepository = recommendationRepository ?? throw new ArgumentNullException(nameof(recommendationRepository));
            _playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
            _mlModelService = mlModelService ?? throw new ArgumentNullException(nameof(mlModelService));
        }

        public async Task<Recommendation> GetPersonalizedRecommendationAsync(string playerId)
        {
            try
            {
                _logger.LogInformation($"Generating personalized recommendations for player {playerId}");
                
                // Get player features for ML models
                var playerFeatures = await _featureService.GetCachedFeaturesAsync(playerId);
                if (playerFeatures == null)
                {
                    _logger.LogInformation($"No cached features found for player {playerId}, extracting new features");
                    playerFeatures = await _featureService.ExtractFeaturesAsync(playerId);
                }
                
                if (playerFeatures == null)
                {
                    _logger.LogWarning($"Unable to extract features for player {playerId}");
                    return null;
                }
                
                // Create a new recommendation
                var recommendation = new Recommendation
                {
                    Id = Guid.NewGuid().ToString(),
                    PlayerId = playerId,
                    CreatedAt = DateTime.UtcNow,
                    ValidUntil = DateTime.UtcNow.AddDays(7), // Valid for one week
                    IsDisplayed = false,
                    IsClicked = false,
                    IsAccepted = false
                };
                
                // Get game recommendations and convert to List<GameRecommendation>
                var gameRecommendations = await _mlModelService.PredictTopGamesAsync(playerFeatures, 5);
                recommendation.RecommendedGames = gameRecommendations.ToList();
                
                // Get bonus recommendation
                var bonusRecommendation = await _mlModelService.PredictBestBonusAsync(playerFeatures);
                recommendation.RecommendedBonus = bonusRecommendation;
                
                // Save the recommendation
                await _recommendationRepository.AddAsync(recommendation);
                
                _logger.LogInformation($"Successfully created recommendation {recommendation.Id} for player {playerId}");
                return recommendation;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error generating recommendations for player {playerId}");
                throw;
            }
        }

        public async Task<Recommendation> GetLatestRecommendationAsync(string playerId)
        {
            var recommendation = await _recommendationRepository.GetLatestRecommendationForPlayerAsync(playerId);
            
            // If no recommendation exists or it's expired, create a new one
            if (recommendation == null || recommendation.ValidUntil < DateTime.UtcNow)
            {
                _logger.LogInformation($"No valid recommendation found for player {playerId}, creating a new one");
                return await GetPersonalizedRecommendationAsync(playerId);
            }
            
            return recommendation;
        }

        public async Task<IEnumerable<GameRecommendation>> GetGameRecommendationsAsync(string playerId, int count = 5)
        {
            var recommendation = await GetLatestRecommendationAsync(playerId);
            if (recommendation == null || recommendation.RecommendedGames == null)
            {
                return Enumerable.Empty<GameRecommendation>();
            }
            
            return recommendation.RecommendedGames.Take(count);
        }

        public async Task<BonusRecommendation> GetBonusRecommendationAsync(string playerId)
        {
            var recommendation = await GetLatestRecommendationAsync(playerId);
            return recommendation?.RecommendedBonus;
        }

        public async Task RecordRecommendationDisplayedAsync(string recommendationId)
        {
            var recommendation = await _recommendationRepository.GetByIdAsync(recommendationId);
            if (recommendation != null && !recommendation.IsDisplayed)
            {
                recommendation.IsDisplayed = true;
                recommendation.DisplayedAt = DateTime.UtcNow;
                await _recommendationRepository.UpdateAsync(recommendation);
                _logger.LogInformation($"Recorded display of recommendation {recommendationId}");
            }
        }

        public async Task RecordRecommendationClickedAsync(string recommendationId)
        {
            var recommendation = await _recommendationRepository.GetByIdAsync(recommendationId);
            if (recommendation != null && !recommendation.IsClicked)
            {
                recommendation.IsClicked = true;
                recommendation.ClickedAt = DateTime.UtcNow;
                await _recommendationRepository.UpdateAsync(recommendation);
                _logger.LogInformation($"Recorded click on recommendation {recommendationId}");
            }
        }

        public async Task RecordRecommendationAcceptedAsync(string recommendationId)
        {
            var recommendation = await _recommendationRepository.GetByIdAsync(recommendationId);
            if (recommendation != null && !recommendation.IsAccepted)
            {
                recommendation.IsAccepted = true;
                recommendation.AcceptedAt = DateTime.UtcNow;
                await _recommendationRepository.UpdateAsync(recommendation);
                _logger.LogInformation($"Recorded acceptance of recommendation {recommendationId}");
            }
        }
    }
}