using System;
using System.Linq.Expressions;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Specifications.PlayerSpecs
{
    /// <summary>
    /// Specification for retrieving players with active game sessions
    /// </summary>
    public class PlayersWithActiveSessionsSpecification : BaseSpecification<Player>
    {
        public PlayersWithActiveSessionsSpecification()
            : base(p => p.GameSessions.Any(gs => gs.EndTime == null))
        {
            // Include related data
            AddInclude(p => p.GameSessions);
            // Add ordering
            ApplyOrderBy(p => p.Username);
        }
    }
    
    /// <summary>
    /// Specification for retrieving players by segment with bonus claims
    /// </summary>
    public class PlayersBySegmentWithBonusesSpecification : BaseSpecification<Player>
    {
        public PlayersBySegmentWithBonusesSpecification(PlayerSegment segment) 
            : base(p => p.Segment == segment)
        {
            // Include related data
            AddInclude(p => p.BonusClaims);
            // Add ordering
            ApplyOrderByDescending(p => p.TotalDeposits);
            ApplyThenBy(p => p.Username);
        }
    }
    
    /// <summary>
    /// Specification for retrieving high-value players
    /// </summary>
    public class HighValuePlayersSpecification : BaseSpecification<Player>
    {
        public HighValuePlayersSpecification(decimal minimumDeposit)
            : base(p => p.TotalDeposits >= minimumDeposit)
        {
            // Add ordering
            ApplyOrderByDescending(p => p.TotalDeposits);
            // Include PlayerFeatures for more detailed information
            AddInclude("PlayerFeatures");
        }
    }
}