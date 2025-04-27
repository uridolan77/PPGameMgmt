using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;

namespace PPGameMgmt.Infrastructure.ML.Features
{
    public class FeatureEngineeringService : IFeatureEngineeringService
    {
        private readonly ILogger<FeatureEngineeringService> _logger;
        private readonly IPlayerRepository _playerRepository;
        private readonly IGameSessionRepository _gameSessionRepository;
        private readonly IBonusClaimRepository _bonusClaimRepository;
        
        // In-memory cache for demo purposes - would use Redis or similar in production
        private static readonly Dictionary<string, CachedFeatures> _featureCache = new();
        
        private class CachedFeatures
        {
            public PlayerFeatures Features { get; set; }
            public DateTime CachedAt { get; set; }
        }

        public FeatureEngineeringService(
            ILogger<FeatureEngineeringService> logger,
            IPlayerRepository playerRepository,
            IGameSessionRepository gameSessionRepository,
            IBonusClaimRepository bonusClaimRepository)
        {
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
            _playerRepository = playerRepository ?? throw new ArgumentNullException(nameof(playerRepository));
            _gameSessionRepository = gameSessionRepository ?? throw new ArgumentNullException(nameof(gameSessionRepository));
            _bonusClaimRepository = bonusClaimRepository ?? throw new ArgumentNullException(nameof(bonusClaimRepository));
        }

        public async Task<PlayerFeatures> GetCachedFeaturesAsync(string playerId)
        {
            if (_featureCache.TryGetValue(playerId, out var cached))
            {
                // Check if cache is still valid (less than 6 hours old)
                if (DateTime.UtcNow.Subtract(cached.CachedAt).TotalHours < 6)
                {
                    return cached.Features;
                }
                
                _logger.LogInformation($"Cached features for player {playerId} are stale");
                _featureCache.Remove(playerId);
            }
            
            return null;
        }

        public async Task<PlayerFeatures> ExtractFeaturesAsync(string playerId)
        {
            _logger.LogInformation($"Extracting features for player {playerId}");
            
            var player = await _playerRepository.GetByIdAsync(playerId);
            if (player == null)
            {
                _logger.LogWarning($"Player with ID {playerId} not found");
                return null;
            }

            // Get player's gaming sessions
            var sessions = await _gameSessionRepository.GetSessionsByPlayerIdAsync(playerId);
            
            // Get player's bonus claims
            var bonusClaims = await _bonusClaimRepository.GetByPlayerIdAsync(playerId);

            // Create new player features object
            var features = new PlayerFeatures
            {
                PlayerId = playerId,
                GeneratedDate = DateTime.UtcNow,
                
                // Demographic Features
                Age = player.Age,
                Gender = player.Gender,
                Country = player.Country,
                
                // Player Value
                LifetimeValue = await CalculateLifetimeValueAsync(player, sessions, bonusClaims),
                MonthlyAverageDeposit = CalculateMonthlyAverageDeposit(player, sessions),
                ChurnProbability = await CalculateChurnProbabilityAsync(player, sessions),
                UpsellPotential = CalculateUpsellPotential(player, sessions, bonusClaims),
                
                // Engagement
                SessionsPerWeek = CalculateSessionsPerWeek(sessions),
                AverageSessionDuration = CalculateAverageSessionDuration(sessions),
                DaysActive30 = CalculateDaysActive(sessions, 30),
                DaysActive90 = CalculateDaysActive(sessions, 90),
                
                // Risk & Retention
                RiskLevel = CalculateRiskLevel(player, sessions),
                RetentionScore = CalculateRetentionScore(player, sessions),
                ChurnRisk = await CalculateChurnRisk(player, sessions),
                
                // Preferences
                FavoriteGameCategory = DetermineFavoriteGameCategory(sessions),
                PreferredSessionTime = DeterminePreferredSessionTime(sessions),
                PreferredDevice = DeterminePreferredDevice(sessions),
                BonusPreference = DetermineBonusPreference(bonusClaims)
            };
            
            // Cache the features
            _featureCache[playerId] = new CachedFeatures
            {
                Features = features,
                CachedAt = DateTime.UtcNow
            };
            
            return features;
        }

        public Task UpdateFeaturesCacheAsync(string playerId)
        {
            // In a real implementation, this would update a distributed cache
            // For now, the cache is already updated in the ExtractFeaturesAsync method
            return Task.CompletedTask;
        }

