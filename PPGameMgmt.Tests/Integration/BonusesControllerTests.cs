using System;
using System.Collections.Generic;
using System.Net;
using System.Net.Http.Json;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc.Testing;
using PPGameMgmt.API.Models;
using PPGameMgmt.API.Models.Requests;
using PPGameMgmt.Core.Entities;
using Xunit;

namespace PPGameMgmt.Tests.Integration
{
    public class BonusesControllerTests : IClassFixture<TestWebApplicationFactory<Program>>
    {
        private readonly HttpClient _client;
        private readonly TestWebApplicationFactory<Program> _factory;
        
        public BonusesControllerTests(TestWebApplicationFactory<Program> factory)
        {
            _factory = factory;
            _client = _factory.CreateClient();
        }
        
        [Fact]
        public async Task GetBonuses_ReturnsSuccessStatusCode()
        {
            // Act
            var response = await _client.GetAsync("/api/v1/bonuses");
            
            // Assert
            response.EnsureSuccessStatusCode();
            Assert.Equal("application/json", response.Content.Headers.ContentType.MediaType);
            
            // Verify the response format
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<Bonus>>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);
        }
        
        [Fact]
        public async Task GetBonus_WithValidId_ReturnsBonus()
        {
            // Arrange
            var bonusId = "test-bonus-1"; // From test data
            
            // Act
            var response = await _client.GetAsync($"/api/v1/bonuses/{bonusId}");
            
            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<Bonus>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);
            Assert.Equal(bonusId, responseContent.Data.Id);
        }
        
        [Fact]
        public async Task GetBonus_WithInvalidId_ReturnsNotFound()
        {
            // Arrange
            var invalidId = "non-existent-bonus";
            
            // Act
            var response = await _client.GetAsync($"/api/v1/bonuses/{invalidId}");
            
            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<Bonus>>();
            Assert.NotNull(responseContent);
            Assert.False(responseContent.Success);
        }
        
        [Fact]
        public async Task GetActiveGlobalBonuses_ReturnsOnlyActiveGlobalBonuses()
        {
            // Act
            var response = await _client.GetAsync("/api/v1/bonuses/active/global");
            
            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<Bonus>>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);
            
            // Verify all returned bonuses are active and global
            foreach (var bonus in responseContent.Data)
            {
                Assert.True(bonus.IsActive);
                Assert.True(bonus.IsGlobal);
            }
        }
        
        [Fact]
        public async Task GetBonusesByType_ReturnsFilteredBonuses()
        {
            // Arrange
            var bonusType = BonusType.Deposit;
            
            // Act
            var response = await _client.GetAsync($"/api/v1/bonuses/type/{bonusType}");
            
            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<IEnumerable<Bonus>>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);
            
            // Verify all returned bonuses are of the specified type
            foreach (var bonus in responseContent.Data)
            {
                Assert.Equal(bonusType, bonus.Type);
            }
        }
        
        [Fact]
        public async Task ClaimBonus_WithValidData_ReturnsSuccess()
        {
            // Arrange
            var playerId = "test-player-1"; // From test data
            var bonusId = "test-bonus-1"; // From test data
            var request = new ClaimBonusRequest
            {
                BonusId = bonusId
            };
            
            // Act
            var response = await _client.PostAsJsonAsync($"/api/v1/players/{playerId}/bonuses/claim", request);
            
            // Assert
            response.EnsureSuccessStatusCode();
            var responseContent = await response.Content.ReadFromJsonAsync<ApiResponse<BonusClaim>>();
            Assert.NotNull(responseContent);
            Assert.True(responseContent.Success);
            Assert.NotNull(responseContent.Data);
            Assert.Equal(playerId, responseContent.Data.PlayerId);
            Assert.Equal(bonusId, responseContent.Data.BonusId);
        }
        
        [Fact]
        public async Task ClaimBonus_WithInvalidPlayerId_ReturnsNotFound()
        {
            // Arrange
            var invalidPlayerId = "non-existent-player";
            var bonusId = "test-bonus-1"; // From test data
            var request = new ClaimBonusRequest
            {
                BonusId = bonusId
            };
            
            // Act
            var response = await _client.PostAsJsonAsync($"/api/v1/players/{invalidPlayerId}/bonuses/claim", request);
            
            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
        
        [Fact]
        public async Task ClaimBonus_WithInvalidBonusId_ReturnsNotFound()
        {
            // Arrange
            var playerId = "test-player-1"; // From test data
            var invalidBonusId = "non-existent-bonus";
            var request = new ClaimBonusRequest
            {
                BonusId = invalidBonusId
            };
            
            // Act
            var response = await _client.PostAsJsonAsync($"/api/v1/players/{playerId}/bonuses/claim", request);
            
            // Assert
            Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        }
    }
}
