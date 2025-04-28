using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Mvc.Testing;
using PPGameMgmt.Core.Entities;
using Xunit;

namespace PPGameMgmt.Tests.Integration
{
    public class GamesControllerTests : IClassFixture<WebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly WebApplicationFactory<Program> _factory;
        
        public GamesControllerTests(WebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }
        
        [Fact]
        public async Task GetGames_ReturnsSuccessStatusCode()
        {
            // Act
            var response = await _client.GetAsync("/api/games");
            
            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json", response.Content.Headers.ContentType.MediaType);
        }
        
        [Fact]
        public async Task GetGame_WithValidId_ReturnsGame()
        {
            // Arrange
            var gameId = "1"; // Assuming this ID exists
            
            // Act
            var response = await _client.GetAsync($"/api/games/{gameId}");
            
            // Assert
            response.EnsureSuccessStatusCode();
            var game = await response.Content.ReadFromJsonAsync<Game>();
            Assert.NotNull(game);
            Assert.Equal(gameId, game.Id);
        }
        
        [Fact]
        public async Task GetGame_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var invalidId = "invalid-id"; // Assuming this ID doesn't exist
            
            // Act
            var response = await _client.GetAsync($"/api/games/{invalidId}");
            
            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
        
        [Fact]
        public async Task CreateGame_WithValidData_ReturnsCreated()
        {
            // Arrange
            var newGame = new Game
            {
                Name = "Integration Test Game",
                Type = GameType.Slot,
                Provider = "Test Provider",
                RTP = 96.5,
                Description = "A game created in integration tests"
            };
            
            // Act
            var response = await _client.PostAsJsonAsync("/api/games", newGame);
            
            // Assert
            Assert.Equal(HttpStatusCode.Created, response.StatusCode);
            Assert.NotNull(response.Headers.Location);
            
            // Cleanup - delete the created game
            var createdGame = await response.Content.ReadFromJsonAsync<Game>();
            if (createdGame?.Id != null)
            {
                await _client.DeleteAsync($"/api/games/{createdGame.Id}");
            }
        }
    }
}