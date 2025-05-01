using MediatR;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.CQRS.Commands.Games
{
    /// <summary>
    /// Command to update a game's active status
    /// </summary>
    public class UpdateGameStatusCommand : IRequest<Game>
    {
        /// <summary>
        /// ID of the game to update
        /// </summary>
        public string GameId { get; set; }
        
        /// <summary>
        /// New active status
        /// </summary>
        public bool IsActive { get; set; }
    }
}
