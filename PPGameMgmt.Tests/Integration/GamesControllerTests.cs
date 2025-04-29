using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using PPGameMgmt.API.Models;
using PPGameMgmt.Core.Entities;
using Xunit;

namespace PPGameMgmt.Tests.Integration
{
    public class GamesControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly TestWebApplicationFactory<Program> _factory;

        public GamesControllerTests(TestWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }

        [Fact]
        public async Task GetGames_ReturnsSuccessStatusCode()
        {
            // Act
            var response = await _client.GetAsync("/api/v1/games");

            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json", response.Content.Headers.ContentType.MediaType);

            // Verify the response format
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<Game>>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);
        }

        [Fact]
        public async Task GetGame_WithValidId_ReturnsGame()
        {
            // Arrange
            var gameId = "test-game-1"; // From test data

            // Act
            var response = await _client.GetAsync($"/api/v1/games/{gameId}");

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<Game>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);
            Assert.Equal(gameId, responseContent.Data.Id);
        }

        [Fact]
        public async Task GetGame_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var invalidId = "non-existent-game";

            // Act
            var response = await _client.GetAsync($"/api/v1/games/{invalidId}");

            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<Game>>();
            Assert.NotNull(responseContent);
            Assert.False(responseContent.Success);
        }

        [Fact]
        public async Task GetGamesByType_ReturnsFilteredGames()
        {
            // Arrange
            var gameType = GameType.Slot;

            // Act
            var response = await _client.GetAsync($"/api/v1/games/type/{gameType}");

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<Game>>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);

            // Verify all returned games are of the specified type
            foreach (var game in responseContent.Data)
            {
                Assert.Equal(gameType, game.Type);
            }
        }

        [Fact]
        public async Task GetGamesByCategory_ReturnsFilteredGames()
        {
            // Arrange
            var gameCategory = GameCategory.Featured;

            // Act
            var response = await _client.GetAsync($"/api/v1/games/category/{gameCategory}");

            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<Game>>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);

            // Verify all returned games are of the specified category
            foreach (var game in responseContent.Data)
            {
                Assert.Equal(gameCategory, game.Category);
            }
        }
    }
}