using System;
using System.Threading;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.CQRS.Events;
using PPGameMgmt.Core.CQRS.Events.Bonuses;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.CQRS.Commands.Bonuses
{
    public class ClaimBonusCommandHandler : IRequestHandler<ClaimBonusCommand, BonusClaim>
    {
        private readonly IBonusRepository _bonusRepository;
        private readonly IPlayerRepository _playerRepository;
        private readonly IBonusClaimRepository _bonusClaimRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly IDomainEventDispatcher _eventDispatcher;
        private readonly ILogger<ClaimBonusCommandHandler> _logger;

        public ClaimBonusCommandHandler(
            IBonusRepository bonusRepository,
            IPlayerRepository playerRepository,
            IBonusClaimRepository bonusClaimRepository,
            IUnitOfWork unitOfWork,
            IDomainEventDispatcher eventDispatcher,
            ILogger<ClaimBonusCommandHandler> logger)
        {
            _bonusRepository = bonusRepository;
            _playerRepository = playerRepository;
            _bonusClaimRepository = bonusClaimRepository;
            _unitOfWork = unitOfWork;
            _eventDispatcher = eventDispatcher;
            _logger = logger;
        }

        public async Task<BonusClaim> Handle(ClaimBonusCommand request, CancellationToken cancellationToken)
        {
            // Validate player and bonus exist
            var player = await _playerRepository.GetByIdAsync(request.PlayerId);
            if (player == null)
            {
                throw new ArgumentException($"Player with ID {request.PlayerId} not found");
            }

            var bonus = await _bonusRepository.GetByIdAsync(request.BonusId);
            if (bonus == null)
            {
                throw new ArgumentException($"Bonus with ID {request.BonusId} not found");
            }

            // Check if bonus is active
            if (!bonus.IsActive || DateTime.UtcNow < bonus.StartDate || DateTime.UtcNow > bonus.EndDate)
            {
                throw new InvalidOperationException($"Bonus {request.BonusId} is not currently active");
            }

            // Check if player is eligible for this bonus
            if (!bonus.IsGlobal && bonus.TargetSegment != player.Segment)
            {
                throw new InvalidOperationException($"Player {request.PlayerId} is not eligible for bonus {request.BonusId}");
            }

            // Create bonus claim
            var bonusClaim = new BonusClaim
            {
                Id = Guid.NewGuid().ToString(),
                PlayerId = request.PlayerId,
                BonusId = request.BonusId,
                ClaimDate = DateTime.UtcNow,
                Status = BonusClaimStatus.Claimed
            };

            // Save to database
            await _bonusClaimRepository.AddAsync(bonusClaim);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation($"Player {request.PlayerId} claimed bonus {request.BonusId}");

            // Raise domain event
            var bonusClaimedEvent = new BonusClaimedEvent
            {
                PlayerId = request.PlayerId,
                BonusId = request.BonusId,
                ClaimedAt = DateTime.UtcNow
            };

            await _eventDispatcher.DispatchAsync(bonusClaimedEvent);

            return bonusClaim;
        }
    }
}
