using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using PPGameMgmt.Core.Entities.Bonuses;

namespace PPGameMgmt.Core.Entities
{
    [Table("players")]
    public class Player
    {
        [Column("id")]
        public required string Id { get; set; }

        [Column("username")]
        public required string Username { get; set; }

        [Column("email")]
        public required string Email { get; set; }

        [Column("country")]
        public required string Country { get; set; }

        [Column("language")]
        public required string Language { get; set; }

        [Column("registration_date")]
        public DateTime RegistrationDate { get; set; }

        [Column("last_login_date")]
        public DateTime LastLoginDate { get; set; }

        [Column("total_deposits")]
        public decimal TotalDeposits { get; set; }

        [Column("total_withdrawals")]
        public decimal TotalWithdrawals { get; set; }

        [Column("average_deposit_amount")]
        public decimal AverageDepositAmount { get; set; }

        [Column("login_count")]
        public int LoginCount { get; set; }

        [Column("segment")]
        public PlayerSegment Segment { get; set; }

        [Column("age")]
        public int Age { get; set; }

        [Column("gender")]
        public required string Gender { get; set; }

        // Navigation properties
        public ICollection<GameSession> GameSessions { get; set; } = [];
        public ICollection<BonusClaim> BonusClaims { get; set; } = [];
    }

    public enum PlayerSegment
    {
        New,
        Casual,
        Regular,
        VIP,
        Dormant
    }
}
