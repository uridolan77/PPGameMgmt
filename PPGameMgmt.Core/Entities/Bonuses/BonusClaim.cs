using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities.Bonuses
{
    [Table("bonus_claims")]
    public class BonusClaim
    {
        [Column("id")]
        public required string Id { get; set; }

        [Column("player_id")]
        public required string PlayerId { get; set; }

        [Column("bonus_id")]
        public required string BonusId { get; set; }

        [Column("claim_date")]
        public DateTime ClaimDate { get; set; }

        [Column("status")]
        public BonusClaimStatus Status { get; set; }

        [Column("wagering_completed")]
        public bool WageringCompleted { get; set; }

        [Column("wagering_progress")]
        public decimal WageringProgress { get; set; }

        [Column("wagering_requirement")]
        public decimal WageringRequirement { get; set; }

        [Column("expiry_date")]
        public DateTime ExpiryDate { get; set; }

        [Column("amount_converted")]
        public decimal? AmountConverted { get; set; }

        [Column("conversion_date")]
        public DateTime? ConversionDate { get; set; }

        [Column("completion_date")]
        public DateTime? CompletionDate { get; set; }

        // Navigation properties
        public required Player Player { get; set; }
        public required Bonus Bonus { get; set; }
    }

    public enum BonusClaimStatus
    {
        Pending,
        Active,
        Completed,
        Expired,
        Cancelled,
        Forfeited
    }
}
