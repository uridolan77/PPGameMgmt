using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
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
                    player.GameSessions = await _context.GameSessions
                        .Where(gs => gs.PlayerId == playerId)
                        .ToListAsync();

                    // Load bonus claims
                    player.BonusClaims = await _context.BonusClaims
                        .Where(bc => bc.PlayerId == playerId)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved player with {player.GameSessions.Count} sessions and {player.BonusClaims.Count} bonus claims");

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
                    _logger?.LogInformation($"Getting paged players by segment: {segment}, page {parameters.PageNumber}, size {parameters.PageSize}");

                    var query = _context.Players.Where(p => p.Segment == segment);
                    var totalCount = await query.CountAsync();
                    var players = await query
                        .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                        .Take(parameters.PageSize)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} players with segment {segment} (page {parameters.PageNumber} of {Math.Ceiling((double)totalCount / parameters.PageSize)})");

                    return new PagedResult<Player>(players, totalCount, parameters.PageNumber, parameters.PageSize);
                },
                _entityName,
                $"Error retrieving paged players by segment: {segment}",
                _logger
            );
        }

        public async Task<IEnumerable<Player>> GetActivePlayers(int daysActive)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var cutoffDate = DateTime.UtcNow.AddDays(-daysActive);

                    _logger?.LogInformation($"Getting active players since {cutoffDate}");

                    // Use EF Core to get active players
                    var players = await _context.Players
                        .Where(p => p.LastLoginDate >= cutoffDate)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} active players");

                    return players;
                },
                _entityName,
                $"Error retrieving active players for the last {daysActive} days",
                _logger
            );
        }

        public async Task<PagedResult<Player>> GetActivePlayersPagedAsync(int daysActive, PaginationParameters parameters)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var cutoffDate = DateTime.UtcNow.AddDays(-daysActive);

                    _logger?.LogInformation($"Getting paged active players since {cutoffDate}, page {parameters.PageNumber}, size {parameters.PageSize}");

                    var query = _context.Players.Where(p => p.LastLoginDate >= cutoffDate);
                    var totalCount = await query.CountAsync();
                    var players = await query
                        .Skip((parameters.PageNumber - 1) * parameters.PageSize)
                        .Take(parameters.PageSize)
                        .ToListAsync();

                    _logger?.LogInformation($"Retrieved {players.Count} active players (page {parameters.PageNumber} of {Math.Ceiling((double)totalCount / parameters.PageSize)})");

                    return new PagedResult<Player>(players, totalCount, parameters.PageNumber, parameters.PageSize);
                },
                _entityName,
                $"Error retrieving paged active players for the last {daysActive} days",
                _logger
            );
        }

        public async Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation($"Updating player {playerId} segment to {segment}");

                    var player = await _context.Players.FindAsync(playerId);

                    if (player == null)
                    {
                        throw new EntityNotFoundException(_entityName, playerId);
                    }

                    player.Segment = segment;
                    _context.Players.Update(player);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation($"Successfully updated player {playerId} segment to {segment}");
                },
                _entityName,
                $"Error updating player {playerId} segment to {segment}",
                _logger
            );
        }
    }
}