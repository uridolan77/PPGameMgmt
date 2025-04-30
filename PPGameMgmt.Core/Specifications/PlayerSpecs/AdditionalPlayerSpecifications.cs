using System;
using System.Linq;
using System.Linq.Expressions;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Specifications.PlayerSpecs
{
    /// <summary>
    /// Specification for retrieving a player with game sessions and bonus claims
    /// </summary>
    public class PlayerWithSessionsAndBonusesSpecification : BaseSpecification<Player>
    {
        public PlayerWithSessionsAndBonusesSpecification(string playerId)
            : base(p => p.Id == playerId)
        {
            // Include related data
            AddInclude(p => p.GameSessions);
            AddInclude(p => p.BonusClaims);
        }
    }
    
    /// <summary>
    /// Specification for retrieving active players within a timeframe
    /// </summary>
    public class ActivePlayersSpecification : BaseSpecification<Player>
    {
        public ActivePlayersSpecification(int daysActive)
            : base(p => p.LastLoginDate >= DateTime.UtcNow.AddDays(-daysActive))
        {
            ApplyOrderByDescending(p => p.LastLoginDate);
        }
    }
    
    /// <summary>
    /// Specification for retrieving top value players
    /// </summary>
    public class TopValuePlayersSpecification : BaseSpecification<Player>
    {
        public TopValuePlayersSpecification(int count)
            : base(p => true) // No specific criteria - we'll take all players and order them
        {
            ApplyOrderByDescending(p => p.TotalDeposits - p.TotalWithdrawals);
            
            // Note: The count limitation will be applied by the repository
            // when using Take(count) on the query result
        }
    }
    
    /// <summary>
    /// Specification for retrieving players who have played a specific game
    /// </summary>
    public class PlayersByGamePlayedSpecification : BaseSpecification<Player>
    {
        public PlayersByGamePlayedSpecification(string gameId)
            : base(p => p.GameSessions.Any(gs => gs.GameId == gameId))
        {
            AddInclude(p => p.GameSessions.Where(gs => gs.GameId == gameId));
            ApplyOrderByDescending(p => p.GameSessions.Count(gs => gs.GameId == gameId));
        }
    }
    
    /// <summary>
    /// Specification for retrieving players who have claimed a specific bonus
    /// </summary>
    public class PlayersByBonusClaimedSpecification : BaseSpecification<Player>
    {
        public PlayersByBonusClaimedSpecification(string bonusId)
            : base(p => p.BonusClaims.Any(bc => bc.BonusId == bonusId))
        {
            AddInclude(p => p.BonusClaims.Where(bc => bc.BonusId == bonusId));
            ApplyOrderByDescending(p => p.LastLoginDate);
        }
    }
}