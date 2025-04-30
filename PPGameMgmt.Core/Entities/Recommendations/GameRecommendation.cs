using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities.Recommendations
{
    [Table("game_recommendations")]
    public class GameRecommendation
    {
        [Column("id")]
        public string Id { get; set; }

        [Column("player_id")]
        public string PlayerId { get; set; }

        [Column("game_id")]
        public string GameId { get; set; }

        [Column("score")]
        public double Score { get; set; }

        [Column("recommendation_date")]
        public DateTime RecommendationDate { get; set; }

        [Column("reason")]
        public string Reason { get; set; }

        [Column("is_shown")]
        public bool IsShown { get; set; }

        [Column("is_clicked")]
        public bool IsClicked { get; set; }

        [Column("is_played")]
        public bool IsPlayed { get; set; }

        [Column("shown_date")]
        public DateTime? ShownDate { get; set; }

        [Column("clicked_date")]
        public DateTime? ClickedDate { get; set; }

        [Column("played_date")]
        public DateTime? PlayedDate { get; set; }

        // Navigation properties
        public Player Player { get; set; }
        public Game Game { get; set; }

        [NotMapped]
        public string GameName { get; set; }

        [NotMapped]
        public string RecommendationReason { get; set; }
    }
}
