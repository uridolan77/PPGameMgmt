using System;
using System.Collections.Generic;

namespace PPGameMgmt.Core.Entities
{
    public class PlayerFeatures
    {
        public string PlayerId { get; set; }
        public DateTime GeneratedDate { get; set; } // Renamed from CalculatedAt for consistency
        public DateTime TimestampUtc { get; set; } // Added for compatibility
        
        // Demographic Features
        public string Country { get; set; }
        public int DaysSinceRegistration { get; set; }
        public int Age { get; set; }
        public string Gender { get; set; }
        
        // Gaming Behavior Features
        public GameType? FavoriteGameType { get; set; }
        public string[] TopPlayedGameIds { get; set; } = Array.Empty<string>();
        public decimal AverageBetSize { get; set; }
        public double AverageSessionLengthMinutes { get; set; }
        public int SessionFrequencyPerWeek { get; set; }
        public string[] PreferredTimeSlots { get; set; } = Array.Empty<string>(); // Morning, Afternoon, Evening, Night
        public string PreferredDevice { get; set; } = "Unknown"; // Mobile, Desktop, Tablet
        
        // Additional gaming behavior metrics
        public double SessionsPerWeek { get; set; }
        public TimeSpan AverageSessionDuration { get; set; }
        public int DaysActive30 { get; set; }
        public int DaysActive90 { get; set; }
        public string FavoriteGameCategory { get; set; }
        public string PreferredSessionTime { get; set; }
        public string PreferredGameGenre { get; set; } // Added for compatibility
        public double SessionFrequency { get; set; } // Added for compatibility
        public string PreferredPlayingTimeOfDay { get; set; } // Added for compatibility
        public DateTime LastActive { get; set; } // Added for compatibility
        
        // Financial Features
        public decimal TotalDepositsLast30Days { get; set; }
        public decimal TotalWithdrawalsLast30Days { get; set; }
        public decimal AverageDepositAmount { get; set; }
        public int DepositFrequencyPerMonth { get; set; }
        public decimal LifetimeValue { get; set; }
        public decimal MonthlyAverageDeposit { get; set; }
        public decimal TypicalDepositAmount { get; set; } // Added for compatibility
        
        // Bonus Usage Features
        public double BonusUsageRate { get; set; } // % of available bonuses claimed
        public BonusType? PreferredBonusType { get; set; }
        public double BonusToDepositConversionRate { get; set; } // How often bonuses lead to deposits
        public double WageringCompletionRate { get; set; } // % of bonuses where wagering was completed
        public string BonusPreference { get; set; }
        public int TotalBonusesClaimed { get; set; } // Added for compatibility
        
        // Social Features
        public bool ReferredOthers { get; set; }
        public int TotalReferrals { get; set; }
        
        // Risk Features
        public double RiskScore { get; set; } // Calculated risk of churn or problem gambling
        public double ChurnProbability { get; set; } // Likelihood of player becoming inactive
        public string RiskLevel { get; set; }
        public int RetentionScore { get; set; }
        public double ChurnRisk { get; set; }
        public double UpsellPotential { get; set; }
        
        // Player Value Metrics
        public decimal PlayerLifetimeValue { get; set; }
        public PlayerSegment CurrentSegment { get; set; }
    }
}