using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models;
using PPGameMgmt.Core.CQRS.Commands.Players;
using PPGameMgmt.Core.CQRS.Queries.Players;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Controllers.V1
{
    [ApiVersion("1.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    public class PlayersController : BaseApiController
    {
        private readonly ILogger<PlayersController> _logger;
        private readonly IPlayerService _playerService;
        private readonly IGameService _gameService;
        private readonly IBonusService _bonusService;
        private readonly IMediator _mediator;

        public PlayersController(
            ILogger<PlayersController> logger,
            IPlayerService playerService,
            IGameService gameService,
            IBonusService bonusService,
            IMediator mediator)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _playerService = playerService ?? throw new ArgumentNullException(nameof(playerService));
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _bonusService = bonusService ?? throw new ArgumentNullException(nameof(bonusService));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<Player>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<Player>>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<IEnumerable<Player>>>> GetAllPlayers(
            [FromQuery] PlayerSegment? segment = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                IEnumerable<Player> players;
                int totalCount;

                if (segment.HasValue)
                {
                    _logger.LogInformation($"Getting players by segment: {segment}, page {pageNumber}, size {pageSize}");
                    var query = new GetPlayersBySegmentQuery { Segment = segment.Value };
                    players = await _mediator.Send(query);
                    totalCount = players.Count();

                    // Apply pagination (in a real app, this would be done at the database level)
                    players = players.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                }
                else
                {
                    _logger.LogInformation($"Getting all active players, page {pageNumber}, size {pageSize}");
                    players = await _playerService.GetActivePlayers(30); // Active within last 30 days
                    totalCount = players.Count();

                    // Apply pagination (in a real app, this would be done at the database level)
                    players = players.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                }

                return OkPaginatedResponse(players, pageNumber, pageSize, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving players");
                return ServerErrorResponse<IEnumerable<Player>>("Error retrieving players");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<Player>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<Player>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<Player>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<Player>>> GetPlayer(string id)
        {
            try
            {
                // Use CQRS query instead of direct service call
                var query = new GetPlayerByIdQuery { PlayerId = id };
                var player = await _mediator.Send(query);

                if (player == null)
                {
                    return NotFoundResponse<Player>($"Player with ID {id} not found");
                }

                return OkResponse(player);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving player {id}");
                return ServerErrorResponse<Player>("Error retrieving player");
            }
        }

        [HttpPut("{id}/segment")]
        [Authorize(Policy = "CanManagePlayers")]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status500InternalServerError)]
        [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status403Forbidden)]
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
    }

    public class PlayerSegmentUpdateRequest
    {
        public PlayerSegment Segment { get; set; }
    }
}
