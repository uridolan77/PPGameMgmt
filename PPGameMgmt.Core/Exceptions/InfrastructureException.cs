using System;

namespace PPGameMgmt.Core.Exceptions
{
    /// <summary>
    /// Exception thrown when an infrastructure error occurs (database, cache, external service, etc.)
    /// </summary>
    [Serializable]
    public class InfrastructureException : DomainException
    {
        /// <summary>
        /// Gets the error code associated with this exception
        /// </summary>
        public override string ErrorCode => "INFRASTRUCTURE_ERROR";

        /// <summary>
        /// Gets the component that threw the exception
        /// </summary>
        public string Component { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="InfrastructureException"/> class
        /// </summary>
        public InfrastructureException() 
            : base("An infrastructure error has occurred.")
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="InfrastructureException"/> class with a specific message
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        public InfrastructureException(string message) 
            : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="InfrastructureException"/> class with a specific component and message
        /// </summary>
        /// <param name="component">The component that threw the exception (e.g., "Database", "Redis", "ExternalApi")</param>
        /// <param name="message">The message that describes the error</param>
        public InfrastructureException(string component, string message) 
            : base($"{component} error: {message}")
        {
            Component = component;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="InfrastructureException"/> class with a specific message and inner exception
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        /// <param name="innerException">The exception that is the cause of the current exception</param>
        public InfrastructureException(string message, Exception innerException) 
            : base(message, innerException)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="InfrastructureException"/> class with a specific component, message and inner exception
        /// </summary>
        /// <param name="component">The component that threw the exception</param>
        /// <param name="message">The message that describes the error</param>
        /// <param name="innerException">The exception that is the cause of the current exception</param>
        public InfrastructureException(string component, string message, Exception innerException) 
            : base($"{component} error: {message}", innerException)
        {
            Component = component;
        }
    }
}