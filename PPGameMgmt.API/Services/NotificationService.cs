using Microsoft.AspNetCore.SignalR;
using PPGameMgmt.API.Hubs;
using PPGameMgmt.Core.Interfaces;
using System.Threading.Tasks;

namespace PPGameMgmt.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly IHubContext<NotificationHub> _hubContext;
        private readonly ILogger<NotificationService> _logger;

        public NotificationService(
            IHubContext<NotificationHub> hubContext,
            ILogger<NotificationService> logger)
        {
            _hubContext = hubContext;
            _logger = logger;
        }

        public async Task SendPlayerNotificationAsync(string playerId, string notificationType, object payload)
        {
            _logger.LogInformation("Sending {NotificationType} notification to player {PlayerId}", notificationType, playerId);
            await _hubContext.Clients.Group($"player-{playerId}").SendAsync("ReceiveNotification", notificationType, payload);
        }

        public async Task SendGameNotificationAsync(string gameId, string notificationType, object payload)
        {
            _logger.LogInformation("Sending {NotificationType} notification for game {GameId}", notificationType, gameId);
            await _hubContext.Clients.Group($"game-{gameId}").SendAsync("ReceiveNotification", notificationType, payload);
        }

        public async Task SendAdminNotificationAsync(string notificationType, object payload)
        {
            _logger.LogInformation("Sending {NotificationType} notification to admin group", notificationType);
            await _hubContext.Clients.Group("admin").SendAsync("ReceiveNotification", notificationType, payload);
        }

        public async Task BroadcastNotificationAsync(string notificationType, object payload)
        {
            _logger.LogInformation("Broadcasting {NotificationType} notification to all clients", notificationType);
            await _hubContext.Clients.All.SendAsync("ReceiveNotification", notificationType, payload);
        }
    }
}