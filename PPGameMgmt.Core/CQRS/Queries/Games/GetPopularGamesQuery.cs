using MediatR;
using PPGameMgmt.Core.Entities;
using System.Collections.Generic;

namespace PPGameMgmt.Core.CQRS.Queries.Games
{
    /// <summary>
    /// Query to get popular games
    /// </summary>
    public class GetPopularGamesQuery : IRequest<IEnumerable<Game>>
    {
        /// <summary>
        /// Number of popular games to retrieve
        /// </summary>
        public int Count { get; set; } = 10;
    }
}
