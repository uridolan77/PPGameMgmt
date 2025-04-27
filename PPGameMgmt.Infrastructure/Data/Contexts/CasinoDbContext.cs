using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Infrastructure.Data.Contexts
{
    public class CasinoDbContext : DbContext
    {
        private static readonly JsonSerializerOptions _jsonOptions = new JsonSerializerOptions();

        public CasinoDbContext(DbContextOptions<CasinoDbContext> options) : base(options)
        {
        }

        public DbSet<Player> Players { get; set; }
        public DbSet<Game> Games { get; set; }
        public DbSet<Bonus> Bonuses { get; set; }
        public DbSet<GameSession> GameSessions { get; set; }
        public DbSet<BonusClaim> BonusClaims { get; set; }
        public DbSet<PlayerFeatures> PlayerFeatures { get; set; }
        public DbSet<Recommendation> Recommendations { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Player configuration
            modelBuilder.Entity<Player>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Username).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Email).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Country).HasMaxLength(50);
                entity.Property(e => e.Language).HasMaxLength(10);
                entity.Property(e => e.TotalDeposits).HasPrecision(18, 2);
                entity.Property(e => e.TotalWithdrawals).HasPrecision(18, 2);
                
                // Relationships
                entity.HasMany(p => p.GameSessions)
                      .WithOne(gs => gs.Player)
                      .HasForeignKey(gs => gs.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);
                
                entity.HasMany(p => p.BonusClaims)
                      .WithOne(bc => bc.Player)
                      .HasForeignKey(bc => bc.PlayerId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Game configuration
            modelBuilder.Entity<Game>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Provider).IsRequired().HasMaxLength(50);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.RTP).HasPrecision(5, 2);
                entity.Property(e => e.MinimumBet).HasPrecision(18, 2);
                entity.Property(e => e.MaximumBet).HasPrecision(18, 2);
                entity.Property(e => e.ThumbnailUrl).HasMaxLength(200);
                entity.Property(e => e.GameUrl).HasMaxLength(200);
                
                // Relationships
                entity.HasMany(g => g.GameSessions)
                      .WithOne(gs => gs.Game)
                      .HasForeignKey(gs => gs.GameId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // Bonus configuration
            modelBuilder.Entity<Bonus>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.Name).IsRequired().HasMaxLength(100);
                entity.Property(e => e.Description).HasMaxLength(500);
                entity.Property(e => e.Amount).HasPrecision(18, 2);
                entity.Property(e => e.PercentageMatch).HasPrecision(5, 2);
                entity.Property(e => e.MinimumDeposit).HasPrecision(18, 2);
                
                // Store arrays as JSON
                entity.Property(e => e.ApplicableGameIds).HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonOptions),
                    v => JsonSerializer.Deserialize<string[]>(v, _jsonOptions)
                );
                
                entity.Property(e => e.TargetSegments).HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonOptions),
                    v => JsonSerializer.Deserialize<PlayerSegment[]>(v, _jsonOptions)
                );
                
                // Relationships
                entity.HasMany(b => b.BonusClaims)
                      .WithOne(bc => bc.Bonus)
                      .HasForeignKey(bc => bc.BonusId)
                      .OnDelete(DeleteBehavior.Cascade);
            });

            // GameSession configuration
            modelBuilder.Entity<GameSession>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.TotalBets).HasPrecision(18, 2);
                entity.Property(e => e.TotalWins).HasPrecision(18, 2);
                entity.Property(e => e.DeviceType).HasMaxLength(20);
                entity.Property(e => e.BrowserInfo).HasMaxLength(200);
                
                // Relationships already defined in Player and Game entities
            });

            // BonusClaim configuration
            modelBuilder.Entity<BonusClaim>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.DepositAmount).HasPrecision(18, 2);
                entity.Property(e => e.WageringProgress).HasPrecision(5, 2);
                entity.Property(e => e.ConversionTrigger).HasMaxLength(50);
                
                // Relationships already defined in Player and Bonus entities
            });

            // PlayerFeatures configuration
            modelBuilder.Entity<PlayerFeatures>(entity =>
            {
                entity.HasKey(e => e.PlayerId);
                entity.Property(e => e.Country).HasMaxLength(50);
                entity.Property(e => e.AverageBetSize).HasPrecision(18, 2);
                entity.Property(e => e.AverageSessionLengthMinutes);
                entity.Property(e => e.PreferredDevice).HasMaxLength(20);
                entity.Property(e => e.TotalDepositsLast30Days).HasPrecision(18, 2);
                entity.Property(e => e.TotalWithdrawalsLast30Days).HasPrecision(18, 2);
                entity.Property(e => e.AverageDepositAmount).HasPrecision(18, 2);
                entity.Property(e => e.PlayerLifetimeValue).HasPrecision(18, 2);
                
                // Store arrays as JSON
                entity.Property(e => e.TopPlayedGameIds).HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonOptions),
                    v => JsonSerializer.Deserialize<string[]>(v, _jsonOptions)
                );
                
                entity.Property(e => e.PreferredTimeSlots).HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonOptions),
                    v => JsonSerializer.Deserialize<string[]>(v, _jsonOptions)
                );
            });

            // Recommendation configuration
            modelBuilder.Entity<Recommendation>(entity =>
            {
                entity.HasKey(e => e.Id);
                entity.Property(e => e.PlayerId).IsRequired();
                
                // Store complex objects as JSON
                entity.Property(e => e.RecommendedGames).HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonOptions),
                    v => JsonSerializer.Deserialize<List<GameRecommendation>>(v, _jsonOptions)
                );
                
                entity.Property(e => e.RecommendedBonus).HasConversion(
                    v => JsonSerializer.Serialize(v, _jsonOptions),
                    v => JsonSerializer.Deserialize<BonusRecommendation>(v, _jsonOptions)
                );
            });
        }
    }
}