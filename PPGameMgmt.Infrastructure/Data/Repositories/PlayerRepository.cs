using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    public class PlayerRepository : Repository<Player>, IPlayerRepository
    {
        private readonly ILogger<PlayerRepository> _logger;

        public PlayerRepository(CasinoDbContext context, ILogger<PlayerRepository> logger = null)
            : base(context, logger)
        {
            _logger = logger;
        }

        public override async Task<Player> GetByIdAsync(string id)
        {
            try
            {
                _logger?.LogInformation($"Getting player with ID: {id}");

                // Use EF Core to get the player by ID
                var player = await _context.Players.FindAsync(id);

                _logger?.LogInformation(player != null
                    ? $"Retrieved player with ID: {id}"
                    : $"No player found with ID: {id}");

                return player;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving player with ID: {id}");
                throw;
            }
        }

        public override async Task<IEnumerable<Player>> GetAllAsync()
        {
            try
            {
                _logger?.LogInformation("Getting all players");

                // Use EF Core to get all players
                var players = await _context.Players.ToListAsync();

                _logger?.LogInformation($"Retrieved {players.Count} players");

                return players;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error retrieving all players");
                throw;
            }
        }

        public override async Task<IEnumerable<Player>> FindAsync(Expression<Func<Player, bool>> predicate)
        {
            try
            {
                return await _context.Players.Where(predicate).ToListAsync();
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, "Error finding players with predicate");
                throw;
            }
        }

        // Note: AddAsync, UpdateAsync, and DeleteAsync are inherited from the base Repository class
        // and don't need to be overridden unless custom behavior is needed

        public async Task<Player> GetPlayerWithSessionsAndBonusesAsync(string playerId)
        {
            try
            {
                _logger?.LogInformation($"Getting player with sessions and bonuses for ID: {playerId}");

                // Get player with related data using EF Core Include
                var player = await _context.Players
                    .Where(p => p.Id == playerId)
                    .FirstOrDefaultAsync();

                if (player == null)
                {
                    return null;
                }

                // Load game sessions
                player.GameSessions = await _context.GameSessions
                    .Where(gs => gs.PlayerId == playerId)
                    .ToListAsync();

                // Load bonus claims
                player.BonusClaims = await _context.BonusClaims
                    .Where(bc => bc.PlayerId == playerId)
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved player with {player.GameSessions.Count} sessions and {player.BonusClaims.Count} bonus claims");

                return player;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving player with sessions and bonuses for ID: {playerId}");
                throw;
            }
        }

        public async Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment)
        {
            try
            {
                _logger?.LogInformation($"Getting players by segment: {segment}");

                // Use EF Core to get players by segment
                var players = await _context.Players
                    .Where(p => p.Segment == segment)
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved {players.Count} players with segment {segment}");

                return players;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving players by segment: {segment}");
                throw;
            }
        }

        public async Task<IEnumerable<Player>> GetActivePlayers(int daysActive)
        {
            try
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-daysActive);

                _logger?.LogInformation($"Getting active players since {cutoffDate}");

                // Use EF Core to get active players
                var players = await _context.Players
                    .Where(p => p.LastLoginDate >= cutoffDate)
                    .ToListAsync();

                _logger?.LogInformation($"Retrieved {players.Count} active players");

                return players;
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error retrieving active players for the last {daysActive} days");
                throw;
            }
        }

        public async Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment)
        {
            try
            {
                _logger?.LogInformation($"Updating player {playerId} segment to {segment}");

                var player = await _context.Players.FindAsync(playerId);

                if (player != null)
                {
                    player.Segment = segment;
                    _context.Players.Update(player);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation($"Successfully updated player {playerId} segment to {segment}");
                }
                else
                {
                    _logger?.LogWarning($"Player {playerId} not found for segment update");
                }
            }
            catch (Exception ex)
            {
                _logger?.LogError(ex, $"Error updating player {playerId} segment to {segment}");
                throw;
            }
        }
    }
}