        public Task InvalidateFeaturesAsync(string playerId)
        {
            if (_featureCache.ContainsKey(playerId))
            {
                _featureCache.Remove(playerId);
                _logger.LogInformation($"Cache invalidated for player {playerId}");
            }
            
            return Task.CompletedTask;
        }

        #region Feature Calculation Methods
        
        private async Task<decimal> CalculateLifetimeValueAsync(Player player, IEnumerable<GameSession> sessions, IEnumerable<BonusClaim> bonusClaims)
        {
            // Sum deposits and subtract withdrawals and bonus costs
            decimal deposits = sessions.Sum(s => s.DepositAmount);
            decimal withdrawals = sessions.Sum(s => s.WithdrawalAmount);
            decimal bonusCosts = bonusClaims.Sum(b => b.BonusValue);
            
            return deposits - withdrawals - bonusCosts;
        }
        
        private decimal CalculateMonthlyAverageDeposit(Player player, IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any())
                return 0;
                
            // Group by month and calculate average
            var monthlyDeposits = sessions
                .GroupBy(s => new { s.StartTime.Year, s.StartTime.Month })
                .Select(g => g.Sum(s => s.DepositAmount));
                
            return monthlyDeposits.Any() ? monthlyDeposits.Average() : 0;
        }
        
        private async Task<double> CalculateChurnProbabilityAsync(Player player, IEnumerable<GameSession> sessions)
        {
            // Simplified churn probability calculation
            // In production, this would use a trained ML model
            if (!sessions.Any())
                return 0.9; // High probability if no sessions
                
            var lastSession = sessions.OrderByDescending(s => s.EndTime).FirstOrDefault();
            if (lastSession == null)
                return 0.9;
                
            int daysSinceLastSession = (int)(DateTime.UtcNow - lastSession.EndTime.Value).TotalDays;
            
            if (daysSinceLastSession > 30)
                return 0.8;
            else if (daysSinceLastSession > 14)
                return 0.5;
            else if (daysSinceLastSession > 7)
                return 0.3;
            else
                return 0.1;
        }
        
        private double CalculateUpsellPotential(Player player, IEnumerable<GameSession> sessions, IEnumerable<BonusClaim> bonusClaims)
        {
            // Simplified calculation based on deposit history and bonus usage
            if (!sessions.Any())
                return 0.1;
                
            double depositFrequency = sessions.Count() / Math.Max(1, (DateTime.UtcNow - player.RegistrationDate).TotalDays / 30);
            double averageDepositAmount = (double)sessions.Average(s => s.DepositAmount);
            double bonusUsageRate = bonusClaims.Count() / Math.Max(1, sessions.Count());
            
            return Math.Min(0.95, (depositFrequency * 0.3) + (averageDepositAmount / 1000 * 0.4) + (bonusUsageRate * 0.3));
        }
        
        private double CalculateSessionsPerWeek(IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any())
                return 0;
                
            var firstSession = sessions.OrderBy(s => s.StartTime).First();
            var lastSession = sessions.OrderByDescending(s => s.EndTime).First();
            
            // Calculate only if EndTime has a value
            if (lastSession.EndTime.HasValue && firstSession.StartTime != null)
            {
                double totalWeeks = Math.Max(1, (lastSession.EndTime.Value - firstSession.StartTime).TotalDays / 7);
                return sessions.Count() / totalWeeks;
            }
            
