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
    public class BonusesController : ControllerBase
    {
        private readonly ILogger<BonusesController> _logger;
        private readonly IBonusService _bonusService;
        private readonly IBonusOptimizationService _bonusOptimizationService;

        public BonusesController(
            ILogger<BonusesController> logger,
            IBonusService bonusService,
            IBonusOptimizationService bonusOptimizationService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _bonusService = bonusService ?? throw new ArgumentNullException(nameof(bonusService));
            _bonusOptimizationService = bonusOptimizationService ?? throw new ArgumentNullException(nameof(bonusOptimizationService));
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Bonus>>> GetAllBonuses(
            [FromQuery] BonusType? type = null,
            [FromQuery] PlayerSegment? segment = null,
            [FromQuery] string gameId = null)
        {
            try
            {
                IEnumerable<Bonus> bonuses;
                
                if (type.HasValue)
                {
                    _logger.LogInformation($"Getting bonuses by type: {type}");
                    bonuses = await _bonusService.GetBonusesByTypeAsync(type.Value);
                }
                else if (segment.HasValue)
                {
                    _logger.LogInformation($"Getting bonuses for segment: {segment}");
                    bonuses = await _bonusService.GetBonusesForPlayerSegmentAsync(segment.Value);
                }
                else if (!string.IsNullOrEmpty(gameId))
                {
                    _logger.LogInformation($"Getting bonuses for game: {gameId}");
                    bonuses = await _bonusService.GetBonusesForGameAsync(gameId);
                }
                else
                {
                    _logger.LogInformation("Getting all active bonuses");
                    bonuses = await _bonusService.GetAllActiveBonusesAsync();
                }
                
                return Ok(bonuses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bonuses");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving bonuses");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Bonus>> GetBonus(string id)
        {
            try
            {
                var bonus = await _bonusService.GetBonusAsync(id);
                
                if (bonus == null)
                {
                    return NotFound();
                }
                
                return Ok(bonus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving bonus {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving bonus");
            }
        }

        [HttpGet("player/{playerId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<BonusClaim>>> GetPlayerBonuses(string playerId)
        {
            try
            {
                var bonusClaims = await _bonusService.GetPlayerBonusClaimsAsync(playerId);
                return Ok(bonusClaims);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving bonus claims for player {playerId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving player bonus claims");
            }
        }

        [HttpPost("claim")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<BonusClaim>> ClaimBonus([FromBody] BonusClaimRequest request)
        {
            if (request == null || string.IsNullOrEmpty(request.PlayerId) || string.IsNullOrEmpty(request.BonusId))
            {
                return BadRequest("Invalid request. Player ID and Bonus ID are required.");
            }
            
            try
            {
                var bonusClaim = await _bonusService.ClaimBonusAsync(request.PlayerId, request.BonusId);
                
                if (bonusClaim == null)
                {
                    return NotFound("Player or bonus not found, or bonus already claimed by player");
                }
                
                return Ok(bonusClaim);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error claiming bonus {request.BonusId} for player {request.PlayerId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error claiming bonus");
            }
        }

        [HttpGet("optimize/{playerId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<BonusRecommendation>> GetOptimalBonus(string playerId)
        {
            try
            {
                var optimalBonus = await _bonusOptimizationService.GetOptimalBonusAsync(playerId);
                
                if (optimalBonus == null)
                {
                    return NotFound("No suitable bonus found for this player");
                }
                
                return Ok(optimalBonus);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error getting optimal bonus for player {playerId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error getting optimal bonus");
            }
        }

        [HttpGet("rank/{playerId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Bonus>>> RankBonusesForPlayer(string playerId)
        {
            try
            {
                var rankedBonuses = await _bonusOptimizationService.RankBonusesForPlayerAsync(playerId);
                return Ok(rankedBonuses);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error ranking bonuses for player {playerId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error ranking bonuses");
            }
        }

        [HttpGet("appropriate/{playerId}/{bonusId}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<bool>> IsBonusAppropriateForPlayer(string playerId, string bonusId)
        {
            try
            {
                var isAppropriate = await _bonusOptimizationService.IsBonusAppropriateForPlayerAsync(playerId, bonusId);
                return Ok(new { IsAppropriate = isAppropriate });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking bonus appropriateness for player {playerId}, bonus {bonusId}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error checking bonus appropriateness");
            }
        }
    }

    public class BonusClaimRequest
    {
        public string PlayerId { get; set; }
        public string BonusId { get; set; }
    }
}