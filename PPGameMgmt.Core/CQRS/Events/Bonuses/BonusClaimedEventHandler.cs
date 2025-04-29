using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.CQRS.Events.Bonuses
{
    public class BonusClaimedEventHandler : INotificationHandler<BonusClaimedEvent>
    {
        private readonly ILogger<BonusClaimedEventHandler> _logger;
        private readonly INotificationService _notificationService;
        private readonly IFeatureEngineeringService _featureService;

        public BonusClaimedEventHandler(
            ILogger<BonusClaimedEventHandler> logger,
            INotificationService notificationService,
            IFeatureEngineeringService featureService)
        {
            _logger = logger;
            _notificationService = notificationService;
            _featureService = featureService;
        }

        public async Task Handle(BonusClaimedEvent notification, CancellationToken cancellationToken)
        {
            _logger.LogInformation($"Handling BonusClaimedEvent for player {notification.PlayerId}, bonus {notification.BonusId}");
            
            // Send notification to player
            await _notificationService.SendPlayerNotificationAsync(
                notification.PlayerId,
                "BonusClaimed",
                new { BonusId = notification.BonusId, ClaimedAt = notification.ClaimedAt });
            
            // Update player features
            await _featureService.UpdateFeaturesCacheAsync(notification.PlayerId);
        }
    }
}