            return 0;
        }
        
        private TimeSpan CalculateAverageSessionDuration(IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any())
                return TimeSpan.Zero;
                
            var validSessions = sessions.Where(s => s.EndTime.HasValue).ToList();
            if (!validSessions.Any())
                return TimeSpan.Zero;
                
            var durations = validSessions.Select(s => s.EndTime.Value - s.StartTime);
            double averageMinutes = durations.Average(d => d.TotalMinutes);
            
            return TimeSpan.FromMinutes(averageMinutes);
        }
        
        private int CalculateDaysActive(IEnumerable<GameSession> sessions, int days)
        {
            var cutoffDate = DateTime.UtcNow.AddDays(-days);
            var recentSessions = sessions.Where(s => s.StartTime >= cutoffDate);
            
            // Count distinct days
            return recentSessions
                .Select(s => s.StartTime.Date)
                .Distinct()
                .Count();
        }
        
        private string CalculateRiskLevel(Player player, IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any())
                return "Low";
                
            // Check for rapid deposits in short time periods
            var depositPeriods = sessions
                .Where(s => s.DepositAmount > 0)
                .GroupBy(s => s.StartTime.Date)
                .Select(g => new { Date = g.Key, TotalDeposit = g.Sum(s => s.DepositAmount) });
            
            bool hasHighDailyDeposits = depositPeriods.Any(d => d.TotalDeposit > 1000);
            bool hasMultipleDepositsPerDay = depositPeriods.Any(d => d.TotalDeposit > 3);
            
            // Check for late night gambling patterns
            bool hasLateNightSessions = sessions.Any(s => 
                s.EndTime.HasValue && // Check if EndTime has a value
                (s.StartTime.Hour >= 23 || s.StartTime.Hour <= 4) && 
                (s.EndTime.Value - s.StartTime).TotalHours > 2);
            
            if (hasHighDailyDeposits && (hasMultipleDepositsPerDay || hasLateNightSessions))
                return "High";
            else if (hasHighDailyDeposits || hasMultipleDepositsPerDay || hasLateNightSessions)
                return "Medium";
            else
                return "Low";
        }
        
        private int CalculateRetentionScore(Player player, IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any())
                return 0;
                
            // Calculate retention score (0-100) based on:
            // 1. Frequency of play
            // 2. Consistency over time
            // 3. Recent activity
            
            var sessionsPerWeek = CalculateSessionsPerWeek(sessions);
            var daysActive30 = CalculateDaysActive(sessions, 30);
            var daysActive90 = CalculateDaysActive(sessions, 90);
            
            var lastSession = sessions.OrderByDescending(s => s.EndTime).FirstOrDefault();
            if (lastSession == null || !lastSession.EndTime.HasValue)
                return 0;
                
            int daysSinceLastSession = (int)(DateTime.UtcNow - lastSession.EndTime.Value).TotalDays;
            
            int frequencyScore = Math.Min(40, (int)(sessionsPerWeek * 10));
            int consistencyScore = Math.Min(30, (int)((double)daysActive90 / 90 * 30));
            int recencyScore = Math.Min(30, daysSinceLastSession <= 7 ? 30 : daysSinceLastSession <= 14 ? 20 : daysSinceLastSession <= 30 ? 10 : 0);
            
            return frequencyScore + consistencyScore + recencyScore;
        }
        
        private async Task<double> CalculateChurnRisk(Player player, IEnumerable<GameSession> sessions)
        {
            // Similar to churn probability but with additional factors
            double churnProbability = await CalculateChurnProbabilityAsync(player, sessions);
            int retentionScore = CalculateRetentionScore(player, sessions);
            return Math.Min(1.0, Math.Max(0.0, churnProbability * (1 - retentionScore / 100.0)));
        }
        
        private string DetermineFavoriteGameCategory(IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any())
                return "None";
                
            var categoryCounts = sessions
                .GroupBy(s => s.GameCategory)
                .Select(g => new { Category = g.Key.ToString(), Count = g.Count() })
                .OrderByDescending(g => g.Count);
                
            return categoryCounts.First().Category;
        }
        
        private string DeterminePreferredSessionTime(IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any())
                return "None";
                
            var timeSlots = new[] { "Morning", "Afternoon", "Evening", "Night" };
            
            var hourCounts = sessions
                .GroupBy(s => s.StartTime.Hour / 6) // 0-5: night, 6-11: morning, 12-17: afternoon, 18-23: evening
                .Select(g => new { TimeSlot = timeSlots[g.Key], Count = g.Count() })
                .OrderByDescending(g => g.Count);
                
            return hourCounts.First().TimeSlot;
        }
        
        private string DeterminePreferredDevice(IEnumerable<GameSession> sessions)
        {
            if (!sessions.Any())
                return "None";
                
            var deviceCounts = sessions
                .GroupBy(s => s.DeviceType)
                .Select(g => new { Device = g.Key, Count = g.Count() })
                .OrderByDescending(g => g.Count);
                
            return deviceCounts.First().Device;
        }
        
        private string DetermineBonusPreference(IEnumerable<BonusClaim> bonusClaims)
        {
            if (!bonusClaims.Any())
                return "None";
                
            var bonusTypeCounts = bonusClaims
                .GroupBy(b => b.BonusType)
                .Select(g => new { BonusType = g.Key, Count = g.Count() })
                .OrderByDescending(g => g.Count);
                
            return bonusTypeCounts.First().BonusType;
        }
        
        #endregion
    }
}