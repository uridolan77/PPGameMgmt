using System;
using System.Linq;
using System.Linq.Expressions;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Specifications.GameSpecs
{
    /// <summary>
    /// Specification for retrieving games by type
    /// </summary>
    public class GamesByTypeSpecification : BaseSpecification<Game>
    {
        public GamesByTypeSpecification(GameType type)
            : base(g => g.Type == type && g.IsActive)
        {
            ApplyOrderBy(g => g.Name);
        }
    }
    
    /// <summary>
    /// Specification for retrieving games by category
    /// </summary>
    public class GamesByCategorySpecification : BaseSpecification<Game>
    {
        public GamesByCategorySpecification(GameCategory category)
            : base(g => g.Category == category && g.IsActive)
        {
            ApplyOrderBy(g => g.Name);
        }
    }
    
    /// <summary>
    /// Specification for retrieving popular games
    /// </summary>
    public class PopularGamesSpecification : BaseSpecification<Game>
    {
        public PopularGamesSpecification()
            : base(g => g.IsActive)
        {
            ApplyOrderByDescending(g => g.PopularityScore);
        }
    }
    
    /// <summary>
    /// Specification for retrieving new game releases
    /// </summary>
    public class NewReleaseGamesSpecification : BaseSpecification<Game>
    {
        public NewReleaseGamesSpecification()
            : base(g => g.IsActive)
        {
            ApplyOrderByDescending(g => g.ReleaseDate);
        }
    }
    
    /// <summary>
    /// Specification for searching games
    /// </summary>
    public class SearchGamesSpecification : BaseSpecification<Game>
    {
        public SearchGamesSpecification(string searchTerm)
            : base(g => g.IsActive &&
                      (g.Name.ToLower().Contains(searchTerm.ToLower()) ||
                       g.Provider.ToLower().Contains(searchTerm.ToLower()) ||
                       g.Description.ToLower().Contains(searchTerm.ToLower())))
        {
            ApplyOrderBy(g => g.Name);
        }
    }
    
    /// <summary>
    /// Specification for retrieving games by provider
    /// </summary>
    public class GamesByProviderSpecification : BaseSpecification<Game>
    {
        public GamesByProviderSpecification(string provider)
            : base(g => g.IsActive && g.Provider.ToLower() == provider.ToLower())
        {
            ApplyOrderBy(g => g.Name);
        }
    }
    
    /// <summary>
    /// Specification for retrieving games by RTP range
    /// </summary>
    public class GamesByRtpRangeSpecification : BaseSpecification<Game>
    {
        public GamesByRtpRangeSpecification(decimal minRtp, decimal maxRtp)
            : base(g => g.IsActive && g.RTP >= minRtp && g.RTP <= maxRtp)
        {
            ApplyOrderByDescending(g => g.RTP);
        }
    }
    
    /// <summary>
    /// In-memory specification for filtering games by device compatibility
    /// </summary>
    public class GamesByDeviceCompatibilitySpecification : BaseSpecification<Game>
    {
        private readonly string _deviceType;
        
        public GamesByDeviceCompatibilitySpecification(string deviceType)
            : base(g => g.IsActive)
        {
            _deviceType = deviceType;
            ApplyOrderBy(g => g.Name);
        }
        
        // This will be evaluated in memory after retrieving the base results
        public bool IsSatisfiedByDevice(Game game)
        {
            return game.CompatibleDevices != null && 
                  game.CompatibleDevices.Contains(_deviceType);
        }
    }
    
    /// <summary>
    /// In-memory specification for filtering games by feature
    /// </summary>
    public class GamesByFeatureSpecification : BaseSpecification<Game>
    {
        private readonly string _featureName;
        
        public GamesByFeatureSpecification(string featureName)
            : base(g => g.IsActive)
        {
            _featureName = featureName;
            ApplyOrderBy(g => g.Name);
        }
        
        // This will be evaluated in memory after retrieving the base results
        public bool IsSatisfiedByFeature(Game game)
        {
            return game.Features != null && 
                  game.Features.Contains(_featureName);
        }
    }
}