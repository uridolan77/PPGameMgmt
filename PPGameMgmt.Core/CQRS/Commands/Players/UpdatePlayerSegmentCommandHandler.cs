using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.CQRS.Events;
using PPGameMgmt.Core.CQRS.Events.Players;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.CQRS.Commands.Players
{
    public class UpdatePlayerSegmentCommandHandler : IRequestHandler<UpdatePlayerSegmentCommand, bool>
    {
        private readonly IPlayerRepository _repository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDomainEventDispatcher _eventDispatcher;
        private readonly ILogger<UpdatePlayerSegmentCommandHandler> _logger;

        public UpdatePlayerSegmentCommandHandler(
            IPlayerRepository repository,
            IUnitOfWork unitOfWork,
            IDomainEventDispatcher eventDispatcher,
            ILogger<UpdatePlayerSegmentCommandHandler> logger)
        {
            _repository = repository;
            _unitOfWork = unitOfWork;
            _eventDispatcher = eventDispatcher;
            _logger = logger;
        }

        public async Task<bool> Handle(UpdatePlayerSegmentCommand request, CancellationToken cancellationToken)
        {
            // Get the player to determine the old segment
            var player = await _repository.GetByIdAsync(request.PlayerId);
            if (player == null)
            {
                _logger.LogWarning($"Player with ID {request.PlayerId} not found when trying to update segment");
                return false;
            }

            var oldSegment = player.Segment;

            // Update the segment
            await _repository.UpdatePlayerSegmentAsync(request.PlayerId, request.Segment);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation($"Updated player {request.PlayerId} segment from {oldSegment} to {request.Segment}");

            // Raise domain event if segment actually changed
            if (oldSegment != request.Segment)
            {
                var segmentChangedEvent = new PlayerSegmentChangedEvent
                {
                    PlayerId = request.PlayerId,
                    OldSegment = oldSegment,
                    NewSegment = request.Segment
                };

                await _eventDispatcher.DispatchAsync(segmentChangedEvent);
            }

            return true;
        }
    }
}
