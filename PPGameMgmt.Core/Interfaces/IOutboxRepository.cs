using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Interfaces
{
    /// <summary>
    /// Repository for managing outbox messages
    /// </summary>
    public interface IOutboxRepository
    {
        /// <summary>
        /// Gets all unprocessed outbox messages
        /// </summary>
        Task<IEnumerable<OutboxMessage>> GetUnprocessedMessagesAsync(int batchSize = 100);
        
        /// <summary>
        /// Adds a new outbox message
        /// </summary>
        Task AddAsync(OutboxMessage message);
        
        /// <summary>
        /// Marks a message as processed
        /// </summary>
        Task MarkAsProcessedAsync(Guid id);
        
        /// <summary>
        /// Removes messages that have been processed before the specified date
        /// </summary>
        Task CleanupProcessedMessagesAsync(DateTime before);
    }
}