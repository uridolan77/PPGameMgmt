using System;
using System.Threading.Tasks;
using MediatR;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.CQRS.Events;

namespace PPGameMgmt.Infrastructure.CQRS
{
    public class DomainEventDispatcher : IDomainEventDispatcher
    {
        private readonly IMediator _mediator;
        private readonly ILogger<DomainEventDispatcher> _logger;

        public DomainEventDispatcher(IMediator mediator, ILogger<DomainEventDispatcher> logger)
        {
            _mediator = mediator ?? throw new ArgumentNullException(nameof(mediator));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task DispatchAsync<TEvent>(TEvent domainEvent) where TEvent : IDomainEvent
        {
            _logger.LogInformation($"Dispatching domain event {domainEvent.GetType().Name}");
            await _mediator.Publish(domainEvent);
        }
    }
}
