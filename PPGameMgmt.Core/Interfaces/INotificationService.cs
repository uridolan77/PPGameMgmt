using System.Threading.Tasks;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Service for sending real-time notifications to clients
    /// </summary>
    public interface INotificationService
    {
        /// <summary>
        /// Send a notification to a specific player
        /// </summary>
        Task SendPlayerNotificationAsync(string playerId, string notificationType, object payload);
        
        /// <summary>
        /// Send a notification to all clients watching a specific game
        /// </summary>
        Task SendGameNotificationAsync(string gameId, string notificationType, object payload);
        
        /// <summary>
        /// Send a notification to all admin users
        /// </summary>
        Task SendAdminNotificationAsync(string notificationType, object payload);
        
        /// <summary>
        /// Broadcast a notification to all connected clients
        /// </summary>
        Task BroadcastNotificationAsync(string notificationType, object payload);
    }
}