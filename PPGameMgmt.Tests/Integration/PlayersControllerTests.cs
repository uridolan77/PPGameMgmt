using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using PPGameMgmt.API.Models;
using PPGameMgmt.API.Models.Requests;
using PPGameMgmt.Core.Entities;
using Xunit;

namespace PPGameMgmt.Tests.Integration
{
    public class PlayersControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly TestWebApplicationFactory<Program> _factory;
        
        public PlayersControllerTests(TestWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }
        
        [Fact]
        public async Task GetPlayers_ReturnsSuccessStatusCode()
        {
            // Act
            var response = await _client.GetAsync("/api/v1/players");
            
            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json", response.Content.Headers.ContentType.MediaType);
            
            // Verify the response format
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<Player>>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);
        }
        
        [Fact]
        public async Task GetPlayer_WithValidId_ReturnsPlayer()
        {
            // Arrange
            var playerId = "test-player-1"; // From test data
            
            // Act
            var response = await _client.GetAsync($"/api/v1/players/{playerId}");
            
            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<Player>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);
            Assert.Equal(playerId, responseContent.Data.Id);
        }
        
        [Fact]
        public async Task GetPlayer_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var invalidId = "non-existent-player";
            
            // Act
            var response = await _client.GetAsync($"/api/v1/players/{invalidId}");
            
            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<Player>>();
            Assert.NotNull(responseContent);
            Assert.False(responseContent.Success);
        }
        
        [Fact]
        public async Task UpdatePlayerSegment_WithValidData_ReturnsSuccess()
        {
            // Arrange
            var playerId = "test-player-1"; // From test data
            var request = new PlayerSegmentUpdateRequest
            {
                Segment = PlayerSegment.WhaleValue
            };
            
            // Act
            var response = await _client.PutAsJsonAsync($"/api/v1/players/{playerId}/segment", request);
            
            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<bool>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.True(responseContent.Data);
            
            // Verify the player segment was updated
            var playerResponse = await _client.GetAsync($"/api/v1/players/{playerId}");
            playerResponse.EnsureSuccessStatusCode();
            var playerContent = await playerResponse.Content.ReadFromJsonAsync<ApiResponse<Player>>();
            Assert.Equal(PlayerSegment.WhaleValue, playerContent.Data.Segment);
        }
        
        [Fact]
        public async Task UpdatePlayerSegment_WithInvalidPlayerId_ReturnsNotFound()
        {
            // Arrange
            var invalidId = "non-existent-player";
            var request = new PlayerSegmentUpdateRequest
            {
                Segment = PlayerSegment.LowValue
            };
            
            // Act
            var response = await _client.PutAsJsonAsync($"/api/v1/players/{invalidId}/segment", request);
            
            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
        
        [Fact]
        public async Task UpdatePlayerSegment_WithInvalidSegment_ReturnsBadRequest()
        {
            // Arrange
            var playerId = "test-player-1"; // From test data
            var request = new { Segment = "InvalidSegment" };
            
            // Act
            var response = await _client.PutAsJsonAsync($"/api/v1/players/{playerId}/segment", request);
            
            // Assert
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        }
    }
}
