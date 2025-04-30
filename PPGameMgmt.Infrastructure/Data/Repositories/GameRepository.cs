using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Exceptions;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Specifications.GameSpecs;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    /// <summary>
    /// Repository implementation for Game entity
    /// </summary>
    public class GameRepository : Repository<Game>, IGameRepository
    {
        public GameRepository(CasinoDbContext context, ILogger<GameRepository> logger = null)
            : base(context, logger)
        {
        }

        // Base implementations for common operations like GetByIdAsync, GetAllAsync, etc. 
        // are already handled by the Repository<T> base class with integrated error handling

        public async Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type)
        {
            var specification = new GamesByTypeSpecification(type);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category)
        {
            var specification = new GamesByCategorySpecification(category);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<Game>> GetPopularGamesAsync(int count)
        {
            var specification = new PopularGamesSpecification();
            var games = await FindWithSpecificationAsync(specification);
            // Apply count limitation after retrieving the results
            return games.Take(count);
        }

        public async Task<IEnumerable<Game>> GetNewReleasesAsync(int count)
        {
            var specification = new NewReleaseGamesSpecification();
            var games = await FindWithSpecificationAsync(specification);
            // Apply count limitation after retrieving the results
            return games.Take(count);
        }

        public async Task<IEnumerable<Game>> SearchGamesAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetAllAsync();
            }

            var specification = new SearchGamesSpecification(searchTerm);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<Game>> GetGamesByProviderAsync(string provider)
        {
            var specification = new GamesByProviderSpecification(provider);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<Game>> GetGamesByRtpRangeAsync(decimal minRtp, decimal maxRtp)
        {
            var specification = new GamesByRtpRangeSpecification(minRtp, maxRtp);
            return await FindWithSpecificationAsync(specification);
        }

        public async Task<IEnumerable<Game>> GetGamesByDeviceCompatibilityAsync(string deviceType)
        {
            // For arrays that can't be easily queried with EF Core, we'll use a two-step approach:
            // 1. Get active games with base criteria
            // 2. Filter in memory for array contains
            var specification = new GamesByDeviceCompatibilitySpecification(deviceType);
            var games = await FindWithSpecificationAsync(specification);
            
            // Apply the in-memory filter
            return games.Where(g => specification.IsSatisfiedByDevice(g));
        }

        public async Task<IEnumerable<Game>> GetGamesByFeatureAsync(string featureName)
        {
            // Similar approach for features
            var specification = new GamesByFeatureSpecification(featureName);
            var games = await FindWithSpecificationAsync(specification);
            
            // Apply the in-memory filter
            return games.Where(g => specification.IsSatisfiedByFeature(g));
        }

        public async Task UpdateGamePopularityScoreAsync(string gameId, int newPopularityScore)
        {
            await ExecuteRepositoryOperationAsync(
                async () => {
                    var game = await _dbSet.FindAsync(gameId);
                    if (game == null)
                    {
                        throw new EntityNotFoundException(_entityName, gameId);
                    }

                    game.PopularityScore = newPopularityScore;
                    _context.Entry(game).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    return true;
                },
                $"Error updating popularity score for game with ID: {gameId}"
            );
        }

        public async Task<bool> GameExistsAsync(string gameId)
        {
            // Simply call the base repository's ExistsAsync method
            return await ExistsAsync(gameId);
        }
    }
}