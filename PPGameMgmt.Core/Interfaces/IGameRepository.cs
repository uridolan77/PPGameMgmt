using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Core.Interfaces.Repositories;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for Game repository operations
    /// </summary>
    public interface IGameRepository : Repositories.IRepository<Game>
    {
        /// <summary>
        /// Gets a game by string ID (overload of the Guid version from IRepository)
        /// </summary>
        /// <param name="id">The game's string identifier</param>
        /// <returns>Game entity if found</returns>
        Task<Game> GetByIdAsync(string id);

        /// <summary>
        /// Gets games by their type
        /// </summary>
        /// <param name="type">The game type to filter by</param>
        /// <returns>Collection of games of the specified type</returns>
        Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type);

        /// <summary>
        /// Gets games by their category
        /// </summary>
        /// <param name="category">The game category to filter by</param>
        /// <returns>Collection of games in the specified category</returns>
        Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category);

        /// <summary>
        /// Gets most popular games based on play count or rating
        /// </summary>
        /// <param name="count">Maximum number of games to return</param>
        /// <returns>Collection of popular games</returns>
        Task<IEnumerable<Game>> GetPopularGamesAsync(int count);

        /// <summary>
        /// Gets the most recently released games
        /// </summary>
        /// <param name="count">Maximum number of games to return</param>
        /// <returns>Collection of new game releases</returns>
        Task<IEnumerable<Game>> GetNewReleasesAsync(int count);

        /// <summary>
        /// Searches for games that match the search term in name, provider, or description
        /// </summary>
        /// <param name="searchTerm">The term to search for</param>
        /// <returns>Collection of games matching the search term</returns>
        Task<IEnumerable<Game>> SearchGamesAsync(string searchTerm);

        /// <summary>
        /// Gets games provided by a specific game provider
        /// </summary>
        /// <param name="provider">The name of the game provider</param>
        /// <returns>Collection of games from the specified provider</returns>
        Task<IEnumerable<Game>> GetGamesByProviderAsync(string provider);

        /// <summary>
        /// Gets games within a specified RTP (Return to Player) range
        /// </summary>
        /// <param name="minRtp">Minimum RTP percentage</param>
        /// <param name="maxRtp">Maximum RTP percentage</param>
        /// <returns>Collection of games within the RTP range</returns>
        Task<IEnumerable<Game>> GetGamesByRtpRangeAsync(decimal minRtp, decimal maxRtp);

        /// <summary>
        /// Gets games that are compatible with a specific device type
        /// </summary>
        /// <param name="deviceType">The type of device to check compatibility for</param>
        /// <returns>Collection of compatible games</returns>
        Task<IEnumerable<Game>> GetGamesByDeviceCompatibilityAsync(string deviceType);

        /// <summary>
        /// Gets games that support a specific feature (e.g., "Bonus Buy", "Free Spins")
        /// </summary>
        /// <param name="featureName">The name of the feature to filter by</param>
        /// <returns>Collection of games with the specified feature</returns>
        Task<IEnumerable<Game>> GetGamesByFeatureAsync(string featureName);

        /// <summary>
        /// Updates the popularity score of a game
        /// </summary>
        /// <param name="gameId">The game's unique identifier</param>
        /// <param name="newPopularityScore">The new popularity score</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task UpdateGamePopularityScoreAsync(string gameId, int newPopularityScore);

        /// <summary>
        /// Checks if a game exists
        /// </summary>
        /// <param name="gameId">The game's unique identifier</param>
        /// <returns>True if the game exists, false otherwise</returns>
        Task<bool> GameExistsAsync(string gameId);
    }
}