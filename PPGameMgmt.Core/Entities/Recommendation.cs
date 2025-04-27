using System;
using System.Collections.Generic;

namespace PPGameMgmt.Core.Entities
{
    public class Recommendation
    {
        public string Id { get; set; }
        public string PlayerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime ValidUntil { get; set; }
        public bool IsDisplayed { get; set; }
        public bool IsClicked { get; set; }
        public bool IsAccepted { get; set; } // Player actually used the recommendation
        public DateTime? DisplayedAt { get; set; }
        public DateTime? ClickedAt { get; set; }
        public DateTime? AcceptedAt { get; set; }
        public bool IsViewed { get; set; } // Whether the player has seen the recommendation
        public bool IsPlayed { get; set; } // Whether the player has played the recommended game
        
        // Game Recommendations
        public List<GameRecommendation> RecommendedGames { get; set; } = new List<GameRecommendation>();
        
        // Bonus Recommendation
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