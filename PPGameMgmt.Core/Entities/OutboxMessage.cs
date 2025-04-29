using System;
using System.Text.Json;

namespace PPGameMgmt.Core.Entities
{
    /// <summary>
    /// Represents a message in the Outbox for reliable event processing
    /// </summary>
    public class OutboxMessage
    {
        public Guid Id { get; set; }
        public string Type { get; set; }
        public string Data { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ProcessedAt { get; set; }

        /// <summary>
        /// Creates a new outbox message for the specified event
        /// </summary>
        /// <typeparam name="T">The type of the event</typeparam>
        /// <param name="event">The event instance</param>
        /// <returns>An OutboxMessage containing serialized event data</returns>
        public static OutboxMessage CreateFrom<T>(T @event) where T : class
        {
            return new OutboxMessage
            {
                Id = Guid.NewGuid(),
                Type = typeof(T).FullName,
                Data = JsonSerializer.Serialize(@event),
                CreatedAt = DateTime.UtcNow,
                ProcessedAt = null
            };
        }

        /// <summary>
        /// Deserializes the message data to the specified type
        /// </summary>
        /// <typeparam name="T">The type to deserialize to</typeparam>
        /// <returns>The deserialized object</returns>
        public T DeserializeData<T>() where T : class
        {
            return JsonSerializer.Deserialize<T>(Data);
        }

        /// <summary>
        /// Marks the message as processed
        /// </summary>
        public void MarkAsProcessed()
        {
            ProcessedAt = DateTime.UtcNow;
        }
    }
}