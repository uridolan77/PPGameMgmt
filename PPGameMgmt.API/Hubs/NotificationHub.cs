using Microsoft.AspNetCore.SignalR;
using System.Threading.Tasks;

namespace PPGameMgmt.API.Hubs
{
    /// <summary>
    /// SignalR Hub for handling real-time notifications to clients
    /// </summary>
    public class NotificationHub : Hub
    {
        private readonly ILogger<NotificationHub> _logger;

        public NotificationHub(ILogger<NotificationHub> logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// When a client connects, they can join specific groups based on their user or player ID
        /// </summary>
        public async Task JoinPlayerGroup(string playerId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"player-{playerId}");
            _logger.LogInformation("Client {ConnectionId} joined player group {PlayerId}", Context.ConnectionId, playerId);
        }

        /// <summary>
        /// Allows clients to join a specific game group for updates on game events
        /// </summary>
        public async Task JoinGameGroup(string gameId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"game-{gameId}");
            _logger.LogInformation("Client {ConnectionId} joined game group {GameId}", Context.ConnectionId, gameId);
        }

        /// <summary>
        /// Join the admin dashboard group for management-level notifications
        /// </summary>
        public async Task JoinAdminGroup()
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, "admin");
            _logger.LogInformation("Client {ConnectionId} joined admin group", Context.ConnectionId);
        }

        /// <summary>
        /// Method called when a client disconnects
        /// </summary>
        public override async Task OnDisconnectedAsync(Exception? exception)
        {
            _logger.LogInformation("Client {ConnectionId} disconnected", Context.ConnectionId);
            await base.OnDisconnectedAsync(exception);
        }
    }
}