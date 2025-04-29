using System;

namespace PPGameMgmt.Core.Exceptions
{
    /// <summary>
    /// Base exception for all domain-specific exceptions in the application
    /// </summary>
    [Serializable]
    public class DomainException : Exception
    {
        /// <summary>
        /// Gets the error code associated with this exception
        /// </summary>
        public virtual string ErrorCode { get; } = "DOMAIN_ERROR";

        /// <summary>
        /// Initializes a new instance of the <see cref="DomainException"/> class
        /// </summary>
        public DomainException() : base("A domain error has occurred.")
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DomainException"/> class with a specific message
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        public DomainException(string message) : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="DomainException"/> class with a specific message and inner exception
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        /// <param name="innerException">The exception that is the cause of the current exception</param>
        public DomainException(string message, Exception innerException) : base(message, innerException)
        {
        }
        
        /// <summary>
        /// Initializes a new instance of the <see cref="DomainException"/> class with a specific message and error code
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        /// <param name="errorCode">The error code</param>
        protected DomainException(string message, string errorCode) : base(message)
        {
            ErrorCode = errorCode;
        }
    }
}