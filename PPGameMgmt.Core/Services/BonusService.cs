using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.Services
{
    public class BonusService : IBonusService
    {
        private readonly ILogger<BonusService> _logger;
        private readonly IBonusRepository _bonusRepository;
        private readonly IBonusClaimRepository _bonusClaimRepository;
        private readonly IPlayerRepository _playerRepository;

        public BonusService(
            ILogger<BonusService> logger,
            IBonusRepository bonusRepository,
            IBonusClaimRepository bonusClaimRepository,
            IPlayerRepository playerRepository)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _bonusRepository = bonusRepository ?? throw new ArgumentNullException(nameof(bonusRepository));
            _bonusClaimRepository = bonusClaimRepository ?? throw new ArgumentNullException(nameof(bonusClaimRepository));
            _playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
        }

        public async Task<Bonus> GetBonusAsync(string bonusId)
        {
            if (string.IsNullOrEmpty(bonusId))
            {
                throw new ArgumentNullException(nameof(bonusId));
            }
            
            return await _bonusRepository.GetByIdAsync(bonusId);
        }

        public async Task<IEnumerable<Bonus>> GetAllActiveBonusesAsync()
        {
            return await _bonusRepository.GetActiveGlobalBonusesAsync();
        }

        public async Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(BonusType type)
        {
            return await _bonusRepository.GetBonusesByTypeAsync(type);
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForPlayerSegmentAsync(PlayerSegment segment)
        {
            return await _bonusRepository.GetBonusesForPlayerSegmentAsync(segment);
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForGameAsync(string gameId)
        {
            if (string.IsNullOrEmpty(gameId))
            {
                throw new ArgumentNullException(nameof(gameId));
            }
            
            return await _bonusRepository.GetBonusesForGameAsync(gameId);
        }

        public async Task<IEnumerable<BonusClaim>> GetPlayerBonusClaimsAsync(string playerId)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }
            
            return await _bonusClaimRepository.GetClaimsByPlayerAsync(playerId);
        }

        public async Task<BonusClaim> ClaimBonusAsync(string playerId, string bonusId)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }
            
            if (string.IsNullOrEmpty(bonusId))
            {
                throw new ArgumentNullException(nameof(bonusId));
            }

            // Check if player and bonus exist
            var player = await _playerRepository.GetByIdAsync(playerId);
            if (player == null)
            {
                _logger.LogWarning($"Attempt to claim bonus for non-existent player: {playerId}");
                return null;
            }

            var bonus = await _bonusRepository.GetByIdAsync(bonusId);
            if (bonus == null || !bonus.IsActive)
            {
                _logger.LogWarning($"Attempt to claim non-existent or inactive bonus: {bonusId}");
                return null;
            }

            // Check if player has already claimed this bonus
            var existingClaims = await _bonusClaimRepository.GetClaimsByPlayerAsync(playerId);
            if (existingClaims.Any(bc => bc.BonusId == bonusId))
            {
                _logger.LogWarning($"Player {playerId} has already claimed bonus {bonusId}");
                return null;
            }

            // Check if bonus applies to player segment
            if (bonus.TargetSegments != null && bonus.TargetSegments.Length > 0)
            {
                if (!bonus.TargetSegments.Contains(player.Segment))
                {
                    _logger.LogWarning($"Bonus {bonusId} is not applicable for player {playerId} segment {player.Segment}");
                    return null;
                }
            }

            // Create bonus claim
            var bonusClaim = new BonusClaim
            {
                Id = Guid.NewGuid().ToString(),
                PlayerId = playerId,
                BonusId = bonusId,
                ClaimDate = DateTime.UtcNow,
                Status = BonusClaimStatus.Claimed,
                ExpiryDate = DateTime.UtcNow.AddDays(7) // Default expiry of 1 week
            };

            // For deposit-related bonuses, we would handle deposit logic here
            if (bonus.Type == BonusType.DepositMatch || bonus.Type == BonusType.Reload)
            {
                // In a real implementation, this would integrate with a payment system
                // For now, we'll just mark it as requiring a deposit
                bonusClaim.Status = BonusClaimStatus.Active;
            }
            else if (bonus.Type == BonusType.FreeSpins || bonus.Type == BonusType.NoDeposit)
            {
                // These bonuses can be activated immediately
                bonusClaim.Status = BonusClaimStatus.Active;
            }

            // If there are wagering requirements
            if (bonus.WageringRequirement.HasValue)
            {
                bonusClaim.WageringProgress = 0; // Start at 0% progress
            }

            // Save the claim
            await _bonusClaimRepository.AddAsync(bonusClaim);
            _logger.LogInformation($"Player {playerId} claimed bonus {bonusId} successfully");

            return bonusClaim;
        }
    }
}