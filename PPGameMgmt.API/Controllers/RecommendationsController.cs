using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
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

        [HttpGet("{playerId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Recommendation>> GetRecommendation(string playerId)
        {
            try
            {
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
        public async Task<ActionResult<IEnumerable<GameRecommendation>>> GetGameRecommendations(string playerId, [FromQuery] int count = 5)
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
        public async Task<ActionResult<BonusRecommendation>> GetBonusRecommendation(string playerId)
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