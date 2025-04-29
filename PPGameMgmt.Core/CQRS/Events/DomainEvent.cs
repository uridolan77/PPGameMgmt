using System;
using MediatR;

namespace PPGameMgmt.Core.CQRS.Events
{
    public abstract class DomainEvent : IDomainEvent, INotification
    {
        public Guid Id { get; }
        public DateTime OccurredOn { get; }

        protected DomainEvent()
        {
            Id = Guid.NewGuid();
            OccurredOn = DateTime.UtcNow;
        }
    }
}
