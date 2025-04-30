using System;
using System.Linq;
using System.Linq.Expressions;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Specifications.GameSessionSpecs
{
    /// <summary>
    /// Specification for retrieving game sessions by player ID
    /// </summary>
    public class GameSessionsByPlayerIdSpecification : BaseSpecification<GameSession>
    {
        public GameSessionsByPlayerIdSpecification(string playerId)
            : base(gs => gs.PlayerId == playerId)
        {
            AddInclude(gs => gs.Game);
            ApplyOrderByDescending(gs => gs.StartTime);
        }
    }
    
    /// <summary>
    /// Specification for retrieving paged game sessions by player ID
    /// </summary>
    public class GameSessionsByPlayerIdPagedSpecification : BaseSpecification<GameSession>
    {
        public GameSessionsByPlayerIdPagedSpecification(string playerId)
            : base(gs => gs.PlayerId == playerId)
        {
            AddInclude(gs => gs.Game);
            ApplyOrderByDescending(gs => gs.StartTime);
        }
    }
    
    /// <summary>
    /// Specification for retrieving game sessions by game ID
    /// </summary>
    public class GameSessionsByGameIdSpecification : BaseSpecification<GameSession>
    {
        public GameSessionsByGameIdSpecification(string gameId)
            : base(gs => gs.GameId == gameId)
        {
            AddInclude(gs => gs.Player);
            ApplyOrderByDescending(gs => gs.StartTime);
        }
    }
    
    /// <summary>
    /// Specification for retrieving active (ongoing) game sessions
    /// </summary>
    public class ActiveGameSessionsSpecification : BaseSpecification<GameSession>
    {
        public ActiveGameSessionsSpecification()
            : base(gs => gs.EndTime == null)
        {
            AddInclude(gs => gs.Player);
            AddInclude(gs => gs.Game);
            ApplyOrderByDescending(gs => gs.StartTime);
        }
    }
    
    /// <summary>
    /// Specification for retrieving recent game sessions by player ID
    /// </summary>
    public class RecentGameSessionsByPlayerIdSpecification : BaseSpecification<GameSession>
    {
        public RecentGameSessionsByPlayerIdSpecification(string playerId, int daysToLookBack)
            : base(gs => gs.PlayerId == playerId && 
                        gs.StartTime >= DateTime.UtcNow.AddDays(-daysToLookBack))
        {
            AddInclude(gs => gs.Game);
            ApplyOrderByDescending(gs => gs.StartTime);
        }
    }
    
    /// <summary>
    /// Specification for retrieving game sessions by player ID and date range
    /// </summary>
    public class GameSessionsByPlayerIdAndDateRangeSpecification : BaseSpecification<GameSession>
    {
        public GameSessionsByPlayerIdAndDateRangeSpecification(string playerId, DateTime startDate, DateTime endDate)
            : base(gs => gs.PlayerId == playerId && 
                        gs.StartTime >= startDate && 
                        gs.StartTime <= endDate)
        {
            AddInclude(gs => gs.Game);
            ApplyOrderByDescending(gs => gs.StartTime);
        }
    }
    
    /// <summary>
    /// Specification for retrieving game sessions by device type
    /// </summary>
    public class GameSessionsByDeviceTypeSpecification : BaseSpecification<GameSession>
    {
        public GameSessionsByDeviceTypeSpecification(string deviceType)
            : base(gs => gs.DeviceType == deviceType)
        {
            AddInclude(gs => gs.Player);
            AddInclude(gs => gs.Game);
            ApplyOrderByDescending(gs => gs.StartTime);
        }
    }
}