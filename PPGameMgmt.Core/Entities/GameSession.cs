using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("game_sessions")]
    public class GameSession
    {
        [Column("id")]
        public required string Id { get; set; }

        [Column("player_id")]
        public required string PlayerId { get; set; }

        [Column("game_id")]
        public required string GameId { get; set; }

        [Column("start_time")]
        public DateTime StartTime { get; set; }

        [Column("end_time")]
        public DateTime? EndTime { get; set; }

        [Column("total_bets")]
        public decimal TotalBets { get; set; }

        [Column("total_wins")]
        public decimal TotalWins { get; set; }

        [Column("total_spins")]
        public int TotalSpins { get; set; }

        [Column("total_hands")]
        public int TotalHands { get; set; }

        [Column("device_type")]
        public required string DeviceType { get; set; }

        [Column("browser_info")]
        public required string BrowserInfo { get; set; }

        [Column("applied_bonus_id")]
        public string? AppliedBonusId { get; set; }

        [Column("deposit_amount")]
        public decimal DepositAmount { get; set; }

        [Column("withdrawal_amount")]
        public decimal WithdrawalAmount { get; set; }

        [Column("duration_minutes")]
        public int DurationMinutes { get; set; }

        // Navigation properties
        public required Player Player { get; set; }
        public required Game Game { get; set; }

        // Helper methods
        public decimal GetNetResult() => TotalWins - TotalBets;

        public bool IsProfit() => GetNetResult() > 0;
    }
}