using System.Collections.Generic;

namespace PPGameMgmt.API.Models.Responses
{
    public class ApiResponse
    {
        public bool Success { get; set; } = true;
        public string Message { get; set; }
        public Dictionary<string, string> Errors { get; set; }
    }

    public class ApiResponse<T> : ApiResponse
    {
        public T Data { get; set; }

        public ApiResponse() { }

        public ApiResponse(T data)
        {
            Data = data;
        }
    }
}