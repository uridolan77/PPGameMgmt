using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities.Bonuses
{
    [Table("bonuses")]
    public class Bonus
    {
        [Column("id")]
        public required string Id { get; set; }

        [Column("name")]
        public required string Name { get; set; }

        [Column("description")]
        public required string Description { get; set; }

        [Column("bonus_type")]
        public BonusType Type { get; set; }

        [Column("value")]
        public decimal Value { get; set; }

        [Column("wagering_requirement")]
        public decimal WageringRequirement { get; set; }

        [Column("valid_from")]
        public DateTime ValidFrom { get; set; }

        [Column("valid_to")]
        public DateTime ValidTo { get; set; }

        [Column("is_active")]
        public bool IsActive { get; set; }

        [Column("terms_and_conditions")]
        public required string TermsAndConditions { get; set; }

        [Column("max_conversion")]
        public decimal? MaxConversion { get; set; }

        [Column("min_deposit")]
        public decimal? MinDeposit { get; set; }

        [Column("applicable_game_ids")]
        public string[]? ApplicableGameIds { get; set; }

        [Column("target_segments")]
        public PlayerSegment[]? TargetSegments { get; set; }
    }

    public enum BonusType
    {
        DepositMatch,
        FreeSpins,
        Cashback,
        NoDeposit,
        Reload,
        VIP,
        Tournament,
        Referral
    }
}
