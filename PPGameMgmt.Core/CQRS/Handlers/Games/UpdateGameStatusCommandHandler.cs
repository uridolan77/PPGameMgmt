using MediatR;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.CQRS.Commands.Games;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.CQRS.Handlers.Games
{
    /// <summary>
    /// Handler for UpdateGameStatusCommand
    /// </summary>
    public class UpdateGameStatusCommandHandler : IRequestHandler<UpdateGameStatusCommand, Game>
    {
        private readonly IGameService _gameService;
        private readonly ILogger<UpdateGameStatusCommandHandler> _logger;

        public UpdateGameStatusCommandHandler(
            IGameService gameService,
            ILogger<UpdateGameStatusCommandHandler> logger)
        {
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Game> Handle(UpdateGameStatusCommand request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling UpdateGameStatusCommand for game {GameId}", request.GameId);

            // Get the game
            var game = await _gameService.GetGameAsync(request.GameId);

            if (game == null)
            {
                _logger.LogWarning("Game with ID {GameId} not found", request.GameId);
                return null;
            }

            // Update the status
            game.IsActive = request.IsActive;

            // Save the changes
            var updatedGame = await _gameService.UpdateGameAsync(game);

            _logger.LogInformation(
                "Game {GameId} status updated to {IsActive}",
                updatedGame.Id,
                updatedGame.IsActive);

            return updatedGame;
        }
    }
}
