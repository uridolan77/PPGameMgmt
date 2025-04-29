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

namespace PPGameMgmt.API.Controllers.V2
{
    [ApiVersion("2.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    public class PlayersController : BaseApiController
    {
        private readonly ILogger<PlayersController> _logger;
        private readonly IPlayerService _playerService;
        private readonly IMediator _mediator;

        public PlayersController(
            ILogger<PlayersController> logger,
            IPlayerService playerService,
            IMediator mediator)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _playerService = playerService ?? throw new ArgumentNullException(nameof(playerService));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<PlayerDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<PlayerDto>>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<IEnumerable<PlayerDto>>>> GetAllPlayers(
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
                    _logger.LogInformation($"V2 API: Getting players by segment: {segment}, page {pageNumber}, size {pageSize}");
                    var query = new GetPlayersBySegmentQuery { Segment = segment.Value };
                    players = await _mediator.Send(query);
                    totalCount = players.Count();

                    // Apply pagination (in a real app, this would be done at the database level)
                    players = players.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                }
                else
                {
                    _logger.LogInformation($"V2 API: Getting all active players, page {pageNumber}, size {pageSize}");
                    players = await _playerService.GetActivePlayers(30); // Active within last 30 days
                    totalCount = players.Count();

                    // Apply pagination (in a real app, this would be done at the database level)
                    players = players.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                }

                // Map to DTOs - in V2 we're using a DTO with additional fields
                var playerDtos = players.Select(p => new PlayerDto
                {
                    Id = p.Id,
                    Username = p.Username,
                    Email = p.Email,
                    Country = p.Country,
                    Segment = p.Segment,
                    RegistrationDate = p.RegistrationDate,
                    LastLoginDate = p.LastLoginDate,
                    TotalDeposits = p.TotalDeposits,
                    TotalWithdrawals = p.TotalWithdrawals,
                    // New fields in V2
                    PlayerValue = p.TotalDeposits - p.TotalWithdrawals,
                    DaysSinceRegistration = (DateTime.UtcNow - p.RegistrationDate).Days,
                    DaysSinceLastLogin = (DateTime.UtcNow - p.LastLoginDate).Days
                });

                return OkPaginatedResponse(playerDtos, pageNumber, pageSize, totalCount);
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

                // Map to DTO - in V2 we're using a DTO with additional fields
                var playerDto = new PlayerDto
                {
                    Id = player.Id,
                    Username = player.Username,
                    Email = player.Email,
                    Country = player.Country,
                    Segment = player.Segment,
                    RegistrationDate = player.RegistrationDate,
                    LastLoginDate = player.LastLoginDate,
                    TotalDeposits = player.TotalDeposits,
                    TotalWithdrawals = player.TotalWithdrawals,
                    // New fields in V2
                    PlayerValue = player.TotalDeposits - player.TotalWithdrawals,
                    DaysSinceRegistration = (DateTime.UtcNow - player.RegistrationDate).Days,
                    DaysSinceLastLogin = (DateTime.UtcNow - player.LastLoginDate).Days
                };

                return OkResponse(playerDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving player {id}");
                return ServerErrorResponse<PlayerDto>("Error retrieving player");
            }
        }
    }

    // DTO for V2 API with additional fields
    public class PlayerDto
    {
        public string Id { get; set; }
        public string Username { get; set; }
        public string Email { get; set; }
        public string Country { get; set; }
        public PlayerSegment Segment { get; set; }
        public DateTime RegistrationDate { get; set; }
        public DateTime LastLoginDate { get; set; }
        public decimal TotalDeposits { get; set; }
        public decimal TotalWithdrawals { get; set; }

        // New fields in V2
        public decimal PlayerValue { get; set; }
        public int DaysSinceRegistration { get; set; }
        public int DaysSinceLastLogin { get; set; }
    }
}
