using System.Threading.Tasks;

namespace PPGameMgmt.Core.CQRS.Events
{
    public interface IDomainEventDispatcher
    {
        Task DispatchAsync<TEvent>(TEvent domainEvent) where TEvent : IDomainEvent;
    }
}
