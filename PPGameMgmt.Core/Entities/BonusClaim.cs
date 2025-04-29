using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("bonus_claims")]
    public class BonusClaim
    {
        [Column("id")]
        public string? Id { get; set; }

        [Column("player_id")]
        public string? PlayerId { get; set; }

        [Column("bonus_id")]
        public string? BonusId { get; set; }

        [Column("claim_date")]
        public DateTime ClaimDate { get; set; }

        [Column("claimed_date")]
        public DateTime ClaimedDate { get; set; }

        [Column("status")]
        public BonusClaimStatus Status { get; set; }

        [Column("deposit_amount")]
        public decimal? DepositAmount { get; set; }

        [Column("completion_date")]
        public DateTime? CompletionDate { get; set; }

        [Column("wagering_progress")]
        public decimal? WageringProgress { get; set; }

        public bool IsExpired => ExpiryDate.HasValue && DateTime.UtcNow > ExpiryDate.Value;

        [Column("expiry_date")]
        public DateTime? ExpiryDate { get; set; }

        [Column("conversion_trigger")]
        public string? ConversionTrigger { get; set; }

        [Column("bonus_value")]
        public decimal BonusValue { get; set; }

        [Column("bonus_type")]
        public string? BonusType { get; set; }
        
        // Navigation properties - make them nullable
        [NotMapped]
        public Player? Player { get; set; }

        [NotMapped]
        public Bonus? Bonus { get; set; }
    }

    public enum BonusClaimStatus
    {
        Claimed,
        Active,
        Completed,
        Failed,
        Expired,
        Cancelled
    }
}