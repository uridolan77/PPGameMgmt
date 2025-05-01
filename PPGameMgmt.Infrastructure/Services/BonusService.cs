using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Bonuses;

namespace PPGameMgmt.Infrastructure.Services
{
    /// <summary>
    /// Implementation of the bonus service
    /// </summary>
    public class BonusService : IBonusService
    {
        private readonly IBonusRepository _bonusRepository;
        private readonly Core.Interfaces.Repositories.IBonusClaimRepository _bonusClaimRepository;
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<BonusService> _logger;

        public BonusService(
            IBonusRepository bonusRepository,
            Core.Interfaces.Repositories.IBonusClaimRepository bonusClaimRepository,
            IUnitOfWork unitOfWork,
            ILogger<BonusService> logger)
        {
            _bonusRepository = bonusRepository ?? throw new ArgumentNullException(nameof(bonusRepository));
            _bonusClaimRepository = bonusClaimRepository ?? throw new ArgumentNullException(nameof(bonusClaimRepository));
            _unitOfWork = unitOfWork ?? throw new ArgumentNullException(nameof(unitOfWork));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _logger.LogDebug("BonusService initialized with repositories: {BonusRepoType}, {ClaimRepoType}", 
                bonusRepository.GetType().Name, 
                bonusClaimRepository.GetType().Name);
        }

        public async Task<Bonus> GetBonusAsync(string bonusId)
        {
            try
            {
                _logger.LogDebug("Getting bonus with ID: {BonusId}", bonusId);
                var result = await _bonusRepository.GetByIdAsync(bonusId);
                
                if (result == null)
                {
                    _logger.LogWarning("Bonus with ID {BonusId} not found", bonusId);
                    return null;
                }

                if (result is not Bonus bonus)
                {
                    _logger.LogError("Invalid bonus type returned from repository for ID {BonusId}. Expected: Bonus, Got: {ActualType}", 
                        bonusId, result.GetType().Name);
                    throw new InvalidCastException($"Expected type Bonus but got {result.GetType().Name}");
                }

                _logger.LogDebug("Successfully retrieved bonus {BonusId} of type {BonusType}", bonusId, bonus.Type);
                return bonus;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bonus with ID {BonusId}. Exception: {ExceptionType} - {ExceptionMessage}", 
                    bonusId, ex.GetType().Name, ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<Bonus>> GetAllActiveBonusesAsync()
        {
            try
            {
                _logger.LogDebug("Getting all active bonuses");
                var bonuses = await _bonusRepository.GetAllAsync();
                _logger.LogDebug("Retrieved {Count} bonuses from repository", bonuses?.Count() ?? 0);
                
                var activeBonuses = bonuses
                    .OfType<Bonus>()
                    .Where(b => b.IsActive && b.ValidFrom <= DateTime.UtcNow && b.ValidTo >= DateTime.UtcNow)
                    .ToList();

                _logger.LogDebug("Found {Count} active bonuses", activeBonuses.Count);
                return activeBonuses;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving all active bonuses. Exception: {ExceptionType} - {ExceptionMessage}", 
                    ex.GetType().Name, ex.Message);
                throw;
            }
        }

        public async Task<IEnumerable<Bonus>> GetBonusesByTypeAsync(BonusType type)
        {
            try
            {
                _logger.LogInformation("Getting bonuses of type: {Type}", type);
                var bonuses = await _bonusRepository.GetAllAsync();
                
                return bonuses
                    .OfType<Bonus>()
                    .Where(b => b.Type == type && b.IsActive)
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bonuses of type {Type}", type);
                throw;
            }
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForPlayerSegmentAsync(PlayerSegment segment)
        {
            try
            {
                _logger.LogInformation("Getting bonuses for player segment: {Segment}", segment);
                var bonuses = await _bonusRepository.GetAllAsync();
                
                return bonuses
                    .OfType<Bonus>()
                    .Where(b => b.IsActive && (
                        b.TargetSegments == null ||
                        b.TargetSegments.Length == 0 ||
                        b.TargetSegments.Contains(segment)
                    ))
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bonuses for player segment {Segment}", segment);
                throw;
            }
        }

        public async Task<IEnumerable<Bonus>> GetBonusesForGameAsync(string gameId)
        {
            try
            {
                _logger.LogInformation("Getting bonuses for game: {GameId}", gameId);
                var bonuses = await _bonusRepository.GetAllAsync();
                
                return bonuses
                    .OfType<Bonus>()
                    .Where(b => b.IsActive && (
                        b.ApplicableGameIds == null ||
                        b.ApplicableGameIds.Length == 0 ||
                        b.ApplicableGameIds.Contains(gameId)
                    ))
                    .ToList();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bonuses for game {GameId}", gameId);
                throw;
            }
        }

        public async Task<IEnumerable<BonusClaim>> GetPlayerBonusClaimsAsync(string playerId)
        {
            try
            {
                _logger.LogInformation("Getting bonus claims for player: {PlayerId}", playerId);
                return await _bonusClaimRepository.GetActiveClaimsByPlayerIdAsync(playerId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving bonus claims for player: {PlayerId}", playerId);
                throw;
            }
        }

        public async Task<BonusClaim> ClaimBonusAsync(string playerId, string bonusId)
        {
            try
            {
                _logger.LogInformation("Player {PlayerId} claiming bonus: {BonusId}", playerId, bonusId);

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
                var claim = new BonusClaim
                {
                    Id = Guid.NewGuid().ToString(),
                    PlayerId = playerId,
                    BonusId = bonusId,
                    ClaimDate = DateTime.UtcNow,
                    ExpiryDate = DateTime.UtcNow.AddDays(7), // Typically configurable
                    Status = BonusClaimStatus.Active,
                    WageringRequirement = bonus.WageringRequirement,
                    WageringProgress = 0,
                    Player = null!,
                    Bonus = null!
                };

                // Save the claim
                await _bonusClaimRepository.AddAsync(claim);
                await _unitOfWork.SaveChangesAsync();

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