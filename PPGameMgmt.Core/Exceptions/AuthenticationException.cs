using System;

namespace PPGameMgmt.Core.Exceptions
{
    [Serializable]
    public class AuthenticationException : Exception
    {
        public string ErrorCode => "AUTHENTICATION_FAILED";

        public AuthenticationException(string message) : base(message)
        {
        }

        public AuthenticationException(string message, Exception innerException) : base(message, innerException)
        {
        }
    }
}