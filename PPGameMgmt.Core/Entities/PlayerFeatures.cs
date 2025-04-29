using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    [Table("player_features")]
    public class PlayerFeatures
    {
        [Column("player_id")]
        public string PlayerId { get; set; }
        
        [Column("generated_date")]
        public DateTime GeneratedDate { get; set; }
        
        [Column("timestamp_utc")]
        public DateTime TimestampUtc { get; set; }
        
        // Demographic Features
        [Column("country")]
        public string Country { get; set; }
        
        [Column("days_since_registration")]
        public int DaysSinceRegistration { get; set; }
        
        [Column("age")]
        public int Age { get; set; }
        
        [Column("gender")]
        public string Gender { get; set; }
        
        // Gaming Behavior Features
        [Column("favorite_game_type")]
        public GameType? FavoriteGameType { get; set; }
        
        [Column("top_played_game_ids")]
        public string[] TopPlayedGameIds { get; set; } = Array.Empty<string>();
        
        [Column("average_bet_size")]
        public decimal AverageBetSize { get; set; }
        
        [Column("average_session_length_minutes")]
        public double AverageSessionLengthMinutes { get; set; }
        
        [Column("session_frequency_per_week")]
        public int SessionFrequencyPerWeek { get; set; }
        
        [Column("preferred_time_slots")]
        public string[] PreferredTimeSlots { get; set; } = Array.Empty<string>();
        
        [Column("preferred_device")]
        public string PreferredDevice { get; set; } = "Unknown";
        
        // Additional gaming behavior metrics
        [Column("sessions_per_week")]
        public double SessionsPerWeek { get; set; }
        
        [Column("average_session_duration")]
        public TimeSpan AverageSessionDuration { get; set; }
        
        [Column("days_active_30")]
        public int DaysActive30 { get; set; }
        
        [Column("days_active_90")]
        public int DaysActive90 { get; set; }
        
        [Column("favorite_game_category")]
        public string FavoriteGameCategory { get; set; }
        
        [Column("preferred_session_time")]
        public string PreferredSessionTime { get; set; }
        
        [Column("preferred_game_genre")]
        public string PreferredGameGenre { get; set; }
        
        [Column("session_frequency")]
        public double SessionFrequency { get; set; }
        
        [Column("preferred_playing_time_of_day")]
        public string PreferredPlayingTimeOfDay { get; set; }
        
        [Column("last_active")]
        public DateTime LastActive { get; set; }
        
        // Financial Features
        [Column("total_deposits_last_30_days")]
        public decimal TotalDepositsLast30Days { get; set; }
        
        [Column("total_withdrawals_last_30_days")]
        public decimal TotalWithdrawalsLast30Days { get; set; }
        
        [Column("average_deposit_amount")]
        public decimal AverageDepositAmount { get; set; }
        
        [Column("deposit_frequency_per_month")]
        public int DepositFrequencyPerMonth { get; set; }
        
        [Column("lifetime_value")]
        public decimal LifetimeValue { get; set; }
        
        [Column("monthly_average_deposit")]
        public decimal MonthlyAverageDeposit { get; set; }
        
        [Column("typical_deposit_amount")]
        public decimal TypicalDepositAmount { get; set; }
        
        // Bonus Usage Features
        [Column("bonus_usage_rate")]
        public double BonusUsageRate { get; set; }
        
        [Column("bonus_to_deposit_conversion_rate")]
        public double BonusToDepositConversionRate { get; set; }
        
        [Column("wagering_completion_rate")]
        public double WageringCompletionRate { get; set; }
        
        [Column("bonus_preference")]
        public string BonusPreference { get; set; }
        
        [Column("total_bonuses_claimed")]
        public int TotalBonusesClaimed { get; set; }
        
        // Social Features
        [Column("referred_others")]
        public bool ReferredOthers { get; set; }
        
        [Column("total_referrals")]
        public int TotalReferrals { get; set; }
        
        // Risk Features
        [Column("risk_score")]
        public double RiskScore { get; set; }
        
        [Column("churn_probability")]
        public double ChurnProbability { get; set; }
        
        [Column("risk_level")]
        public string RiskLevel { get; set; }
        
        [Column("retention_score")]
        public int RetentionScore { get; set; }
        
        [Column("churn_risk")]
        public double ChurnRisk { get; set; }
        
        [Column("upsell_potential")]
        public double UpsellPotential { get; set; }
        
        // Player Value Metrics
        [Column("player_lifetime_value")]
        public decimal PlayerLifetimeValue { get; set; }
        
        [Column("current_segment")]
        public PlayerSegment CurrentSegment { get; set; }
    }
}