using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models;
using PPGameMgmt.Core.CQRS.Commands.Games;
using PPGameMgmt.Core.CQRS.Queries.Games;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Controllers.V2
{
    [ApiVersion("2.0")]
    [Route("api/v{version:apiVersion}/[controller]")]
    [Authorize]
    public class GamesController : BaseApiController
    {
        private readonly IGameService _gameService;
        private readonly IMediator _mediator;

        public GamesController(
            ILogger<GamesController> logger,
            IGameService gameService,
            IMediator mediator)
            : base(logger)
        {
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
        }

        [HttpGet]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<GameDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<GameDto>>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<IEnumerable<GameDto>>>> GetAllGames(
            [FromQuery] GameType? type = null,
            [FromQuery] GameCategory? category = null,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                IEnumerable<Game> games;
                int totalCount;

                if (type.HasValue)
                {
                    _logger.LogInformation(
                        "Getting games by type: {Type}, Page: {PageNumber}, Size: {PageSize}",
                        type,
                        pageNumber,
                        pageSize);
                        
                    var query = new GetGamesByTypeQuery { Type = type.Value };
                    games = await _mediator.Send(query);
                    totalCount = games.Count();

                    // Apply pagination (in a real app, this would be done at the database level)
                    games = games.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                }
                else if (category.HasValue)
                {
                    _logger.LogInformation(
                        "Getting games by category: {Category}, Page: {PageNumber}, Size: {PageSize}",
                        category,
                        pageNumber,
                        pageSize);
                        
                    var query = new GetGamesByCategoryQuery { Category = category.Value };
                    games = await _mediator.Send(query);
                    totalCount = games.Count();

                    // Apply pagination (in a real app, this would be done at the database level)
                    games = games.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                }
                else
                {
                    _logger.LogInformation(
                        "Getting all games, Page: {PageNumber}, Size: {PageSize}",
                        pageNumber,
                        pageSize);
                        
                    var query = new GetAllGamesQuery();
                    games = await _mediator.Send(query);
                    totalCount = games.Count();

                    // Apply pagination (in a real app, this would be done at the database level)
                    games = games.Skip((pageNumber - 1) * pageSize).Take(pageSize);
                }

                // Map to DTOs
                var gameDtos = games.Select(g => GameDto.FromEntity(g));

                return OkPaginatedResponse(gameDtos, pageNumber, pageSize, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error retrieving games with parameters: Type={Type}, Category={Category}, PageNumber={PageNumber}, PageSize={PageSize}",
                    type,
                    category,
                    pageNumber,
                    pageSize);
                    
                return ServerErrorResponse<IEnumerable<GameDto>>("Error retrieving games");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(typeof(ApiResponse<GameDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<GameDto>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<GameDto>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<GameDto>>> GetGame(string id)
        {
            try
            {
                var query = new GetGameByIdQuery { GameId = id };
                var game = await _mediator.Send(query);

                if (game == null)
                {
                    return NotFoundResponse<GameDto>($"Game with ID {id} not found");
                }

                var gameDto = GameDto.FromEntity(game);
                return OkResponse(gameDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error retrieving game with ID: {GameId}",
                    id);
                    
                return ServerErrorResponse<GameDto>($"Error retrieving game with ID {id}");
            }
        }

        [HttpGet("popular")]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<GameDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<GameDto>>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<IEnumerable<GameDto>>>> GetPopularGames(
            [FromQuery] int count = 10,
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            try
            {
                _logger.LogInformation(
                    "Getting popular games, Count: {Count}, Page: {PageNumber}, Size: {PageSize}",
                    count,
                    pageNumber,
                    pageSize);
                    
                var query = new GetPopularGamesQuery { Count = count };
                var games = await _mediator.Send(query);
                var totalCount = games.Count();

                // Apply pagination
                games = games.Skip((pageNumber - 1) * pageSize).Take(pageSize);

                // Map to DTOs
                var gameDtos = games.Select(g => GameDto.FromEntity(g));

                return OkPaginatedResponse(gameDtos, pageNumber, pageSize, totalCount);
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error retrieving popular games with parameters: Count={Count}, PageNumber={PageNumber}, PageSize={PageSize}",
                    count,
                    pageNumber,
                    pageSize);
                    
                return ServerErrorResponse<IEnumerable<GameDto>>("Error retrieving popular games");
            }
        }

        [HttpPatch("{id}/status")]
        [ProducesResponseType(typeof(ApiResponse<GameDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<GameDto>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<GameDto>), StatusCodes.Status500InternalServerError)]
        public async Task<ActionResult<ApiResponse<GameDto>>> UpdateGameStatus(
            string id, 
            [FromBody] UpdateGameStatusRequest request)
        {
            try
            {
                _logger.LogInformation(
                    "Updating game status, ID: {GameId}, IsActive: {IsActive}",
                    id,
                    request.IsActive);
                    
                var command = new UpdateGameStatusCommand 
                { 
                    GameId = id, 
                    IsActive = request.IsActive 
                };
                
                var game = await _mediator.Send(command);

                if (game == null)
                {
                    return NotFoundResponse<GameDto>($"Game with ID {id} not found");
                }

                var gameDto = GameDto.FromEntity(game);
                return OkResponse(gameDto, $"Game status updated successfully to {(request.IsActive ? "active" : "inactive")}");
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Error updating game status with ID: {GameId}, IsActive: {IsActive}",
                    id,
                    request.IsActive);
                    
                return ServerErrorResponse<GameDto>($"Error updating game status for game with ID {id}");
            }
        }
    }
}
