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
    /// Handler for GetPopularGamesQuery
    /// </summary>
    public class GetPopularGamesQueryHandler : IRequestHandler<GetPopularGamesQuery, IEnumerable<Game>>
    {
        private readonly IGameService _gameService;
        private readonly ILogger<GetPopularGamesQueryHandler> _logger;

        public GetPopularGamesQueryHandler(
            IGameService gameService,
            ILogger<GetPopularGamesQueryHandler> logger)
        {
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<Game>> Handle(GetPopularGamesQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling GetPopularGamesQuery for count {Count}", request.Count);

            var games = await _gameService.GetPopularGamesAsync(request.Count);

            _logger.LogInformation("Retrieved {Count} popular games", games.Count());

            return games;
        }
    }
}
