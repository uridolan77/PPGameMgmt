using System;
using System.Linq;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Tests.Integration
{
    /// <summary>
    /// Custom WebApplicationFactory for integration tests
    /// </summary>
    public class TestWebApplicationFactory<TStartup> : WebApplicationFactory<TStartup> where TStartup : class
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.ConfigureAppConfiguration((context, config) =>
            {
                // Add test-specific configuration
                config.AddInMemoryCollection(new Dictionary<string, string>
                {
                    ["ConnectionStrings:MySqlConnection"] = "Server=localhost;Database=pp_recommeder_test_db;User=root;Password=Dt%g_9W3z0*!I;",
                    ["ConnectionStrings:Redis"] = "localhost:6379,abortConnect=false",
                    ["ApiManagement:RequireSubscriptionKey"] = "false",
                    ["RateLimiting:EnableRateLimiting"] = "false"
                });
            });
            
            builder.ConfigureServices(services =>
            {
                // Remove the app's database context registration
                var descriptor = services.SingleOrDefault(
                    d => d.ServiceType == typeof(DbContextOptions<CasinoDbContext>));
                
                if (descriptor != null)
                {
                    services.Remove(descriptor);
                }
                
                // Add database context using an in-memory database for testing
                services.AddDbContext<CasinoDbContext>(options =>
                {
                    options.UseInMemoryDatabase("InMemoryDbForTesting");
                });
                
                // Build the service provider
                var sp = services.BuildServiceProvider();
                
                // Create a scope to obtain a reference to the database context
                using var scope = sp.CreateScope();
                var scopedServices = scope.ServiceProvider;
                var db = scopedServices.GetRequiredService<CasinoDbContext>();
                var logger = scopedServices.GetRequiredService<ILogger<TestWebApplicationFactory<TStartup>>>();
                
                // Ensure the database is created
                db.Database.EnsureCreated();
                
                try
                {
                    // Seed the database with test data
                    SeedTestData(db);
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred seeding the database with test data. Error: {Message}", ex.Message);
                }
            });
        }
        
        private void SeedTestData(CasinoDbContext context)
        {
            // Add test players
            if (!context.Players.Any())
            {
                context.Players.AddRange(
                    new PPGameMgmt.Core.Entities.Player
                    {
                        Id = "test-player-1",
                        Username = "testuser1",
                        Email = "test1@example.com",
                        Country = "US",
                        Segment = PPGameMgmt.Core.Entities.PlayerSegment.HighValue,
                        RegistrationDate = DateTime.UtcNow.AddDays(-30),
                        LastLoginDate = DateTime.UtcNow.AddDays(-1),
                        TotalDeposits = 1000,
                        TotalWithdrawals = 200
                    },
                    new PPGameMgmt.Core.Entities.Player
                    {
                        Id = "test-player-2",
                        Username = "testuser2",
                        Email = "test2@example.com",
                        Country = "UK",
                        Segment = PPGameMgmt.Core.Entities.PlayerSegment.MidValue,
                        RegistrationDate = DateTime.UtcNow.AddDays(-15),
                        LastLoginDate = DateTime.UtcNow.AddDays(-2),
                        TotalDeposits = 500,
                        TotalWithdrawals = 100
                    }
                );
                
                context.SaveChanges();
            }
            
            // Add test games
            if (!context.Games.Any())
            {
                context.Games.AddRange(
                    new PPGameMgmt.Core.Entities.Game
                    {
                        Id = "test-game-1",
                        Name = "Test Slot Game",
                        Description = "A test slot game for integration tests",
                        Type = PPGameMgmt.Core.Entities.GameType.Slot,
                        Category = PPGameMgmt.Core.Entities.GameCategory.Featured,
                        Provider = "Test Provider",
                        ReleaseDate = DateTime.UtcNow.AddMonths(-2),
                        RTP = 96.5,
                        Volatility = "Medium",
                        IsActive = true
                    },
                    new PPGameMgmt.Core.Entities.Game
                    {
                        Id = "test-game-2",
                        Name = "Test Table Game",
                        Description = "A test table game for integration tests",
                        Type = PPGameMgmt.Core.Entities.GameType.Table,
                        Category = PPGameMgmt.Core.Entities.GameCategory.Popular,
                        Provider = "Test Provider",
                        ReleaseDate = DateTime.UtcNow.AddMonths(-1),
                        RTP = 97.2,
                        Volatility = "Low",
                        IsActive = true
                    }
                );
                
                context.SaveChanges();
            }
            
            // Add test bonuses
            if (!context.Bonuses.Any())
            {
                context.Bonuses.AddRange(
                    new PPGameMgmt.Core.Entities.Bonus
                    {
                        Id = "test-bonus-1",
                        Name = "Test Welcome Bonus",
                        Description = "A test welcome bonus for integration tests",
                        Type = PPGameMgmt.Core.Entities.BonusType.Deposit,
                        Value = 100,
                        StartDate = DateTime.UtcNow.AddDays(-10),
                        EndDate = DateTime.UtcNow.AddDays(20),
                        IsActive = true,
                        IsGlobal = true
                    },
                    new PPGameMgmt.Core.Entities.Bonus
                    {
                        Id = "test-bonus-2",
                        Name = "Test Free Spins Bonus",
                        Description = "A test free spins bonus for integration tests",
                        Type = PPGameMgmt.Core.Entities.BonusType.FreeSpins,
                        Value = 20,
                        StartDate = DateTime.UtcNow.AddDays(-5),
                        EndDate = DateTime.UtcNow.AddDays(10),
                        IsActive = true,
                        IsGlobal = false,
                        TargetSegment = PPGameMgmt.Core.Entities.PlayerSegment.HighValue
                    }
                );
                
                context.SaveChanges();
            }
        }
    }
}
