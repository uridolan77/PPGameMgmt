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
    /// Handler for GetGamesByCategoryQuery
    /// </summary>
    public class GetGamesByCategoryQueryHandler : IRequestHandler<GetGamesByCategoryQuery, IEnumerable<Game>>
    {
        private readonly IGameService _gameService;
        private readonly ILogger<GetGamesByCategoryQueryHandler> _logger;

        public GetGamesByCategoryQueryHandler(
            IGameService gameService,
            ILogger<GetGamesByCategoryQueryHandler> logger)
        {
            _gameService = gameService ?? throw new ArgumentNullException(nameof(gameService));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<IEnumerable<Game>> Handle(GetGamesByCategoryQuery request, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Handling GetGamesByCategoryQuery for category {Category}", request.Category);

            var games = await _gameService.GetGamesByCategoryAsync(request.Category);

            _logger.LogInformation("Retrieved {Count} games for category {Category}", games.Count(), request.Category);

            return games;
        }
    }
}
