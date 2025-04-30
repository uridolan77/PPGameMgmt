using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Interface for outbox repository (for outbox pattern)
    /// </summary>
    public interface IOutboxRepository
    {
        Task AddMessageAsync(object message);
        Task<IEnumerable<object>> GetPendingMessagesAsync(int batchSize);
        Task MarkMessageAsProcessedAsync(Guid id);
        Task<IEnumerable<object>> GetUnprocessedMessagesAsync(int batchSize);
        Task MarkAsProcessedAsync(string messageId);
        Task CleanupProcessedMessagesAsync(DateTime before);
    }
}