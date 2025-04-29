using System;

namespace PPGameMgmt.Core.Entities
{
    /// <summary>
    /// Represents a message in the outbox for reliable messaging
    /// </summary>
    public class OutboxMessage
    {
        public Guid Id { get; set; }
        public string? Type { get; set; }
        public string? Data { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }
        public string? Error { get; set; }
        
        /// <summary>
        /// Marks the message as processed by setting the ProcessedAt timestamp to the current UTC time
        /// </summary>
        public void MarkAsProcessed()
        {
            ProcessedAt = DateTime.UtcNow;
        }
    }
}