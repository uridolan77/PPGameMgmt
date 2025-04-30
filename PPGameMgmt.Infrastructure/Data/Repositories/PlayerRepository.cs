using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Entities.Bonuses;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    /// <summary>
    /// Repository implementation for Player entity
    /// </summary>
    public class PlayerRepository : Repository<Player>, IPlayerRepository
    {
        private readonly ILogger<PlayerRepository> _logger;
        private const string _entityName = "Player";

        public PlayerRepository(CasinoDbContext context, ILogger<PlayerRepository> logger = null)
            : base(context, logger)
        {
            _logger = logger;
        }

        public override async Task<Player> GetByIdAsync(string id)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting player with ID: {id}");

                    // Use EF Core to get the player by ID
                    var player = await _context.Players.FindAsync(id);

                    _logger?.LogInformation(player != null
                        ? $"Retrieved player with ID: {id}"
                        : $"No player found with ID: {id}");

                    return player;
                },
                _entityName,
                $"Error retrieving player with ID: {id}",
                _logger
            );
        }

        public override async Task<IEnumerable<Player>> GetAllAsync()
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting all players");

                    // Use EF Core to get all players
                    var players = await _context.Players.ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} players");

                    return players;
                },
                _entityName,
                "Error retrieving all players",
                _logger
            );
        }

        public override async Task<IEnumerable<Player>> FindAsync(Expression<Func<Player, bool>> predicate)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => await _context.Players.Where(predicate).ToListAsync(),
                _entityName,
                "Error finding players with predicate",
                _logger
            );
        }

        public async Task<Player> GetPlayerWithSessionsAndBonusesAsync(string playerId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting player with sessions and bonuses for ID: {playerId}");

                    // Get player with related data using EF Core Include
                    var player = await _context.Players
                        .Where(p => p.Id == playerId)
                        .FirstOrDefaultAsync();

                    if (player == null)
                    {
                        throw new EntityNotFoundException(_entityName, playerId);
                    }

                    // Load game sessions
                    player.GameSessions = await _context.Set<GameSession>()
                        .Where(gs => gs.PlayerId == playerId)
                        .ToListAsync();

                    // Load bonus claims
                    var bonusClaims = await _context.Set<BonusClaim>()
                        .Where(bc => bc.PlayerId == playerId)
                        .ToListAsync();

                    foreach (var claim in bonusClaims)
                    {
                        player.BonusClaims.Add(claim);
                    }

                    _logger?.LogInformation("Retrieved player with {SessionCount} sessions and {ClaimCount} bonus claims",
                        player.GameSessions.Count, player.BonusClaims.Count);

                    return player;
                },
                _entityName,
                $"Error retrieving player with sessions and bonuses for ID: {playerId}",
                _logger
            );
        }

        public async Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting players by segment: {segment}");

                    // Use EF Core to get players by segment
                    var players = await _context.Players
                        .Where(p => p.Segment == segment)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} players with segment {segment}");

                    return players;
                },
                _entityName,
                $"Error retrieving players by segment: {segment}",
                _logger
            );
        }

        public async Task<PagedResult<Player>> GetPlayersBySegmentPagedAsync(PlayerSegment segment, PaginationParameters parameters)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting paged players by segment: {segment}, Page: {parameters.PageNumber}, Size: {parameters.PageSize}");

                    // Create query for players in the segment
                    var query = _context.Players.Where(p => p.Segment == segment);

                    // Get total count
                    var totalCount = await query.CountAsync();

                    // Apply pagination
                    var players = await query
                        .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                        .Take(parameters.PageSize)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} players on page {parameters.PageNumber} out of {totalCount} total players");

                    return new PagedResult<Player>(players, totalCount, parameters.PageNumber, parameters.PageSize);
                },
                _entityName,
                $"Error retrieving paged players by segment: {segment}",
                _logger
            );
        }

        public async Task<IEnumerable<Player>> GetActivePlayersAsync(int daysActive)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting active players within the last {daysActive} days");

                    var cutoffDate = DateTime.UtcNow.AddDays(-daysActive);

                    var players = await _context.Players
                        .Where(p => p.LastLoginDate >= cutoffDate)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} active players");

                    return players;
                },
                _entityName,
                $"Error retrieving active players within the last {daysActive} days",
                _logger
            );
        }

        public async Task<PagedResult<Player>> GetActivePlayersPagedAsync(int daysActive, PaginationParameters parameters)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting paged active players within the last {daysActive} days, Page: {parameters.PageNumber}, Size: {parameters.PageSize}");

                    var cutoffDate = DateTime.UtcNow.AddDays(-daysActive);

                    // Create query for active players
                    var query = _context.Players.Where(p => p.LastLoginDate >= cutoffDate);

                    // Get total count
                    var totalCount = await query.CountAsync();

                    // Apply pagination
                    var players = await query
                        .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                        .Take(parameters.PageSize)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} active players on page {parameters.PageNumber} out of {totalCount} total active players");

                    return new PagedResult<Player>(players, totalCount, parameters.PageNumber, parameters.PageSize);
                },
                _entityName,
                $"Error retrieving paged active players within the last {daysActive} days",
                _logger
            );
        }

        public async Task<IEnumerable<Player>> GetTopValuePlayersAsync(int count)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting top {count} value players");

                    var players = await _context.Players
                        .OrderByDescending(p => p.TotalDeposits - p.TotalWithdrawals)
                        .Take(count)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} top value players");

                    return players;
                },
                _entityName,
                $"Error retrieving top {count} value players",
                _logger
            );
        }

        public async Task<IEnumerable<Player>> GetPlayersByGamePlayedAsync(string gameId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting players who have played game with ID: {gameId}");

                    var playerIds = await _context.Set<GameSession>()
                        .Where(gs => gs.GameId == gameId)
                        .Select(gs => gs.PlayerId)
                        .Distinct()
                        .ToListAsync();

                    var players = await _context.Players
                        .Where(p => playerIds.Contains(p.Id))
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} players who have played game with ID: {gameId}");

                    return players;
                },
                _entityName,
                $"Error retrieving players who have played game with ID: {gameId}",
                _logger
            );
        }

        public async Task<IEnumerable<Player>> GetPlayersByBonusClaimedAsync(string bonusId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting players who have claimed bonus with ID: {bonusId}");

                    var playerIds = await _context.Set<BonusClaim>()
                        .Where(bc => bc.BonusId == bonusId)
                        .Select(bc => bc.PlayerId)
                        .Distinct()
                        .ToListAsync();

                    var players = await _context.Players
                        .Where(p => playerIds.Contains(p.Id))
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} players who have claimed bonus with ID: {bonusId}");

                    return players;
                },
                _entityName,
                $"Error retrieving players who have claimed bonus with ID: {bonusId}",
                _logger
            );
        }

        public async Task<IEnumerable<Player>> GetPlayersByMinimumDepositAsync(decimal depositAmount)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Getting players with total deposits >= {depositAmount}");

                    var players = await _context.Players
                        .Where(p => p.TotalDeposits >= depositAmount)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} players with total deposits >= {depositAmount}");

                    return players;
                },
                _entityName,
                $"Error retrieving players with total deposits >= {depositAmount}",
                _logger
            );
        }

        public async Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Updating player segment for ID: {playerId} to {segment}");

                    var player = await _context.Players.FindAsync(playerId);

                    if (player == null)
                    {
                        throw new EntityNotFoundException(_entityName, playerId);
                    }

                    player.Segment = segment;

                    // Update the entity
                    _context.Players.Update(player);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation($"Updated player segment for ID: {playerId} to {segment}");

                    return true;
                },
                _entityName,
                $"Error updating player segment for ID: {playerId}",
                _logger
            );
        }

        public async Task<bool> PlayerExistsAsync(string playerId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Checking if player with ID: {playerId} exists");

                    var exists = await _context.Players
                        .AnyAsync(p => p.Id == playerId);

                    _logger?.LogInformation($"Player with ID: {playerId} exists: {exists}");

                    return exists;
                },
                _entityName,
                $"Error checking if player with ID: {playerId} exists",
                _logger
            );
        }
    }
}