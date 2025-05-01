using MediatR;
using PPGameMgmt.Core.Entities;
using System.Collections.Generic;

namespace PPGameMgmt.Core.CQRS.Queries.Games
{
    /// <summary>
    /// Query to get games by category
    /// </summary>
    public class GetGamesByCategoryQuery : IRequest<IEnumerable<Game>>
    {
        /// <summary>
        /// Category to filter by
        /// </summary>
        public GameCategory Category { get; set; }
    }
}
