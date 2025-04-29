using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("recommendations")]
    public class Recommendation
    {
        [Column("id")]
        public string Id { get; set; }
        
        [Column("player_id")]
        public string PlayerId { get; set; }
        
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }
        
        [Column("valid_until")]
        public DateTime ValidUntil { get; set; }
        
        [Column("is_displayed")]
        public bool IsDisplayed { get; set; }
        
        [Column("is_clicked")]
        public bool IsClicked { get; set; }
        
        [Column("is_accepted")]
        public bool IsAccepted { get; set; }
        
        [Column("displayed_at")]
        public DateTime? DisplayedAt { get; set; }
        
        [Column("clicked_at")]
        public DateTime? ClickedAt { get; set; }
        
        [Column("accepted_at")]
        public DateTime? AcceptedAt { get; set; }
        
        [Column("is_viewed")]
        public bool IsViewed { get; set; }
        
        [Column("is_played")]
        public bool IsPlayed { get; set; }
        
        [Column("recommended_games")]
        public string RecommendedGamesJson { get; set; }
        
        [Column("recommended_bonus")]
        public string RecommendedBonusJson { get; set; }
        
        // Navigation properties - not directly mapped to columns
        [NotMapped]
        public List<GameRecommendation> RecommendedGames { get; set; } = new List<GameRecommendation>();
        
        [NotMapped]
        public BonusRecommendation RecommendedBonus { get; set; }
    }

    public class GameRecommendation
    {
        public string GameId { get; set; }
        public string GameName { get; set; }
        public double Score { get; set; } // ML model confidence score
        public string RecommendationReason { get; set; } // E.g., "Based on your recent slot games"
        
        // Optional reference to the navigation property
        public Game Game { get; set; }
    }

    public class BonusRecommendation
    {
        public string BonusId { get; set; }
        public string BonusName { get; set; }
        public BonusType BonusType { get; set; }
        public decimal Amount { get; set; }
        public decimal? PercentageMatch { get; set; }
        public double Score { get; set; } // ML model confidence score
        public string RecommendationReason { get; set; } // E.g., "Optimized for your deposit patterns"
        
        // Optional reference to the navigation property
        public Bonus Bonus { get; set; }
    }
}