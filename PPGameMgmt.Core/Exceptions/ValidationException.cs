using System;
using System.Collections.Generic;

namespace PPGameMgmt.Core.Exceptions
{
    /// <summary>
    /// Exception thrown when domain validation rules are violated
    /// </summary>
    [Serializable]
    public class ValidationException : DomainException
    {
        /// <summary>
        /// Gets the error code associated with this exception
        /// </summary>
        public override string ErrorCode => "VALIDATION_FAILED";

        /// <summary>
        /// Gets the validation errors associated with this exception
        /// </summary>
        public IDictionary<string, string[]> Errors { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="ValidationException"/> class
        /// </summary>
        public ValidationException() 
            : base("One or more validation failures have occurred.")
        {
            Errors = new Dictionary<string, string[]>();
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ValidationException"/> class with a specific message
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        public ValidationException(string message) 
            : base(message)
        {
            Errors = new Dictionary<string, string[]>();
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ValidationException"/> class with a specific message and errors
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        /// <param name="errors">The validation errors</param>
        public ValidationException(string message, IDictionary<string, string[]> errors) 
            : base(message)
        {
            Errors = errors ?? new Dictionary<string, string[]>();
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="ValidationException"/> class with a specific property and error
        /// </summary>
        /// <param name="propertyName">The name of the property that failed validation</param>
        /// <param name="errorMessage">The error message</param>
        public ValidationException(string propertyName, string errorMessage) 
            : base($"Validation failed: {propertyName} - {errorMessage}")
        {
            Errors = new Dictionary<string, string[]>
            {
                { propertyName, new[] { errorMessage } }
            };
        }
    }
}