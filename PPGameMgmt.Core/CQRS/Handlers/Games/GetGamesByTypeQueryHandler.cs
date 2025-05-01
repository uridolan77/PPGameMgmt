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
    /// Handler for GetGamesByTypeQuery
    /// </summary>
    public class GetGamesByTypeQueryHandler : IRequestHandler<GetGamesByTypeQuery, IEnumerable<Game>>
    {
        private readonly IGameService _gameService;
        private readonly ILogger<GetGamesByTypeQueryHandler> _logger;

        public GetGamesByTypeQueryHandler(
            IGameService gameService,
            ILogger<GetGamesByTypeQueryHandler> logger)
        {
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<Game>> Handle(GetGamesByTypeQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling GetGamesByTypeQuery for type {Type}", request.Type);

            var games = await _gameService.GetGamesByTypeAsync(request.Type);

            _logger.LogInformation("Retrieved {Count} games for type {Type}", games.Count(), request.Type);

            return games;
        }
    }
}
