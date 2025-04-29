using System;
using System.Collections.Generic;
using System.Linq.Expressions;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Models;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for Player repository operations
    /// </summary>
    public interface IPlayerRepository : IRepository<Player>
    {
        /// <summary>
        /// Gets a player by string ID (overload of the Guid version from IRepository)
        /// </summary>
        /// <param name="id">The player's string identifier</param>
        /// <returns>Player entity if found</returns>
        Task<Player> GetByIdAsync(string id);

        /// <summary>
        /// Gets a player with all related data (game sessions and bonus claims)
        /// </summary>
        /// <param name="playerId">The player's unique identifier</param>
        /// <returns>Player entity with related data</returns>
        Task<Player> GetPlayerWithSessionsAndBonusesAsync(string playerId);

        /// <summary>
        /// Gets all players in a specific segment
        /// </summary>
        /// <param name="segment">The player segment to filter by</param>
        /// <returns>Collection of players in the specified segment</returns>
        Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment);

        /// <summary>
        /// Gets a paged collection of players in a specific segment
        /// </summary>
        /// <param name="segment">The player segment to filter by</param>
        /// <param name="parameters">Pagination parameters</param>
        /// <returns>Paged result containing players</returns>
        Task<PagedResult<Player>> GetPlayersBySegmentPagedAsync(PlayerSegment segment, PaginationParameters parameters);

        /// <summary>
        /// Gets active players who have logged in within the specified number of days
        /// </summary>
        /// <param name="daysActive">Number of days to consider for activity</param>
        /// <returns>Collection of active players</returns>
        Task<IEnumerable<Player>> GetActivePlayersAsync(int daysActive);

        /// <summary>
        /// Gets a paged collection of active players
        /// </summary>
        /// <param name="daysActive">Number of days to consider for activity</param>
        /// <param name="parameters">Pagination parameters</param>
        /// <returns>Paged result containing active players</returns>
        Task<PagedResult<Player>> GetActivePlayersPagedAsync(int daysActive, PaginationParameters parameters);

        /// <summary>
        /// Gets players sorted by their total value (deposits minus withdrawals)
        /// </summary>
        /// <param name="count">Maximum number of players to return</param>
        /// <returns>Collection of top-value players</returns>
        Task<IEnumerable<Player>> GetTopValuePlayersAsync(int count);

        /// <summary>
        /// Gets players who have played a specific game
        /// </summary>
        /// <param name="gameId">The game's unique identifier</param>
        /// <returns>Collection of players who have played the game</returns>
        Task<IEnumerable<Player>> GetPlayersByGamePlayedAsync(string gameId);

        /// <summary>
        /// Gets players who have claimed a specific bonus
        /// </summary>
        /// <param name="bonusId">The bonus's unique identifier</param>
        /// <returns>Collection of players who have claimed the bonus</returns>
        Task<IEnumerable<Player>> GetPlayersByBonusClaimedAsync(string bonusId);

        /// <summary>
        /// Gets players who have a total deposit amount greater than the specified value
        /// </summary>
        /// <param name="depositAmount">Minimum total deposit amount</param>
        /// <returns>Collection of players with deposits exceeding the specified amount</returns>
        Task<IEnumerable<Player>> GetPlayersByMinimumDepositAsync(decimal depositAmount);

        /// <summary>
        /// Updates a player's segment
        /// </summary>
        /// <param name="playerId">The player's unique identifier</param>
        /// <param name="segment">The new segment value</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment);

        /// <summary>
        /// Checks if a player exists
        /// </summary>
        /// <param name="playerId">The player's unique identifier</param>
        /// <returns>True if the player exists, false otherwise</returns>
        Task<bool> PlayerExistsAsync(string playerId);
    }
}