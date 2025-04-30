using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;
// Use namespace aliases to distinguish between ambiguous types
using CoreEntities = PPGameMgmt.Core.Entities;
using BonusEntities = PPGameMgmt.Core.Entities.Bonuses;

namespace PPGameMgmt.Infrastructure.Services
{
    /// <summary>
    /// Implementation of the bonus service
    /// </summary>
    public class BonusService : IBonusService
    {
        private readonly IBonusRepository _bonusRepository;
        private readonly Core.Interfaces.Repositories.IBonusClaimRepository _bonusClaimRepository;
        private readonly ILogger<BonusService> _logger;

        public BonusService(
            IBonusRepository bonusRepository,
            Core.Interfaces.Repositories.IBonusClaimRepository bonusClaimRepository,
            ILogger<BonusService> logger)
        {
            _bonusRepository = bonusRepository ?? throw new ArgumentNullException(nameof(bonusRepository));
            _bonusClaimRepository = bonusClaimRepository ?? throw new ArgumentNullException(nameof(bonusClaimRepository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task<BonusEntities.Bonus> GetBonusAsync(string bonusId)
        {
            _logger.LogInformation("Getting bonus with ID: {BonusId}", bonusId);

            // This is a stub implementation that would typically interact with the repository
            // In a real implementation, we'd convert from repository model to domain entity
            var result = await _bonusRepository.GetByIdAsync(bonusId);
            return result as BonusEntities.Bonus;
        }

        public async Task<IEnumerable<BonusEntities.Bonus>> GetAllActiveBonusesAsync()
        {
            _logger.LogInformation("Getting all active bonuses");

            // In a real implementation, we'd filter for active bonuses
            var bonuses = await _bonusRepository.GetAllAsync();
            return bonuses
                .Where(b => b is BonusEntities.Bonus)
                .Cast<BonusEntities.Bonus>()
                .Where(b => b.IsActive && b.ValidFrom <= DateTime.UtcNow && b.ValidTo >= DateTime.UtcNow);
        }

        public async Task<IEnumerable<BonusEntities.Bonus>> GetBonusesByTypeAsync(BonusEntities.BonusType type)
        {
            _logger.LogInformation("Getting bonuses of type: {Type}", type);

            // In a real implementation, we'd have a proper filter for bonus types
            var bonuses = await _bonusRepository.GetAllAsync();
            return bonuses
                .Where(b => b is BonusEntities.Bonus)
                .Cast<BonusEntities.Bonus>()
                .Where(b => b.Type == type && b.IsActive);
        }

        public async Task<IEnumerable<BonusEntities.Bonus>> GetBonusesForPlayerSegmentAsync(CoreEntities.PlayerSegment segment)
        {
            _logger.LogInformation("Getting bonuses for player segment: {Segment}", segment);

            // In a real implementation, we'd have a proper filter for player segments
            var bonuses = await _bonusRepository.GetAllAsync();
            return bonuses
                .Where(b => b is BonusEntities.Bonus)
                .Cast<BonusEntities.Bonus>()
                .Where(b => b.IsActive && (
                    // Check if any of the target segments includes the specified segment
                    b.TargetSegments == null ||
                    b.TargetSegments.Length == 0 ||
                    b.TargetSegments.Contains(segment)
                ));
        }

        public async Task<IEnumerable<BonusEntities.Bonus>> GetBonusesForGameAsync(string gameId)
        {
            _logger.LogInformation("Getting bonuses for game: {GameId}", gameId);

            // In a real implementation, we'd have a proper filter for game bonuses
            var bonuses = await _bonusRepository.GetAllAsync();
            return bonuses
                .Where(b => b is BonusEntities.Bonus)
                .Cast<BonusEntities.Bonus>()
                .Where(b => b.IsActive && (
                    // Check if any of the applicable game IDs includes the specified game
                    b.ApplicableGameIds == null ||
                    b.ApplicableGameIds.Length == 0 ||
                    b.ApplicableGameIds.Contains(gameId)
                ));
        }

        public async Task<IEnumerable<BonusEntities.BonusClaim>> GetPlayerBonusClaimsAsync(string playerId)
        {
            _logger.LogInformation("Getting bonus claims for player: {PlayerId}", playerId);

            try
            {
                return await _bonusClaimRepository.GetActiveClaimsByPlayerIdAsync(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bonus claims for player: {PlayerId}", playerId);
                return Array.Empty<BonusEntities.BonusClaim>();
            }
        }

        public async Task<BonusEntities.BonusClaim> ClaimBonusAsync(string playerId, string bonusId)
        {
            _logger.LogInformation("Player {PlayerId} claiming bonus: {BonusId}", playerId, bonusId);

            try
            {
                // Check if the bonus exists and is claimable
                var bonus = await GetBonusAsync(bonusId);
                if (bonus == null)
                {
                    _logger.LogWarning("Bonus {BonusId} not found", bonusId);
                    throw new KeyNotFoundException($"Bonus with ID {bonusId} not found");
                }

                if (!bonus.IsActive || bonus.ValidTo < DateTime.UtcNow)
                {
                    _logger.LogWarning("Bonus {BonusId} is no longer active", bonusId);
                    throw new InvalidOperationException("This bonus is no longer active");
                }

                // Create a new bonus claim
                var claim = new BonusEntities.BonusClaim
                {
                    Id = Guid.NewGuid().ToString(),
                    PlayerId = playerId,
                    BonusId = bonusId,
                    ClaimDate = DateTime.UtcNow,
                    ExpiryDate = DateTime.UtcNow.AddDays(7), // Typically configurable
                    Status = BonusEntities.BonusClaimStatus.Active,
                    WageringRequirement = 30, // Example value, would be based on the bonus
                    WageringProgress = 0,
                    // Initialize required navigation properties with null! since we don't have them yet
                    Player = null!,
                    Bonus = null!
                };

                // In a real implementation, we'd add the claim to the repository
                // and potentially perform additional business logic

                _logger.LogInformation("Created bonus claim for player {PlayerId}, bonus {BonusId}", playerId, bonusId);
                return claim;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing bonus claim for player {PlayerId}, bonus {BonusId}", playerId, bonusId);
                throw;
            }
        }
    }
}