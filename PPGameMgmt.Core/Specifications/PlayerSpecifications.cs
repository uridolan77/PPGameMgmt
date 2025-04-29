using System;
using System.Linq.Expressions;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Specifications
{
    /// <summary>
    /// Specifications for filtering Player entities
    /// </summary>
    public static class PlayerSpecifications
    {
        /// <summary>
        /// Specification for players in a specific segment
        /// </summary>
        public class PlayerBySegment : Specification<Player>
        {
            private readonly PlayerSegment _segment;

            public PlayerBySegment(PlayerSegment segment)
            {
                _segment = segment;
            }

            public override Expression<Func<Player, bool>> ToExpression()
            {
                return player => player.Segment == _segment;
            }
        }

        /// <summary>
        /// Specification for active players who have played recently
        /// </summary>
        public class ActivePlayers : Specification<Player>
        {
            private readonly int _daysSinceLastActivity;

            public ActivePlayers(int daysSinceLastActivity = 30)
            {
                _daysSinceLastActivity = daysSinceLastActivity;
            }

            public override Expression<Func<Player, bool>> ToExpression()
            {
                var cutoffDate = DateTime.UtcNow.AddDays(-_daysSinceLastActivity);
                return player => player.LastLoginDate >= cutoffDate;
            }
        }

        /// <summary>
        /// Specification for players from a specific country
        /// </summary>
        public class PlayersByCountry : Specification<Player>
        {
            private readonly string _countryCode;

            public PlayersByCountry(string countryCode)
            {
                if (string.IsNullOrEmpty(countryCode))
                {
                    throw new ArgumentNullException(nameof(countryCode));
                }
                
                _countryCode = countryCode.ToUpper();
            }

            public override Expression<Func<Player, bool>> ToExpression()
            {
                return player => player.Country.ToUpper() == _countryCode;
            }
        }

        /// <summary>
        /// Specification for high-value players with significant deposits
        /// </summary>
        public class HighValuePlayers : Specification<Player>
        {
            private readonly decimal _depositThreshold;

            public HighValuePlayers(decimal depositThreshold = 1000)
            {
                _depositThreshold = depositThreshold;
            }

            public override Expression<Func<Player, bool>> ToExpression()
            {
                return player => player.TotalDeposits >= _depositThreshold;
            }
        }
    }
}