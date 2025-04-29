using System;

namespace PPGameMgmt.Core.Exceptions
{
    /// <summary>
    /// Exception thrown when an entity is not found in the data store
    /// </summary>
    [Serializable]
    public class EntityNotFoundException : DomainException
    {
        /// <summary>
        /// Gets the error code associated with this exception
        /// </summary>
        public override string ErrorCode => "ENTITY_NOT_FOUND";

        /// <summary>
        /// Gets the name of the entity type that was not found
        /// </summary>
        public string EntityName { get; }

        /// <summary>
        /// Gets the identifier used to search for the entity
        /// </summary>
        public string Id { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="EntityNotFoundException"/> class
        /// </summary>
        /// <param name="entityName">The name of the entity type</param>
        /// <param name="id">The identifier used to search for the entity</param>
        public EntityNotFoundException(string entityName, string id)
            : base($"{entityName} with ID {id} not found")
        {
            EntityName = entityName;
            Id = id;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EntityNotFoundException"/> class with a specific message
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        public EntityNotFoundException(string message) : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="EntityNotFoundException"/> class with a specific message and inner exception
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        /// <param name="innerException">The exception that is the cause of the current exception</param>
        public EntityNotFoundException(string message, Exception innerException) 
            : base(message, innerException)
        {
        }
    }
}