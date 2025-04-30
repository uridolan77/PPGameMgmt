using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Core.Services
{
    public class GameService : IGameService
    {
        private readonly ILogger<GameService> _logger;
        private readonly IGameRepository _gameRepository;

        public GameService(
            ILogger<GameService> logger,
            IGameRepository gameRepository)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _gameRepository = gameRepository ?? throw new ArgumentNullException(nameof(gameRepository));
        }

        public async Task<Game> GetGameAsync(string gameId)
        {
            if (string.IsNullOrEmpty(gameId))
            {
                throw new ArgumentNullException(nameof(gameId));
            }

            // Call the string version of GetByIdAsync in IGameRepository
            return await _gameRepository.GetByIdAsync(gameId);
        }

        public async Task<IEnumerable<Game>> GetAllGamesAsync()
        {
            // Use GetAllAsync method
            return await _gameRepository.GetAllAsync();
        }

        public async Task<IEnumerable<Game>> GetGamesByTypeAsync(GameType type)
        {
            return await _gameRepository.GetGamesByTypeAsync(type);
        }

        public async Task<IEnumerable<Game>> GetGamesByCategoryAsync(GameCategory category)
        {
            return await _gameRepository.GetGamesByCategoryAsync(category);
        }

        public async Task<IEnumerable<Game>> GetPopularGamesAsync(int count)
        {
            if (count <= 0)
            {
                throw new ArgumentException("Count must be positive", nameof(count));
            }

            return await _gameRepository.GetPopularGamesAsync(count);
        }

        public async Task<IEnumerable<Game>> GetNewReleasesAsync(int count)
        {
            if (count <= 0)
            {
                throw new ArgumentException("Count must be positive", nameof(count));
            }

            return await _gameRepository.GetNewReleasesAsync(count);
        }

        public async Task<IEnumerable<Game>> SearchGamesAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                throw new ArgumentException("Search term cannot be empty", nameof(searchTerm));
            }

            // Convert search term to lowercase for case-insensitive search
            searchTerm = searchTerm.ToLower();

            // Use GetAllAsync method
            var allGames = await _gameRepository.GetAllAsync();

            // Filter games that match the search term in name, provider, or description
            return allGames.Where(g =>
                (g.Name?.ToLower().Contains(searchTerm) == true) ||
                (g.Provider?.ToLower().Contains(searchTerm) == true) ||
                (g.Description?.ToLower().Contains(searchTerm) == true))
                .ToList();
        }
    }
}