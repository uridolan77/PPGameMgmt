using System;
using System.Collections.Generic;

namespace PPGameMgmt.Core.Entities
{
    public class PlayerFeatures
    {
        public string PlayerId { get; set; }
        public DateTime GeneratedDate { get; set; } // Renamed from CalculatedAt for consistency
        
        // Demographic Features
        public string Country { get; set; }
        public int DaysSinceRegistration { get; set; }
        public int Age { get; set; } // Added missing property
        public string Gender { get; set; } // Added missing property
        
        // Gaming Behavior Features
        public GameType? FavoriteGameType { get; set; }
        public string[] TopPlayedGameIds { get; set; } = Array.Empty<string>();
        public decimal AverageBetSize { get; set; }
        public double AverageSessionLengthMinutes { get; set; }
        public int SessionFrequencyPerWeek { get; set; }
        public string[] PreferredTimeSlots { get; set; } = Array.Empty<string>(); // Morning, Afternoon, Evening, Night
        public string PreferredDevice { get; set; } = "Unknown"; // Mobile, Desktop, Tablet
        
        // Additional gaming behavior metrics
        public double SessionsPerWeek { get; set; } // Added missing property
        public TimeSpan AverageSessionDuration { get; set; } // Added missing property
        public int DaysActive30 { get; set; } // Added missing property
        public int DaysActive90 { get; set; } // Added missing property
        public string FavoriteGameCategory { get; set; } // Added missing property
        public string PreferredSessionTime { get; set; } // Added missing property
        
        // Financial Features
        public decimal TotalDepositsLast30Days { get; set; }
        public decimal TotalWithdrawalsLast30Days { get; set; }
        public decimal AverageDepositAmount { get; set; }
        public int DepositFrequencyPerMonth { get; set; }
        public decimal LifetimeValue { get; set; } // Added missing property
        public decimal MonthlyAverageDeposit { get; set; } // Added missing property
        
        // Bonus Usage Features
        public double BonusUsageRate { get; set; } // % of available bonuses claimed
        public BonusType? PreferredBonusType { get; set; }
        public double BonusToDepositConversionRate { get; set; } // How often bonuses lead to deposits
        public double WageringCompletionRate { get; set; } // % of bonuses where wagering was completed
        public string BonusPreference { get; set; } // Added missing property
        
        // Social Features
        public bool ReferredOthers { get; set; }
        public int TotalReferrals { get; set; }
        
        // Risk Features
        public double RiskScore { get; set; } // Calculated risk of churn or problem gambling
        public double ChurnProbability { get; set; } // Likelihood of player becoming inactive
        public string RiskLevel { get; set; } // Added missing property
        public int RetentionScore { get; set; } // Added missing property
        public double ChurnRisk { get; set; } // Added missing property
        public double UpsellPotential { get; set; } // Added missing property
        
        // Player Value Metrics
        public decimal PlayerLifetimeValue { get; set; }
        public PlayerSegment CurrentSegment { get; set; }
    }
}