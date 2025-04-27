using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.Services
{
    public class PlayerService : IPlayerService
    {
        private readonly ILogger<PlayerService> _logger;
        private readonly IPlayerRepository _playerRepository;
        private readonly IFeatureEngineeringService _featureService;

        public PlayerService(
            ILogger<PlayerService> logger,
            IPlayerRepository playerRepository,
            IFeatureEngineeringService featureService)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
            _featureService = featureService ?? throw new ArgumentNullException(nameof(featureService));
        }

        public async Task<Player> GetPlayerAsync(string playerId)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }

            return await _playerRepository.GetByIdAsync(playerId);
        }

        public async Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment)
        {
            return await _playerRepository.GetPlayersBySegmentAsync(segment);
        }

        public async Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }

            await _playerRepository.UpdatePlayerSegmentAsync(playerId, segment);
            _logger.LogInformation($"Updated player {playerId} segment to {segment}");
        }

        public async Task<IEnumerable<Player>> GetActivePlayers(int daysActive)
        {
            if (daysActive <= 0)
            {
                throw new ArgumentException("Days active must be positive", nameof(daysActive));
            }

            return await _playerRepository.GetActivePlayers(daysActive);
        }

        public async Task<bool> IsPlayerActive(string playerId, int days)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }

            if (days <= 0)
            {
                throw new ArgumentException("Days must be positive", nameof(days));
            }

            var player = await _playerRepository.GetByIdAsync(playerId);
            if (player == null)
            {
                return false;
            }

            var cutoffDate = DateTime.UtcNow.AddDays(-days);
            return player.LastLoginDate >= cutoffDate;
        }

        public async Task<decimal> GetPlayerValueAsync(string playerId)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }

            var player = await _playerRepository.GetByIdAsync(playerId);
            if (player == null)
            {
                return 0;
            }

            // A simple player value calculation based on deposits and withdrawals
            // In a real application, this would be more sophisticated
            var value = player.TotalDeposits - player.TotalWithdrawals;

            // Could also consider other factors like:
            // - Frequency of play
            // - Average bet size
            // - Bonus usage
            // - Referrals made
            // - etc.

            return value;
        }

        public async Task<PlayerFeatures> GetPlayerFeaturesAsync(string playerId)
        {
            if (string.IsNullOrEmpty(playerId))
            {
                throw new ArgumentNullException(nameof(playerId));
            }

            try
            {
                // First try to get cached features
                var features = await _featureService.GetCachedFeaturesAsync(playerId);
                
                // If no cached features, extract them
                if (features == null)
                {
                    _logger.LogInformation($"No cached features found for player {playerId}, extracting new features");
                    features = await _featureService.ExtractFeaturesAsync(playerId);
                    
                    // Update the cache with the new features
                    await _featureService.UpdateFeaturesCacheAsync(playerId);
                }
                
                return features;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving features for player {playerId}");
                throw;
            }
        }

        public async Task<Player> AddPlayerAsync(Player player)
        {
            if (player == null)
            {
                throw new ArgumentNullException(nameof(player));
            }

            // Validate player data
            if (string.IsNullOrEmpty(player.Id))
            {
                throw new ArgumentException("Player ID is required", nameof(player));
            }

            // Check if player already exists
            var existingPlayer = await _playerRepository.GetByIdAsync(player.Id);
            if (existingPlayer != null)
            {
                throw new InvalidOperationException($"Player with ID {player.Id} already exists");
            }

            // Set default segment if not specified
            if (player.Segment == default)
            {
                player.Segment = PlayerSegment.New;
            }

            // Set registration date if not specified
            if (player.RegistrationDate == default)
            {
                player.RegistrationDate = DateTime.UtcNow;
            }

            // Add the player to the repository
            await _playerRepository.AddAsync(player);
            _logger.LogInformation($"Added new player with ID {player.Id}");

            // Return the player object
            return player;
        }
    }
}