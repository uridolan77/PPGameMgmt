using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("bonuses")]
    public class Bonus
    {
        [Column("id")]
        public string Id { get; set; }

        [Column("name")]
        public string Name { get; set; }

        [Column("description")]
        public string Description { get; set; }

        [Column("type")]
        public BonusType Type { get; set; }

        [Column("amount")]
        public decimal Amount { get; set; }

        [Column("percentage_match")]
        public decimal? PercentageMatch { get; set; } // For deposit match bonuses

        [Column("minimum_deposit")]
        public decimal? MinimumDeposit { get; set; } // For deposit related bonuses

        [Column("wagering_requirement")]
        public int? WageringRequirement { get; set; } // Multiplier for wagering

        [Column("start_date")]
        public DateTime StartDate { get; set; }

        [Column("end_date")]
        public DateTime EndDate { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }

        [Column("is_global")]
        public bool IsGlobal { get; set; } // Whether the bonus is available to all players

        [Column("game_id")]
        public string GameId { get; set; } // Specific game this bonus applies to (if any)

        [Column("target_segment")]
        public PlayerSegment TargetSegment { get; set; } // Primary target segment for this bonus

        [Column("applicable_game_ids")]
        public string[]? ApplicableGameIds { get; set; } // Games this bonus can be used on

        [Column("target_segments")]
        public PlayerSegment[]? TargetSegments { get; set; } // Player segments this bonus targets

        // Navigation properties
        [NotMapped]
        public ICollection<BonusClaim> BonusClaims { get; set; } = new List<BonusClaim>();
    }

    public enum BonusType
    {
        DepositMatch,
        FreeSpins,
        Cashback,
        NoDeposit,
        Reload,
        LoyaltyPoints,
        ReferralBonus,
        TournamentPrize,
        CustomOffer
    }
}