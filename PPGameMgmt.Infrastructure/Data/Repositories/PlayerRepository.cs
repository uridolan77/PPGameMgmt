using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Models;
using PPGameMgmt.Core.Specifications.PlayerSpecs;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    /// <summary>
    /// Repository implementation for Player entity
    /// </summary>
    public class PlayerRepository : Repository<Player>, IPlayerRepository
    {
        public PlayerRepository(CasinoDbContext context, ILogger<PlayerRepository> logger = null)
            : base(context, logger)
        {
        }

        // The base implementation of GetByIdAsync and other common repository methods 
        // already includes integrated exception handling

        public async Task<Player> GetPlayerWithSessionsAndBonusesAsync(string playerId)
        {
            // Create a specification for this query
            var specification = new PlayerWithSessionsAndBonusesSpecification(playerId);
            var player = await FindWithSpecificationAsync(specification).ContinueWith(t => t.Result.FirstOrDefault());
            
            if (player == null)
            {
                throw new Core.Exceptions.EntityNotFoundException(_entityName, playerId);
            }
            
            return player;
        }

        public async Task<IEnumerable<Player>> GetPlayersBySegmentAsync(PlayerSegment segment)
        {
            // Create a specification for this query
            var specification = new PlayersBySegmentWithBonusesSpecification(segment);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<PagedResult<Player>> GetPlayersBySegmentPagedAsync(PlayerSegment segment, PaginationParameters parameters)
        {
            // Create a specification for this query
            var specification = new PlayersBySegmentWithBonusesSpecification(segment);
            return await FindPagedWithSpecificationAsync(specification, parameters);
        }

        public async Task<IEnumerable<Player>> GetActivePlayersAsync(int daysActive)
        {
            // Create a specification for this query
            var specification = new ActivePlayersSpecification(daysActive);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<PagedResult<Player>> GetActivePlayersPagedAsync(int daysActive, PaginationParameters parameters)
        {
            // Create a specification for this query
            var specification = new ActivePlayersSpecification(daysActive);
            return await FindPagedWithSpecificationAsync(specification, parameters);
        }

        public async Task<IEnumerable<Player>> GetTopValuePlayersAsync(int count)
        {
            // Create a specification for this query
            var specification = new TopValuePlayersSpecification(count);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<Player>> GetPlayersByGamePlayedAsync(string gameId)
        {
            // Create a specification for this query
            var specification = new PlayersByGamePlayedSpecification(gameId);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<Player>> GetPlayersByBonusClaimedAsync(string bonusId)
        {
            // Create a specification for this query
            var specification = new PlayersByBonusClaimedSpecification(bonusId);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<Player>> GetPlayersByMinimumDepositAsync(decimal depositAmount)
        {
            // Create a specification for this query
            var specification = new HighValuePlayersSpecification(depositAmount);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task UpdatePlayerSegmentAsync(string playerId, PlayerSegment segment)
        {
            // Use the base repository's ExecuteRepositoryOperationAsync for consistent error handling
            await ExecuteRepositoryOperationAsync(
                async () => {
                    var player = await _dbSet.FindAsync(playerId);
                    if (player == null)
                    {
                        throw new Core.Exceptions.EntityNotFoundException(_entityName, playerId);
                    }

                    player.Segment = segment;
                    _context.Entry(player).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    return true;
                },
                $"Error updating segment for player with ID: {playerId}"
            );
        }

        public async Task<bool> PlayerExistsAsync(string playerId)
        {
            // Simply call the base repository's ExistsAsync method
            return await ExistsAsync(playerId);
        }
    }
}