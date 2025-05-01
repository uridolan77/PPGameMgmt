using MediatR;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.CQRS.Queries.Games;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using System;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.CQRS.Handlers.Games
{
    /// <summary>
    /// Handler for GetAllGamesQuery
    /// </summary>
    public class GetAllGamesQueryHandler : IRequestHandler<GetAllGamesQuery, IEnumerable<Game>>
    {
        private readonly IGameService _gameService;
        private readonly ILogger<GetAllGamesQueryHandler> _logger;

        public GetAllGamesQueryHandler(
            IGameService gameService,
            ILogger<GetAllGamesQueryHandler> logger)
        {
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<Game>> Handle(GetAllGamesQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling GetAllGamesQuery");

            var games = await _gameService.GetAllGamesAsync();

            _logger.LogInformation("Retrieved {Count} games", games.Count());

            return games;
        }
    }
}
