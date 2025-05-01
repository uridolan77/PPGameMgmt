using System;
using System.Linq;
using System.Collections.Generic;
using System.Linq.Expressions;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Specifications.GameSpecs
{
    public class GamesByTypeSpecification : BaseSpecification<Game>
    {
        public GamesByTypeSpecification(GameType type)
            : base(g => g.Type == type && g.IsActive)
        {
            ApplyOrderBy(g => g.Name);
        }
    }

    public class GamesByCategorySpecification : BaseSpecification<Game>
    {
        public GamesByCategorySpecification(GameCategory category)
            : base(g => g.Category == category && g.IsActive)
        {
            ApplyOrderBy(g => g.Name);
        }
    }

    public class PopularGamesSpecification : BaseSpecification<Game>
    {
        public PopularGamesSpecification()
            : base(g => g.IsActive && g.PopularityScore > 0)
        {
            ApplyOrderByDescending(g => g.PopularityScore);
        }
    }

    public class NewReleaseGamesSpecification : BaseSpecification<Game>
    {
        public NewReleaseGamesSpecification()
            : base(g => g.IsActive && g.ReleaseDate >= DateTime.UtcNow.AddDays(-30))
        {
            ApplyOrderByDescending(g => g.ReleaseDate);
        }
    }

    public class SearchGamesSpecification : BaseSpecification<Game>
    {
        public SearchGamesSpecification(string searchTerm)
            : base(g => g.IsActive && 
                (g.Name.Contains(searchTerm) || 
                g.Description.Contains(searchTerm) || 
                g.Provider.Contains(searchTerm)))
        {
            ApplyOrderBy(g => g.Name);
        }
    }

    public class GamesByProviderSpecification : BaseSpecification<Game>
    {
        public GamesByProviderSpecification(string provider)
            : base(g => g.IsActive && g.Provider == provider)
        {
            ApplyOrderBy(g => g.Name);
        }
    }

    public class GamesByRtpRangeSpecification : BaseSpecification<Game>
    {
        public GamesByRtpRangeSpecification(decimal minRtp, decimal maxRtp)
            : base(g => g.IsActive && g.RTP >= minRtp && g.RTP <= maxRtp)
        {
            ApplyOrderByDescending(g => g.RTP);
        }
    }

    public class GamesByDeviceCompatibilitySpecification : BaseSpecification<Game>
    {
        private readonly string _deviceType;

        public GamesByDeviceCompatibilitySpecification(string deviceType)
            : base(g => g.IsActive)
        {
            _deviceType = deviceType;
            ApplyOrderBy(g => g.Name);
        }

        public bool IsSatisfiedByDevice(Game game)
        {
            // This method is for in-memory filtering since array searching isn't well supported in EF Core
            return game.CompatibleDevices != null && 
                   game.CompatibleDevices.Contains(_deviceType, StringComparer.OrdinalIgnoreCase);
        }
    }

    public class GamesByFeatureSpecification : BaseSpecification<Game>
    {
        private readonly string _featureName;

        public GamesByFeatureSpecification(string featureName)
            : base(g => g.IsActive)
        {
            _featureName = featureName;
            ApplyOrderBy(g => g.Name);
        }

        public bool IsSatisfiedByFeature(Game game)
        {
            // This method is for in-memory filtering since array searching isn't well supported in EF Core
            return game.Features != null && 
                   game.Features.Contains(_featureName, StringComparer.OrdinalIgnoreCase);
        }
    }
}