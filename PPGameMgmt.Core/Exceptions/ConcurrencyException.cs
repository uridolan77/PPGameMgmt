using System;

namespace PPGameMgmt.Core.Exceptions
{
    /// <summary>
    /// Exception thrown when a concurrency conflict occurs during data operations
    /// </summary>
    [Serializable]
    public class ConcurrencyException : DomainException
    {
        /// <summary>
        /// Gets the error code associated with this exception
        /// </summary>
        public override string ErrorCode => "CONCURRENCY_CONFLICT";

        /// <summary>
        /// Gets the entity type involved in the concurrency conflict
        /// </summary>
        public string EntityName { get; }

        /// <summary>
        /// Gets the identifier of the entity involved in the concurrency conflict
        /// </summary>
        public string EntityId { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="ConcurrencyException"/> class
        /// </summary>
        public ConcurrencyException() 
            : base("A concurrency conflict occurred. The operation was aborted.")
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ConcurrencyException"/> class with a specific message
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        public ConcurrencyException(string message) 
            : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ConcurrencyException"/> class with entity details
        /// </summary>
        /// <param name="entityName">The name of the entity type involved in the conflict</param>
        /// <param name="entityId">The identifier of the entity involved in the conflict</param>
        public ConcurrencyException(string entityName, string entityId) 
            : base($"A concurrency conflict occurred with {entityName} ID {entityId}. The data may have been modified by another user.")
        {
            EntityName = entityName;
            EntityId = entityId;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ConcurrencyException"/> class with entity details and logger info
        /// </summary>
        /// <param name="entityName">The name of the entity type involved in the conflict</param>
        /// <param name="entityId">The identifier of the entity involved in the conflict</param>
        /// <param name="details">Additional details about the concurrency conflict</param>
        public ConcurrencyException(string entityName, string entityId, string details) 
            : base($"A concurrency conflict occurred with {entityName} ID {entityId}. {details}")
        {
            EntityName = entityName;
            EntityId = entityId;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ConcurrencyException"/> class with a specific message and inner exception
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        /// <param name="innerException">The exception that is the cause of the current exception</param>
        public ConcurrencyException(string message, Exception innerException) 
            : base(message, innerException)
        {
        }
    }
}