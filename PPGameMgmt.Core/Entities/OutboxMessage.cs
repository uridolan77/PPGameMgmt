using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace PPGameMgmt.Core.Entities
{
    /// <summary>
    /// Represents a message in the outbox for reliable messaging
    /// </summary>
    [Table("outbox_messages")]
    public class OutboxMessage
    {
        /// <summary>
        /// Unique identifier for the message
        /// </summary>
        [Column("id")]
        public required string Id { get; set; }

        /// <summary>
        /// Type of the event
        /// </summary>
        [Column("event_type")]
        public required string Type { get; set; }

        /// <summary>
        /// JSON serialized content of the event
        /// </summary>
        [Column("data")]
        public required string Data { get; set; }

        /// <summary>
        /// Time when the message was created
        /// </summary>
        [Column("created_at")]
        public DateTime CreatedAt { get; set; }

        /// <summary>
        /// Time when the message was processed
        /// </summary>
        [Column("processed_at")]
        public DateTime? ProcessedAt { get; set; }

        /// <summary>
        /// Indicates if the message has been processed
        /// </summary>
        [Column("is_processed")]
        public bool IsProcessed { get; set; }

        /// <summary>
        /// Number of processing attempts
        /// </summary>
        [Column("processing_attempts")]
        public int ProcessingAttempts { get; set; }

        /// <summary>
        /// Last error message if processing failed
        /// </summary>
        [Column("error")]
        public string? Error { get; set; }

        /// <summary>
        /// Marks the message as processed by setting the ProcessedAt timestamp to the current UTC time
        /// </summary>
        public void MarkAsProcessed()
        {
            ProcessedAt = DateTime.UtcNow;
            IsProcessed = true;
        }
    }
}