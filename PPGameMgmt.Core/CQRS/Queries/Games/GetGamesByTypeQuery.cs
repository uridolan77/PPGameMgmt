using MediatR;
using PPGameMgmt.Core.Entities;
using System.Collections.Generic;

namespace PPGameMgmt.Core.CQRS.Queries.Games
{
    /// <summary>
    /// Query to get games by type
    /// </summary>
    public class GetGamesByTypeQuery : IRequest<IEnumerable<Game>>
    {
        /// <summary>
        /// Type to filter by
        /// </summary>
        public GameType Type { get; set; }
    }
}
