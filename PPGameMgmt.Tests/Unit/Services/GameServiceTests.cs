using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Moq;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Services;
using Xunit;

namespace PPGameMgmt.Tests.Unit.Services
{
    public class GameServiceTests
    {
        private readonly Mock<ILogger<GameService>> _loggerMock;
        private readonly Mock<IGameRepository> _gameRepositoryMock;
        private readonly GameService _gameService;
        
        public GameServiceTests()
        {
            _loggerMock = new Mock<ILogger<GameService>>();
            _gameRepositoryMock = new Mock<IGameRepository>();
            _gameService = new GameService(_loggerMock.Object, _gameRepositoryMock.Object);
        }
        
        [Fact]
        public async Task GetGameAsync_ValidId_ReturnsGame()
        {
            // Arrange
            var gameId = "game123";
            var expectedGame = new Game { Id = gameId, Name = "Test Game" };
            
            _gameRepositoryMock
                .Setup(repo => repo.GetByIdAsync(gameId))
                .ReturnsAsync(expectedGame);
                
            // Act
            var result = await _gameService.GetGameAsync(gameId);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(gameId, result.Id);
            Assert.Equal("Test Game", result.Name);
        }
        
        [Fact]
        public async Task GetGameAsync_NullId_ThrowsArgumentNullException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentNullException>(() => _gameService.GetGameAsync(null));
        }
        
        [Fact]
        public async Task GetPopularGamesAsync_ValidCount_ReturnsGames()
        {
            // Arrange
            int count = 5;
            var games = new List<Game>
            {
                new Game { Id = "1", Name = "Popular Game 1" },
                new Game { Id = "2", Name = "Popular Game 2" },
                new Game { Id = "3", Name = "Popular Game 3" }
            };
            
            _gameRepositoryMock
                .Setup(repo => repo.GetPopularGamesAsync(count))
                .ReturnsAsync(games);
                
            // Act
            var result = await _gameService.GetPopularGamesAsync(count);
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(3, result.Count());
        }
        
        [Fact]
        public async Task GetPopularGamesAsync_InvalidCount_ThrowsArgumentException()
        {
            // Act & Assert
            await Assert.ThrowsAsync<ArgumentException>(() => _gameService.GetPopularGamesAsync(0));
            await Assert.ThrowsAsync<ArgumentException>(() => _gameService.GetPopularGamesAsync(-5));
        }
        
        [Fact]
        public async Task SearchGamesAsync_ValidTerm_ReturnsMatchingGames()
        {
            // Arrange
            var allGames = new List<Game>
            {
                new Game { Id = "1", Name = "Adventure Game", Provider = "Provider A" },
                new Game { Id = "2", Name = "Casino Game", Provider = "Provider B" },
                new Game { Id = "3", Name = "Strategy Game", Provider = "Adventure Studios" }
            };
            
            _gameRepositoryMock
                .Setup(repo => repo.GetAllAsync())
                .ReturnsAsync(allGames);
                
            // Act
            var result = await _gameService.SearchGamesAsync("adventure");
            
            // Assert
            Assert.NotNull(result);
            Assert.Equal(2, result.Count()); // Should match game 1 (name) and game 3 (provider)
        }
    }
}