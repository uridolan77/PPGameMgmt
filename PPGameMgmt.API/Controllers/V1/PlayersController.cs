using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models;
using PPGameMgmt.API.Models.Requests;
using PPGameMgmt.Core.CQRS.Commands.Players;
using PPGameMgmt.Core.CQRS.Queries.Players;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models;

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
                var parameters = new PaginationParameters
                {
                    PageNumber = pageNumber,
                    PageSize = pageSize
                };

                PagedResult<Player> pagedResult;

                if (segment.HasValue)
                {
                    _logger.LogInformation($"Getting players by segment: {segment}, page {pageNumber}, size {pageSize}");
                    pagedResult = await _playerService.GetPlayersBySegmentPagedAsync(segment.Value, parameters);
                }
                else
                {
                    _logger.LogInformation($"Getting all active players, page {pageNumber}, size {pageSize}");
                    pagedResult = await _playerService.GetActivePlayersPagedAsync(30, parameters); // Active within last 30 days
                }

                return OkPaginatedResponse(
                    pagedResult.Items,
                    pagedResult.PageNumber,
                    pagedResult.PageSize,
                    pagedResult.TotalCount);
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

    // Request models moved to PPGameMgmt.API.Models.Requests namespace
}
