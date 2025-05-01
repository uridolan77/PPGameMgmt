using System;
using System.Linq.Expressions;
using PPGameMgmt.Core.Entities.Bonuses;

namespace PPGameMgmt.Core.Specifications.BonusClaimSpecs
{
    /// <summary>
    /// Specification for retrieving active bonus claims by player ID
    /// </summary>
    public class ActiveBonusClaimsByPlayerSpecification : BaseSpecification<BonusClaim>
    {
        public ActiveBonusClaimsByPlayerSpecification(string playerId)
            : base(bc => bc.PlayerId == playerId && bc.Status == BonusClaimStatus.Active)
        {
            ApplyOrderByDescending(bc => bc.ClaimDate);
        }
    }
    
    /// <summary>
    /// Specification for retrieving bonus claims by bonus ID
    /// </summary>
    public class BonusClaimsByBonusIdSpecification : BaseSpecification<BonusClaim>
    {
        public BonusClaimsByBonusIdSpecification(string bonusId)
            : base(bc => bc.BonusId == bonusId)
        {
            ApplyOrderByDescending(bc => bc.ClaimDate);
        }
    }
    
    /// <summary>
    /// Specification for retrieving all bonus claims by player ID
    /// </summary>
    public class BonusClaimsByPlayerIdSpecification : BaseSpecification<BonusClaim>
    {
        public BonusClaimsByPlayerIdSpecification(string playerId)
            : base(bc => bc.PlayerId == playerId)
        {
            ApplyOrderByDescending(bc => bc.ClaimDate);
        }
    }
    
    /// <summary>
    /// Specification for retrieving bonus claims by status
    /// </summary>
    public class BonusClaimsByStatusSpecification : BaseSpecification<BonusClaim>
    {
        public BonusClaimsByStatusSpecification(BonusClaimStatus status)
            : base(bc => bc.Status == status)
        {
            ApplyOrderByDescending(bc => bc.ClaimDate);
        }
    }
    
    /// <summary>
    /// Specification for retrieving recent bonus claims by player ID
    /// </summary>
    public class RecentBonusClaimsByPlayerIdSpecification : BaseSpecification<BonusClaim>
    {
        public RecentBonusClaimsByPlayerIdSpecification(string playerId, int daysToLookBack)
            : base(bc => bc.PlayerId == playerId && 
                         bc.ClaimDate >= DateTime.UtcNow.AddDays(-daysToLookBack))
        {
            ApplyOrderByDescending(bc => bc.ClaimDate);
        }
    }

    public class ActiveBonusClaimsSpecification : BaseSpecification<BonusClaim>
    {
        public ActiveBonusClaimsSpecification()
            : base(bc => bc.Status == BonusClaimStatus.Active && bc.ExpiryDate > DateTime.UtcNow)
        {
            AddInclude(bc => bc.Bonus);
            AddInclude(bc => bc.Player);
            ApplyOrderByDescending(bc => bc.ClaimDate);
        }
    }

    public class PlayerBonusClaimsSpecification : BaseSpecification<BonusClaim>
    {
        public PlayerBonusClaimsSpecification(string playerId)
            : base(bc => bc.PlayerId == playerId)
        {
            AddInclude(bc => bc.Bonus);
            ApplyOrderByDescending(bc => bc.ClaimDate);
        }
    }

    public class BonusClaimsByTypeSpecification : BaseSpecification<BonusClaim>
    {
        public BonusClaimsByTypeSpecification(BonusType type)
            : base(bc => bc.Bonus.Type == type)
        {
            AddInclude(bc => bc.Bonus);
            AddInclude(bc => bc.Player);
            ApplyOrderByDescending(bc => bc.ClaimDate);
        }
    }

    public class CompletedBonusClaimsSpecification : BaseSpecification<BonusClaim>
    {
        public CompletedBonusClaimsSpecification()
            : base(bc => bc.Status == BonusClaimStatus.Completed)
        {
            AddInclude(bc => bc.Bonus);
            AddInclude(bc => bc.Player);
            ApplyOrderByDescending(bc => bc.CompletionDate);
        }
    }

    public class ExpiredBonusClaimsSpecification : BaseSpecification<BonusClaim>
    {
        public ExpiredBonusClaimsSpecification()
            : base(bc => bc.Status == BonusClaimStatus.Expired || (bc.Status == BonusClaimStatus.Active && bc.ExpiryDate <= DateTime.UtcNow))
        {
            AddInclude(bc => bc.Bonus);
            AddInclude(bc => bc.Player);
            ApplyOrderByDescending(bc => bc.ExpiryDate);
        }
    }
}