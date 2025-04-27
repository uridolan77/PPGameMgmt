using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Service responsible for extracting, processing, and providing player features
    /// </summary>
    public interface IFeatureEngineeringService
    {
        /// <summary>
        /// Gets cached player features if available
        /// </summary>
        /// <param name="playerId">The player identifier</param>
        /// <returns>Player features or null if not cached</returns>
        Task<PlayerFeatures> GetCachedFeaturesAsync(string playerId);
        
        /// <summary>
        /// Extracts features for a player from various data sources
        /// </summary>
        /// <param name="playerId">The player identifier</param>
        /// <returns>Extracted player features</returns>
        Task<PlayerFeatures> ExtractFeaturesAsync(string playerId);
        
        /// <summary>
        /// Updates the features cache for a player
        /// </summary>
        /// <param name="playerId">The player identifier</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task UpdateFeaturesCacheAsync(string playerId);
        
        /// <summary>
        /// Invalidates cached features for a player
        /// </summary>
        /// <param name="playerId">The player identifier</param>
        /// <returns>Task representing the asynchronous operation</returns>
        Task InvalidateFeaturesAsync(string playerId);
    }
}