using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
// Use namespace aliases to distinguish between ambiguous types
using CoreEntities = PPGameMgmt.Core.Entities;
using BonusEntities = PPGameMgmt.Core.Entities.Bonuses;
using RecommendationEntities = PPGameMgmt.Core.Entities.Recommendations;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class RecommendationsController : ControllerBase
    {
        private readonly ILogger<RecommendationsController> _logger;
        private readonly IRecommendationService _recommendationService;

        public RecommendationsController(
            ILogger<RecommendationsController> logger,
            IRecommendationService recommendationService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _recommendationService = recommendationService ?? throw new ArgumentNullException(nameof(recommendationService));
        }

        [HttpGet("test")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public ActionResult<string> TestRecommendations()
        {
            try
            {
                _logger.LogInformation("Testing recommendations endpoint");
                return Ok("Recommendations endpoint is working");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error testing recommendations endpoint");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error testing recommendations endpoint");
            }
        }

        [HttpGet("{playerId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RecommendationEntities.Recommendation>> GetRecommendation(string playerId)
        {
            try
            {
                // Create a mock recommendation for testing
                if (playerId == "mock")
                {
                    var mockRecommendation = new RecommendationEntities.Recommendation
                    {
                        Id = "R001",
                        PlayerId = playerId,
                        CreatedAt = DateTime.UtcNow,
                        ValidUntil = DateTime.UtcNow.AddDays(7),
                        IsDisplayed = false,
                        IsClicked = false,
                        IsAccepted = false,
                        IsViewed = false,
                        IsPlayed = false,
                        RecommendedGames = new List<RecommendationEntities.GameRecommendation>
                        {
                            new RecommendationEntities.GameRecommendation
                            {
                                GameId = "G001",
                                GameName = "Test Game 1",
                                Score = 0.95,
                                RecommendationReason = "Test recommendation"
                            },
                            new RecommendationEntities.GameRecommendation
                            {
                                GameId = "G002",
                                GameName = "Test Game 2",
                                Score = 0.85,
                                RecommendationReason = "Test recommendation"
                            }
                        },
                        RecommendedBonus = new RecommendationEntities.BonusRecommendation
                        {
                            BonusId = "B001",
                            // Replace incorrect property names with ones that actually exist in BonusRecommendation
                            Reason = "Test recommendation for a deposit match bonus",
                            Score = 0.9,
                            PlayerId = playerId,
                            Id = Guid.NewGuid().ToString(),
                            RecommendationDate = DateTime.UtcNow,
                            IsShown = false,
                            IsClaimed = false
                        }
                    };

                    return Ok(mockRecommendation);
                }

                var recommendation = await _recommendationService.GetLatestRecommendationAsync(playerId);

                if (recommendation == null)
                {
                    return NotFound();
                }

                // Record that this recommendation was displayed
                await _recommendationService.RecordRecommendationDisplayedAsync(recommendation.Id);

                return Ok(recommendation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving recommendation for player {playerId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving recommendations");
            }
        }

        [HttpGet("{playerId}/games")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<RecommendationEntities.GameRecommendation>>> GetGameRecommendations(string playerId, [FromQuery] int count = 5)
        {
            try
            {
                var gameRecommendations = await _recommendationService.GetGameRecommendationsAsync(playerId, count);
                return Ok(gameRecommendations);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving game recommendations for player {playerId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving game recommendations");
            }
        }

        [HttpGet("{playerId}/bonus")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<RecommendationEntities.BonusRecommendation>> GetBonusRecommendation(string playerId)
        {
            try
            {
                var bonusRecommendation = await _recommendationService.GetBonusRecommendationAsync(playerId);

                if (bonusRecommendation == null)
                {
                    return NotFound();
                }

                return Ok(bonusRecommendation);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving bonus recommendation for player {playerId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving bonus recommendation");
            }
        }

        [HttpPost("{recommendationId}/click")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RecordClick(string recommendationId)
        {
            try
            {
                await _recommendationService.RecordRecommendationClickedAsync(recommendationId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error recording click for recommendation {recommendationId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error recording click");
            }
        }

        [HttpPost("{recommendationId}/accept")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RecordAcceptance(string recommendationId)
        {
            try
            {
                await _recommendationService.RecordRecommendationAcceptedAsync(recommendationId);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error recording acceptance for recommendation {recommendationId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error recording acceptance");
            }
        }
    }
}