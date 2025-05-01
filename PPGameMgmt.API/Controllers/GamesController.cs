using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using PPGameMgmt.API.Models;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GamesController : ControllerBase
    {
        private readonly ILogger<GamesController> _logger;
        private readonly IGameService _gameService;

        public GamesController(ILogger<GamesController> logger, IGameService gameService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
        }

        [HttpGet]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<GameDto>>> GetAllGames(
            [FromQuery] GameType? type = null,
            [FromQuery] GameCategory? category = null)
        {
            try
            {
                IEnumerable<Game> games;

                if (type.HasValue)
                {
                    _logger.LogInformation($"Getting games by type: {type}");
                    games = await _gameService.GetGamesByTypeAsync(type.Value);
                }
                else if (category.HasValue)
                {
                    _logger.LogInformation($"Getting games by category: {category}");
                    games = await _gameService.GetGamesByCategoryAsync(category.Value);
                }
                else
                {
                    _logger.LogInformation("Getting all games");
                    games = await _gameService.GetAllGamesAsync();
                }

                // Convert to DTOs before returning
                var gameDtos = GameDto.FromEntities(games);
                return Ok(gameDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving games");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving games");
            }
        }

        [HttpGet("{id}")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<GameDto>> GetGame(string id)
        {
            try
            {
                var game = await _gameService.GetGameAsync(id);

                if (game == null)
                {
                    return NotFound();
                }

                // Convert to DTO before returning
                var gameDto = GameDto.FromEntity(game);
                return Ok(gameDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving game {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving game");
            }
        }

        [HttpGet("popular")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<GameDto>>> GetPopularGames([FromQuery] int count = 10)
        {
            try
            {
                var games = await _gameService.GetPopularGamesAsync(count);
                // Convert to DTOs before returning
                var gameDtos = GameDto.FromEntities(games);
                return Ok(gameDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving popular games");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving popular games");
            }
        }

        [HttpGet("new")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<GameDto>>> GetNewReleases([FromQuery] int count = 10)
        {
            try
            {
                var games = await _gameService.GetNewReleasesAsync(count);
                // Convert to DTOs before returning
                var gameDtos = GameDto.FromEntities(games);
                return Ok(gameDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving new releases");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error retrieving new releases");
            }
        }

        [HttpGet("search")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        public async Task<ActionResult<IEnumerable<GameDto>>> SearchGames([FromQuery] string term)
        {
            if (string.IsNullOrWhiteSpace(term))
            {
                return BadRequest("Search term cannot be empty");
            }

            try
            {
                var games = await _gameService.SearchGamesAsync(term);
                // Convert to DTOs before returning
                var gameDtos = GameDto.FromEntities(games);
                return Ok(gameDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error searching for games with term: {term}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error searching for games");
            }
        }

        [HttpPatch("{id}/status")]
        [ProducesResponseType(StatusCodes.Status200OK)]
        [ProducesResponseType(StatusCodes.Status404NotFound)]
        public async Task<ActionResult<GameDto>> UpdateGameStatus(string id, [FromBody] UpdateGameStatusRequest request)
        {
            try
            {
                var game = await _gameService.GetGameAsync(id);

                if (game == null)
                {
                    return NotFound($"Game with ID {id} not found");
                }

                // Update the game status
                game.IsActive = request.IsActive;

                // Save the changes
                await _gameService.UpdateGameAsync(game);

                // Convert to DTO before returning
                var gameDto = GameDto.FromEntity(game);
                return Ok(gameDto);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating status for game {id}");
                return StatusCode(StatusCodes.Status500InternalServerError, "Error updating game status");
            }
        }
    }
}