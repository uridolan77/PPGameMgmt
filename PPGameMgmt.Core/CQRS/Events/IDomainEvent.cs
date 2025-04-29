using System;

namespace PPGameMgmt.Core.CQRS.Events
{
    public interface IDomainEvent
    {
        Guid Id { get; }
        DateTime OccurredOn { get; }
    }
}
