using MediatR;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.CQRS.Queries.Games
{
    /// <summary>
    /// Query to get a game by ID
    /// </summary>
    public class GetGameByIdQuery : IRequest<Game>
    {
        /// <summary>
        /// ID of the game to retrieve
        /// </summary>
        public string GameId { get; set; }
    }
}
