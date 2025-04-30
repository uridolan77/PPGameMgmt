using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities.Recommendations
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
        
        [NotMapped]
        public List<GameRecommendation> RecommendedGames { get; set; } = new List<GameRecommendation>();
        
        [NotMapped]
        public BonusRecommendation RecommendedBonus { get; set; }
        
        // Navigation properties
        public Player Player { get; set; }
    }
}
