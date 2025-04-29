using System;

namespace PPGameMgmt.Core.CQRS.Events.Bonuses
{
    public class BonusClaimedEvent : DomainEvent
    {
        public string PlayerId { get; set; }
        public string BonusId { get; set; }
        public DateTime ClaimedAt { get; set; }
    }
}
