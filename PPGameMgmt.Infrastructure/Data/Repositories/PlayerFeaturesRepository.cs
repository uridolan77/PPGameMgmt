using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class PlayerFeaturesRepository : Repository<PlayerFeatures>, IPlayerFeaturesRepository
    {
        private readonly ILogger<PlayerFeaturesRepository> _logger;

        public PlayerFeaturesRepository(CasinoDbContext context, ILogger<PlayerFeaturesRepository> logger = null)
            : base(context, logger)
        {
            _logger = logger;
        }

        public async Task<PlayerFeatures> GetLatestFeaturesForPlayerAsync(string playerId)
        {
            try
            {
                _logger?.LogInformation($"Getting latest features for player: {playerId}");

                var features = await _context.PlayerFeatures
                    .Where(pf => pf.PlayerId == playerId)
                    .OrderByDescending(pf => pf.GeneratedDate)
                    .FirstOrDefaultAsync();

                _logger?.LogInformation(features != null
                    ? $"Retrieved latest features for player: {playerId}"
                    : $"No features found for player: {playerId}");

                return features;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving latest features for player: {playerId}");
                throw;
            }
        }

        public async Task<IEnumerable<PlayerFeatures>> GetFeaturesForPlayersAsync(IEnumerable<string> playerIds)
        {
            try
            {
                _logger?.LogInformation($"Getting features for {playerIds.Count()} players");

                var features = new List<PlayerFeatures>();
                foreach (var playerId in playerIds)
                {
                    var playerFeatures = await GetLatestFeaturesForPlayerAsync(playerId);
                    if (playerFeatures != null)
                    {
                        features.Add(playerFeatures);
                    }
                }

                _logger?.LogInformation($"Retrieved features for {features.Count} players");

                return features;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving features for multiple players");
                throw;
            }
        }

        public async Task<IEnumerable<PlayerFeatures>> GetFeaturesForSegmentAsync(PlayerSegment segment)
        {
            try
            {
                _logger?.LogInformation($"Getting features for player segment: {segment}");

                // Get the latest features for each player in the segment
                var features = await _context.PlayerFeatures
                    .Where(pf => pf.CurrentSegment == segment)
                    .GroupBy(pf => pf.PlayerId)
                    .Select(g => g.OrderByDescending(pf => pf.GeneratedDate).FirstOrDefault())
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved features for {features.Count} players in segment {segment}");

                return features;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving features for player segment: {segment}");
                throw;
            }
        }
    }
}
