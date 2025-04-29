using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using AutoMapper;
using MediatR;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models;
using PPGameMgmt.API.Models.DTOs;
using PPGameMgmt.Core.CQRS.Commands.Players;
using PPGameMgmt.Core.CQRS.Queries.Players;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlayersController : BaseApiController
    {
        private readonly ILogger<PlayersController> _logger;
        private readonly IPlayerService _playerService;
        private readonly IGameService _gameService;
        private readonly IBonusService _bonusService;
        private readonly IMediator _mediator;
        private readonly IMapper _mapper;

        public PlayersController(
            ILogger<PlayersController> logger,
            IPlayerService playerService,
            IGameService gameService,
            IBonusService bonusService,
            IMediator mediator,
            IMapper mapper)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _playerService = playerService ?? throw new ArgumentNullException(nameof(playerService));
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _bonusService = bonusService ?? throw new ArgumentNullException(nameof(bonusService));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<PlayerDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<PlayerDto>>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<IEnumerable<PlayerDto>>>> GetAllPlayers([FromQuery] PlayerSegment? segment = null)
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

                // Map to DTOs
                var playerDtos = _mapper.Map<IEnumerable<PlayerDto>>(players);
                return OkResponse(playerDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving players");
                return ServerErrorResponse<IEnumerable<PlayerDto>>("Error retrieving players");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<PlayerDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<PlayerDto>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<PlayerDto>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<PlayerDto>>> GetPlayer(string id)
        {
            try
            {
                // Use CQRS query instead of direct service call
                var query = new GetPlayerByIdQuery { PlayerId = id };
                var player = await _mediator.Send(query);

                if (player == null)
                {
                    return NotFoundResponse<PlayerDto>($"Player with ID {id} not found");
                }

                // Map to DTO
                var playerDto = _mapper.Map<PlayerDto>(player);
                return OkResponse(playerDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving player {id}");
                return ServerErrorResponse<PlayerDto>("Error retrieving player");
            }
        }

        [HttpGet("{id}/value")]
        [ProducesResponseType(typeof(ApiResponse<decimal>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<decimal>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<decimal>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<decimal>>> GetPlayerValue(string id)
        {
            try
            {
                var player = await _playerService.GetPlayerAsync(id);

                if (player == null)
                {
                    return NotFoundResponse<decimal>($"Player with ID {id} not found");
                }

                var value = await _playerService.GetPlayerValueAsync(id);
                return OkResponse(value, "Player value retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving player value for player {id}");
                return ServerErrorResponse<decimal>("Error retrieving player value");
            }
        }

        [HttpGet("{id}/activity")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<bool>>> IsPlayerActive(string id, [FromQuery] int days = 30)
        {
            try
            {
                var player = await _playerService.GetPlayerAsync(id);

                if (player == null)
                {
                    return NotFoundResponse<bool>($"Player with ID {id} not found");
                }

                var isActive = await _playerService.IsPlayerActive(id, days);
                return OkResponse(isActive, isActive ? 
                    $"Player has been active within the last {days} days" : 
                    $"Player has not been active within the last {days} days");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error checking activity for player {id}");
                return ServerErrorResponse<bool>("Error checking player activity");
            }
        }

        [HttpGet("{id}/features")]
        [ProducesResponseType(typeof(ApiResponse<PlayerFeatures>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<PlayerFeatures>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<PlayerFeatures>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<PlayerFeatures>>> GetPlayerFeatures(string id)
        {
            try
            {
                var player = await _playerService.GetPlayerAsync(id);

                if (player == null)
                {
                    return NotFoundResponse<PlayerFeatures>($"Player with ID {id} not found");
                }

                var features = await _playerService.GetPlayerFeaturesAsync(id);

                if (features == null)
                {
                    // Return an empty object rather than 404,
                    // so the frontend can display "no features available"
                    return OkResponse(new PlayerFeatures { PlayerId = id }, "No features available for this player");
                }

                return OkResponse(features, "Player features retrieved successfully");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving features for player {id}");
                return ServerErrorResponse<PlayerFeatures>("Error retrieving player features");
            }
        }

        [HttpPut("{id}/segment")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<bool>>> UpdatePlayerSegment(string id, [FromBody] PlayerSegmentUpdateRequest request)
        {
            if (request == null || !Enum.IsDefined(typeof(PlayerSegment), request.Segment))
            {
                return BadRequestResponse<bool>("Invalid segment value");
            }

            try
            {
                // First check if player exists
                var query = new GetPlayerByIdQuery { PlayerId = id };
                var player = await _mediator.Send(query);

                if (player == null)
                {
                    return NotFoundResponse<bool>($"Player with ID {id} not found");
                }

                // Use CQRS command instead of direct service call
                var command = new UpdatePlayerSegmentCommand
                {
                    PlayerId = id,
                    Segment = request.Segment
                };

                var result = await _mediator.Send(command);

                if (!result)
                {
                    return ServerErrorResponse<bool>("Failed to update player segment");
                }

                return OkResponse(true, $"Player segment updated to {request.Segment}");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating segment for player {id}");
                return ServerErrorResponse<bool>("Error updating player segment");
            }
        }

        [HttpPost]
        [ProducesResponseType(typeof(ApiResponse<PlayerDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<PlayerDto>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<PlayerDto>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<PlayerDto>>> CreatePlayer([FromBody] Player player)
        {
            try
            {
                if (player == null)
                {
                    return BadRequestResponse<PlayerDto>("Player data is required");
                }

                var createdPlayer = await _playerService.AddPlayerAsync(player);
                var playerDto = _mapper.Map<PlayerDto>(createdPlayer);
                
                var response = ApiResponse<PlayerDto>.Success(playerDto, "Player created successfully");
                return CreatedAtAction(nameof(GetPlayer), new { id = createdPlayer.Id }, response);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating player");
                return ServerErrorResponse<PlayerDto>("Error creating player");
            }
        }
    }

    public class PlayerSegmentUpdateRequest
    {
        public PlayerSegment Segment { get; set; }
    }
}