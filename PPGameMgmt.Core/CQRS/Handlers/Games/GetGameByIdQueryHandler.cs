using MediatR;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.CQRS.Queries.Games;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.CQRS.Handlers.Games
{
    /// <summary>
    /// Handler for GetGameByIdQuery
    /// </summary>
    public class GetGameByIdQueryHandler : IRequestHandler<GetGameByIdQuery, Game>
    {
        private readonly IGameService _gameService;
        private readonly ILogger<GetGameByIdQueryHandler> _logger;

        public GetGameByIdQueryHandler(
            IGameService gameService,
            ILogger<GetGameByIdQueryHandler> logger)
        {
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<Game> Handle(GetGameByIdQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling GetGameByIdQuery for game {GameId}", request.GameId);

            var game = await _gameService.GetGameAsync(request.GameId);

            if (game == null)
            {
                _logger.LogWarning("Game with ID {GameId} not found", request.GameId);
            }
            else
            {
                _logger.LogInformation("Retrieved game {GameId}", game.Id);
            }

            return game;
        }
    }
}
