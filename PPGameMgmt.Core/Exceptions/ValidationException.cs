using System;
using System.Collections.Generic;

namespace PPGameMgmt.Core.Exceptions
{
    [Serializable]
    public class ValidationException : Exception
    {
        public string ErrorCode => "VALIDATION_FAILED";
        public Dictionary<string, string> Errors { get; }

        public ValidationException(string field, string message) : base(message)
        {
            Errors = new Dictionary<string, string> { { field, message } };
        }

        public ValidationException(Dictionary<string, string> errors) : base("One or more validation errors occurred")
        {
            Errors = errors;
        }

        public ValidationException(string message, Exception innerException) : base(message, innerException)
        {
            Errors = new Dictionary<string, string>();
        }
    }
}