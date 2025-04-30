using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Interfaces.Repositories
{
    /// <summary>
    /// Repository interface for outbox message persistence
    /// </summary>
    public interface IOutboxRepository : IRepository<OutboxMessage>
    {
        /// <summary>
        /// Gets unprocessed messages from the outbox
        /// </summary>
        /// <param name="batchSize">Maximum number of messages to retrieve</param>
        /// <returns>Collection of unprocessed outbox messages</returns>
        Task<IEnumerable<OutboxMessage>> GetUnprocessedMessagesAsync(int batchSize = 100);
        
        /// <summary>
        /// Marks a message as processed
        /// </summary>
        /// <param name="messageId">ID of the message to mark as processed</param>
        /// <returns>True if successful, false otherwise</returns>
        Task<bool> MarkAsProcessedAsync(string messageId);
        
        /// <summary>
        /// Cleans up processed messages older than the specified time
        /// </summary>
        /// <param name="olderThan">Age threshold for message cleanup</param>
        /// <returns>Number of messages cleaned up</returns>
        Task<int> CleanupProcessedMessagesAsync(TimeSpan olderThan);
    }
}
