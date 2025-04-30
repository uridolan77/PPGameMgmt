using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces;
using PPGameMgmt.Core.Interfaces.Repositories;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    /// <summary>
    /// Adapter class that implements the old IOutboxRepository interface
    /// and delegates to the new IOutboxRepository implementation
    /// </summary>
    public class OutboxRepositoryAdapter : PPGameMgmt.Core.Interfaces.IOutboxRepository
    {
        private readonly PPGameMgmt.Core.Interfaces.Repositories.IOutboxRepository _repository;
        private readonly ILogger<OutboxRepositoryAdapter> _logger;

        public OutboxRepositoryAdapter(
            PPGameMgmt.Core.Interfaces.Repositories.IOutboxRepository repository,
            ILogger<OutboxRepositoryAdapter> logger)
        {
            _repository = repository ?? throw new ArgumentNullException(nameof(repository));
            _logger = logger ?? throw new ArgumentNullException(nameof(logger));
        }

        public async Task AddMessageAsync(object message)
        {
            if (message is OutboxMessage outboxMessage)
            {
                await _repository.AddAsync(outboxMessage);
            }
            else
            {
                _logger.LogWarning("Attempted to add a message of type {MessageType} which is not an OutboxMessage", 
                    message?.GetType().Name ?? "null");
                throw new ArgumentException("Message must be of type OutboxMessage", nameof(message));
            }
        }

        public async Task<IEnumerable<object>> GetPendingMessagesAsync(int batchSize)
        {
            var messages = await _repository.GetUnprocessedMessagesAsync(batchSize);
            return messages as IEnumerable<object>;
        }

        public async Task MarkMessageAsProcessedAsync(Guid id)
        {
            await _repository.MarkAsProcessedAsync(id.ToString());
        }

        public async Task<IEnumerable<object>> GetUnprocessedMessagesAsync(int batchSize)
        {
            var messages = await _repository.GetUnprocessedMessagesAsync(batchSize);
            return messages as IEnumerable<object>;
        }

        public async Task MarkAsProcessedAsync(string messageId)
        {
            await _repository.MarkAsProcessedAsync(messageId);
        }

        public async Task CleanupProcessedMessagesAsync(DateTime before)
        {
            var timeSpan = DateTime.UtcNow - before;
            await _repository.CleanupProcessedMessagesAsync(timeSpan);
        }
    }
}
