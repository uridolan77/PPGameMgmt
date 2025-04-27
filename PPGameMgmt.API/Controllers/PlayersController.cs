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
    public class PlayersController : ControllerBase
    {
        private readonly ILogger<PlayersController> _logger;
        private readonly IPlayerService _playerService;
        private readonly IGameService _gameService;
        private readonly IBonusService _bonusService;

        public PlayersController(
            ILogger<PlayersController> logger,
            IPlayerService playerService,
            IGameService gameService,
            IBonusService bonusService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _playerService = playerService ?? throw new ArgumentNullException(nameof(playerService));
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _bonusService = bonusService ?? throw new ArgumentNullException(nameof(bonusService));
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<Player>>> GetAllPlayers([FromQuery] PlayerSegment? segment = null)
        {
            try
            {
                IEnumerable<Player> players;
                
                if (segment.HasValue)
                {
                    _logger.LogInformation($"Getting players by segment: {segment}");
                    players = await _playerService.GetPlayersBySegmentAsync(segment.Value);
                }
                else
                {
                    _logger.LogInformation("Getting all active players");
                    players = await _playerService.GetActivePlayers(30); // Active within last 30 days
                }
                
                return Ok(players);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving players");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving players");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<Player>> GetPlayer(string id)
        {
            try
            {
                var player = await _playerService.GetPlayerAsync(id);
                
                if (player == null)
                {
                    return NotFound();
                }
                
                return Ok(player);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving player {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving player");
            }
        }

        [HttpGet("{id}/value")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<decimal>> GetPlayerValue(string id)
        {
            try
            {
                var playerExists = await _playerService.GetPlayerAsync(id) != null;
                
                if (!playerExists)
                {
                    return NotFound();
                }
                
                var value = await _playerService.GetPlayerValueAsync(id);
                return Ok(new { Value = value });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving player value for player {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving player value");
            }
        }

        [HttpGet("{id}/activity")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<bool>> IsPlayerActive(string id, [FromQuery] int days = 30)
        {
            try
            {
                var playerExists = await _playerService.GetPlayerAsync(id) != null;
                
                if (!playerExists)
                {
                    return NotFound();
                }
                
                var isActive = await _playerService.IsPlayerActive(id, days);
                return Ok(new { IsActive = isActive });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking activity for player {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error checking player activity");
            }
        }

        [HttpGet("{id}/features")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<PlayerFeatures>> GetPlayerFeatures(string id)
        {
            try
            {
                var player = await _playerService.GetPlayerAsync(id);
                
                if (player == null)
                {
                    return NotFound();
                }
                
                var features = await _playerService.GetPlayerFeaturesAsync(id);
                
                if (features == null)
                {
                    // Return an empty object rather than 404,
                    // so the frontend can display "no features available"
                    return Ok(new {});
                }
                
                return Ok(features);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving features for player {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving player features");
            }
        }

        [HttpPut("{id}/segment")]
        [ProducesResponseType(StatusCodes.Status204NoContent)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> UpdatePlayerSegment(string id, [FromBody] PlayerSegmentUpdateRequest request)
        {
            if (request == null || !Enum.IsDefined(typeof(PlayerSegment), request.Segment))
            {
                return BadRequest("Invalid segment value");
            }
            
            try
            {
                var player = await _playerService.GetPlayerAsync(id);
                
                if (player == null)
                {
                    return NotFound();
                }
                
                await _playerService.UpdatePlayerSegmentAsync(id, request.Segment);
                return NoContent();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating segment for player {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error updating player segment");
            }
        }

        [HttpPost]
        [ProducesResponseType(StatusCodes.Status201Created)]
        [ProducesResponseType(StatusCodes.Status400BadRequest)]
        public async Task<ActionResult<Player>> CreatePlayer(Player player)
        {
            try
            {
                if (player == null)
                {
                    return BadRequest("Player data is required");
                }

                var createdPlayer = await _playerService.AddPlayerAsync(player);
                
                return CreatedAtAction(nameof(GetPlayer), new { id = createdPlayer.Id }, createdPlayer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating player");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error creating player");
            }
        }
    }

    public class PlayerSegmentUpdateRequest
    {
        public PlayerSegment Segment { get; set; }
    }
}