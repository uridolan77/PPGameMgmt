using System;
using System.Text.Json;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Extensions
{
    /// <summary>
    /// Extension methods for the OutboxMessage class
    /// </summary>
    public static class OutboxMessageExtensions
    {
        /// <summary>
        /// Deserializes the Data property of an OutboxMessage into a strongly-typed object
        /// </summary>
        /// <typeparam name="T">The type to deserialize the data to</typeparam>
        /// <param name="message">The outbox message containing serialized data</param>
        /// <returns>The deserialized object</returns>
        public static T DeserializeData<T>(this OutboxMessage message) where T : class
        {
            if (message == null)
                throw new ArgumentNullException(nameof(message));
            
            if (string.IsNullOrEmpty(message.Data))
                throw new InvalidOperationException("OutboxMessage Data is null or empty");
            
            return JsonSerializer.Deserialize<T>(message.Data, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });
        }
    }
}