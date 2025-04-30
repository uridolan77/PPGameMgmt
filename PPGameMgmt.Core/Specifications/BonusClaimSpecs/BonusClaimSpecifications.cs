using System;
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
}