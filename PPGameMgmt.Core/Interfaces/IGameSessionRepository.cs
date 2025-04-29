using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Models;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for GameSession repository operations
    /// </summary>
    public interface IGameSessionRepository : IRepository<GameSession>
    {
        /// <summary>
        /// Gets a game session by string ID (overload of the Guid version from IRepository)
        /// </summary>
        /// <param name="id">The game session's string identifier</param>
        /// <returns>GameSession entity if found</returns>
        Task<GameSession> GetByIdAsync(string id);

        /// <summary>
        /// Gets game sessions for a player
        /// </summary>
        /// <param name="playerId">The player's unique identifier</param>
        /// <returns>Collection of game sessions</returns>
        Task<IEnumerable<GameSession>> GetSessionsByPlayerIdAsync(string playerId);

        /// <summary>
        /// Gets paged game sessions for a player
        /// </summary>
        /// <param name="playerId">The player's unique identifier</param>
        /// <param name="parameters">Pagination parameters</param>
        /// <returns>Paged result containing game sessions</returns>
        Task<PagedResult<GameSession>> GetSessionsByPlayerIdPagedAsync(string playerId, PaginationParameters parameters);

        /// <summary>
        /// Gets game sessions for a specific game
        /// </summary>
        /// <param name="gameId">The game's unique identifier</param>
        /// <returns>Collection of game sessions</returns>
        Task<IEnumerable<GameSession>> GetSessionsByGameIdAsync(string gameId);

        /// <summary>
        /// Gets active (ongoing) game sessions
        /// </summary>
        /// <returns>Collection of active game sessions</returns>
        Task<IEnumerable<GameSession>> GetActiveSessionsAsync();

        /// <summary>
        /// Gets recent game sessions for a player within a specific time period
        /// </summary>
        /// <param name="playerId">The player's unique identifier</param>
        /// <param name="daysToLookBack">Number of days to look back</param>
        /// <returns>Collection of recent game sessions</returns>
        Task<IEnumerable<GameSession>> GetRecentSessionsByPlayerIdAsync(string playerId, int daysToLookBack = 30);

        /// <summary>
        /// Gets game sessions for a player within a specific time range
        /// </summary>
        /// <param name="playerId">The player's unique identifier</param>
        /// <param name="startDate">Start date of the range</param>
        /// <param name="endDate">End date of the range</param>
        /// <returns>Collection of game sessions</returns>
        Task<IEnumerable<GameSession>> GetSessionsByPlayerIdAndDateRangeAsync(string playerId, DateTime startDate, DateTime endDate);

        /// <summary>
        /// Gets game sessions by device type
        /// </summary>
        /// <param name="deviceType">The type of device</param>
        /// <returns>Collection of game sessions</returns>
        Task<IEnumerable<GameSession>> GetSessionsByDeviceTypeAsync(string deviceType);

        /// <summary>
        /// Updates the end time and duration of a game session
        /// </summary>
        /// <param name="sessionId">The session's unique identifier</param>
        /// <param name="endTime">The end time</param>
        /// <param name="durationMinutes">The session duration in minutes</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task UpdateSessionEndAsync(string sessionId, DateTime endTime, int durationMinutes);

        /// <summary>
        /// Updates the bet and win amounts for a game session
        /// </summary>
        /// <param name="sessionId">The session's unique identifier</param>
        /// <param name="totalBets">The total bet amount</param>
        /// <param name="totalWins">The total win amount</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task UpdateBetsAndWinsAsync(string sessionId, decimal totalBets, decimal totalWins);

        /// <summary>
        /// Checks if a game session exists
        /// </summary>
        /// <param name="sessionId">The session's unique identifier</param>
        /// <returns>True if the session exists, false otherwise</returns>
        Task<bool> SessionExistsAsync(string sessionId);
    }
}