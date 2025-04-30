using System;
using System.ComponentModel.DataAnnotations.Schema;
using PPGameMgmt.Core.Entities.Bonuses;

namespace PPGameMgmt.Core.Entities.Recommendations
{
    [Table("bonus_recommendations")]
    public class BonusRecommendation
    {
        [Column("id")]
        public string Id { get; set; }

        [Column("player_id")]
        public string PlayerId { get; set; }

        [Column("bonus_id")]
        public string BonusId { get; set; }

        [Column("score")]
        public double Score { get; set; }

        [Column("recommendation_date")]
        public DateTime RecommendationDate { get; set; }

        [Column("reason")]
        public string Reason { get; set; }

        [Column("is_shown")]
        public bool IsShown { get; set; }

        [Column("is_claimed")]
        public bool IsClaimed { get; set; }

        [Column("shown_date")]
        public DateTime? ShownDate { get; set; }

        [Column("claimed_date")]
        public DateTime? ClaimedDate { get; set; }

        // Navigation properties
        public Player Player { get; set; }
        public Bonus Bonus { get; set; }
    }
}
