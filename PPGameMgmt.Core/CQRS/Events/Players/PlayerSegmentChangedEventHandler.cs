using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.CQRS.Events.Players
{
    public class PlayerSegmentChangedEventHandler : INotificationHandler<PlayerSegmentChangedEvent>
    {
        private readonly ILogger<PlayerSegmentChangedEventHandler> _logger;
        private readonly INotificationService _notificationService;
        private readonly IFeatureEngineeringService _featureService;

        public PlayerSegmentChangedEventHandler(
            ILogger<PlayerSegmentChangedEventHandler> logger,
            INotificationService notificationService,
            IFeatureEngineeringService featureService)
        {
            _logger = logger;
            _notificationService = notificationService;
            _featureService = featureService;
        }

        public async Task Handle(PlayerSegmentChangedEvent notification, CancellationToken cancellationToken)
        {
            _logger.LogInformation($"Handling PlayerSegmentChangedEvent for player {notification.PlayerId}, " +
                                  $"segment changed from {notification.OldSegment} to {notification.NewSegment}");
            
            // Send notification to player
            await _notificationService.SendPlayerNotificationAsync(
                notification.PlayerId,
                "SegmentChanged",
                new { OldSegment = notification.OldSegment, NewSegment = notification.NewSegment });
            
            // Send notification to admins
            await _notificationService.SendAdminNotificationAsync(
                "PlayerSegmentChanged",
                new { 
                    PlayerId = notification.PlayerId,
                    OldSegment = notification.OldSegment,
                    NewSegment = notification.NewSegment
                });
            
            // Update player features
            await _featureService.UpdateFeaturesCacheAsync(notification.PlayerId);
        }
    }
}
