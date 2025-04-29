using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.CQRS.Events.Players
{
    public class PlayerSegmentChangedEvent : DomainEvent
    {
        public string PlayerId { get; set; }
        public PlayerSegment OldSegment { get; set; }
        public PlayerSegment NewSegment { get; set; }
    }
}
