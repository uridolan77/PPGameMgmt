using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.CQRS.Events;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Extensions; // Added for OutboxMessageExtensions

namespace PPGameMgmt.Infrastructure.Services
{
    /// <summary>
    /// Background service for processing outbox messages
    /// </summary>
    public class OutboxProcessor : BackgroundService
    {
        private readonly ILogger<OutboxProcessor> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly TimeSpan _processingInterval = TimeSpan.FromSeconds(10);
        private readonly TimeSpan _cleanupInterval = TimeSpan.FromHours(1);
        private DateTime _lastCleanup = DateTime.UtcNow;

        public OutboxProcessor(
            ILogger<OutboxProcessor> logger,
            IServiceProvider serviceProvider)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("Outbox processor starting");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ProcessOutboxMessagesAsync();

                    // Periodically clean up old messages
                    if (DateTime.UtcNow - _lastCleanup > _cleanupInterval)
                    {
                        await CleanupOldMessagesAsync();
                        _lastCleanup = DateTime.UtcNow;
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error processing outbox messages");
                }

                await Task.Delay(_processingInterval, stoppingToken);
            }

            _logger.LogInformation("Outbox processor stopping");
        }

        private async Task ProcessOutboxMessagesAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var outboxRepository = scope.ServiceProvider.GetRequiredService<IOutboxRepository>();
            var eventDispatcher = scope.ServiceProvider.GetRequiredService<IDomainEventDispatcher>();

            var messages = await outboxRepository.GetUnprocessedMessagesAsync(100);
            if (!messages.Any())
            {
                return;
            }

            _logger.LogInformation("Processing {Count} outbox messages", messages.Count());

            foreach (var messageObj in messages)
            {
                try
                {
                    // Use dynamic to access properties
                    dynamic message = messageObj;
                    string messageType = message.Type;
                    string messageId = message.Id;

                    // Get the event type
                    Type? eventType = Type.GetType(messageType);
                    if (eventType == null)
                    {
                        _logger.LogWarning($"Unknown event type: {messageType}");
                        await outboxRepository.MarkAsProcessedAsync(messageId);
                        continue;
                    }

                    // Create a generic DeserializeData method call with the correct type
                    var deserializeMethod = typeof(OutboxProcessor).GetMethod("DeserializeAndDispatchEvent");
                    if (deserializeMethod != null)
                    {
                        var genericMethod = deserializeMethod.MakeGenericMethod(eventType);
                        await (Task)genericMethod.Invoke(this, new object[] { messageObj, eventDispatcher })!;

                        // Mark the message as processed
                        await outboxRepository.MarkAsProcessedAsync(messageId);
                    }
                    else
                    {
                        _logger.LogError("Could not find DeserializeAndDispatchEvent method");
                    }
                }
                catch (Exception ex)
                {
                    // Use try-catch here to safely get the ID
                    string errorId = "unknown";
                    try 
                    {
                        dynamic msg = messageObj;
                        errorId = msg.Id;
                    }
                    catch {}
                    
                    _logger.LogError(ex, $"Error processing outbox message {errorId}");
                }
            }
        }

        public async Task DeserializeAndDispatchEvent<T>(object message, IDomainEventDispatcher eventDispatcher)
            where T : class, IDomainEvent
        {
            // Convert the object to OutboxMessage if possible, otherwise use dynamic
            if (message is OutboxMessage typedMessage)
            {
                var @event = typedMessage.DeserializeData<T>();
                await eventDispatcher.DispatchAsync(@event);
                _logger.LogInformation($"Dispatched event {typeof(T).Name} from outbox message {typedMessage.Id}");
            }
            else
            {
                dynamic dynamicMessage = message;
                string id = dynamicMessage.Id;
                var @event = dynamicMessage.DeserializeData<T>();
                await eventDispatcher.DispatchAsync(@event);
                _logger.LogInformation($"Dispatched event {typeof(T).Name} from outbox message {id}");
            }
        }

        private async Task CleanupOldMessagesAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var outboxRepository = scope.ServiceProvider.GetRequiredService<IOutboxRepository>();

            // Remove messages older than 7 days
            var cutoff = DateTime.UtcNow.AddDays(-7);

            _logger.LogInformation($"Cleaning up processed outbox messages before {cutoff:yyyy-MM-dd}");
            await outboxRepository.CleanupProcessedMessagesAsync(cutoff);
        }
    }
}