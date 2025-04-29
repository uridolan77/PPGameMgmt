using System;

namespace PPGameMgmt.Core.Exceptions
{
    /// <summary>
    /// Exception thrown when a business rule is violated
    /// </summary>
    [Serializable]
    public class BusinessRuleViolationException : DomainException
    {
        /// <summary>
        /// Gets the error code associated with this exception
        /// </summary>
        public override string ErrorCode => "BUSINESS_RULE_VIOLATION";

        /// <summary>
        /// Gets the name of the rule that was violated
        /// </summary>
        public string RuleName { get; }

        /// <summary>
        /// Initializes a new instance of the <see cref="BusinessRuleViolationException"/> class
        /// </summary>
        public BusinessRuleViolationException() 
            : base("A business rule was violated.")
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="BusinessRuleViolationException"/> class with a specific message
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        public BusinessRuleViolationException(string message) 
            : base(message)
        {
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="BusinessRuleViolationException"/> class with a specific ruleName and message
        /// </summary>
        /// <param name="ruleName">The name of the business rule that was violated</param>
        /// <param name="message">The message that describes the error</param>
        public BusinessRuleViolationException(string ruleName, string message) 
            : base(message)
        {
            RuleName = ruleName;
        }

        /// <summary>
        /// Initializes a new instance of the <see cref="BusinessRuleViolationException"/> class with a specific message and inner exception
        /// </summary>
        /// <param name="message">The message that describes the error</param>
        /// <param name="innerException">The exception that is the cause of the current exception</param>
        public BusinessRuleViolationException(string message, Exception innerException) 
            : base(message, innerException)
        {
        }
    }
}