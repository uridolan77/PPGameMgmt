using MediatR;
using PPGameMgmt.Core.Entities;
using System.Collections.Generic;

namespace PPGameMgmt.Core.CQRS.Queries.Games
{
    /// <summary>
    /// Query to get all games
    /// </summary>
    public class GetAllGamesQuery : IRequest<IEnumerable<Game>>
    {
        // No parameters needed for this query
    }
}
