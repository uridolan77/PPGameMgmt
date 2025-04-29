using System;
using System.Net.Http;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPGameMgmt.API.Gateways.Configuration;
using PPGameMgmt.Infrastructure.Resilience;

namespace PPGameMgmt.API.Gateways
{
    /// <summary>
    /// Base API Gateway implementation that handles cross-cutting concerns for external API calls
    /// </summary>
    public class ApiGateway
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<ApiGateway> _logger;
        private readonly ApiGatewayOptions _options;
        private readonly CircuitBreaker _circuitBreaker;

        public ApiGateway(
            HttpClient httpClient,
            IOptions<ApiGatewayOptions> options,
            ILogger<ApiGateway> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
            _options = options?.Value ?? throw new ArgumentNullException(nameof(options));
            
            // Create a circuit breaker for this gateway
            _circuitBreaker = new CircuitBreaker(
                name: $"ApiGateway-{_options.Name}",
                failureThreshold: _options.CircuitBreaker?.FailureThreshold ?? 3,
                openStateTimeout: _options.CircuitBreaker?.OpenStateTimeout,
                logger: _logger
            );
            
            // Configure the HttpClient with base address and default headers
            if (!string.IsNullOrEmpty(_options.BaseUrl))
            {
                _httpClient.BaseAddress = new Uri(_options.BaseUrl);
            }

            // Add default headers if configured
            if (_options.DefaultHeaders != null)
            {
                foreach (var header in _options.DefaultHeaders)
                {
                    _httpClient.DefaultRequestHeaders.Add(header.Key, header.Value);
                }
            }
            
            // Configure timeout
            if (_options.TimeoutSeconds > 0)
            {
                _httpClient.Timeout = TimeSpan.FromSeconds(_options.TimeoutSeconds);
            }
        }
        
        /// <summary>
        /// Sends a GET request to the specified endpoint
        /// </summary>
        /// <typeparam name="T">The type to deserialize the response to</typeparam>
        /// <param name="endpoint">The endpoint to send the request to</param>
        /// <param name="fallback">Optional fallback function for circuit breaker failures</param>
        /// <returns>The deserialized response</returns>
        public async Task<T> GetAsync<T>(string endpoint, Func<Task<T>> fallback = null)
        {
            return await _circuitBreaker.ExecuteAsync(
                async () => await SendRequestAsync<T>(HttpMethod.Get, endpoint),
                fallback
            );
        }
        
        /// <summary>
        /// Sends a POST request to the specified endpoint
        /// </summary>
        /// <typeparam name="TRequest">The type of the request body</typeparam>
        /// <typeparam name="TResponse">The type to deserialize the response to</typeparam>
        /// <param name="endpoint">The endpoint to send the request to</param>
        /// <param name="request">The request body</param>
        /// <param name="fallback">Optional fallback function for circuit breaker failures</param>
        /// <returns>The deserialized response</returns>
        public async Task<TResponse> PostAsync<TRequest, TResponse>(
            string endpoint, 
            TRequest request, 
            Func<Task<TResponse>> fallback = null)
        {
            return await _circuitBreaker.ExecuteAsync(
                async () => await SendRequestAsync<TRequest, TResponse>(HttpMethod.Post, endpoint, request),
                fallback
            );
        }
        
        /// <summary>
        /// Sends a PUT request to the specified endpoint
        /// </summary>
        /// <typeparam name="TRequest">The type of the request body</typeparam>
        /// <typeparam name="TResponse">The type to deserialize the response to</typeparam>
        /// <param name="endpoint">The endpoint to send the request to</param>
        /// <param name="request">The request body</param>
        /// <param name="fallback">Optional fallback function for circuit breaker failures</param>
        /// <returns>The deserialized response</returns>
        public async Task<TResponse> PutAsync<TRequest, TResponse>(
            string endpoint, 
            TRequest request, 
            Func<Task<TResponse>> fallback = null)
        {
            return await _circuitBreaker.ExecuteAsync(
                async () => await SendRequestAsync<TRequest, TResponse>(HttpMethod.Put, endpoint, request),
                fallback
            );
        }
        
        /// <summary>
        /// Sends a DELETE request to the specified endpoint
        /// </summary>
        /// <typeparam name="T">The type to deserialize the response to</typeparam>
        /// <param name="endpoint">The endpoint to send the request to</param>
        /// <param name="fallback">Optional fallback function for circuit breaker failures</param>
        /// <returns>The deserialized response</returns>
        public async Task<T> DeleteAsync<T>(string endpoint, Func<Task<T>> fallback = null)
        {
            return await _circuitBreaker.ExecuteAsync(
                async () => await SendRequestAsync<T>(HttpMethod.Delete, endpoint),
                fallback
            );
        }

        private async Task<T> SendRequestAsync<T>(HttpMethod method, string endpoint)
        {
            var request = new HttpRequestMessage(method, endpoint);
            return await SendAndProcessRequestAsync<T>(request);
        }
        
        private async Task<TResponse> SendRequestAsync<TRequest, TResponse>(
            HttpMethod method, 
            string endpoint, 
            TRequest requestBody)
        {
            var request = new HttpRequestMessage(method, endpoint);
            
            // Serialize the request body
            var json = JsonSerializer.Serialize(requestBody, _options.JsonSerializerOptions);
            request.Content = new StringContent(json, Encoding.UTF8, "application/json");
            
            return await SendAndProcessRequestAsync<TResponse>(request);
        }
        
        private async Task<T> SendAndProcessRequestAsync<T>(HttpRequestMessage request)
        {
            try
            {
                _logger.LogInformation("Sending {Method} request to {Url}", 
                    request.Method, request.RequestUri);
                
                // Add correlation ID and other tracing headers
                AddTracingHeaders(request);
                
                // Send the request
                var response = await _httpClient.SendAsync(request);
                
                // Log the response status
                _logger.LogInformation("Received response with status {StatusCode} from {Url}",
                    response.StatusCode, request.RequestUri);
                
                // Ensure success status code or throw
                response.EnsureSuccessStatusCode();
                
                // Read and deserialize the response
                var content = await response.Content.ReadAsStringAsync();
                return JsonSerializer.Deserialize<T>(content, _options.JsonSerializerOptions);
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "HTTP request to {Url} failed: {Message}", 
                    request.RequestUri, ex.Message);
                throw;
            }
            catch (TaskCanceledException ex) when (ex.InnerException is TimeoutException)
            {
                _logger.LogError(ex, "Request to {Url} timed out", request.RequestUri);
                throw new TimeoutException($"Request to {request.RequestUri} timed out", ex);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing request to {Url}: {Message}", 
                    request.RequestUri, ex.Message);
                throw;
            }
        }
        
        private void AddTracingHeaders(HttpRequestMessage request)
        {
            // Generate a correlation ID if not already present
            if (!request.Headers.Contains("X-Correlation-ID"))
            {
                var correlationId = Guid.NewGuid().ToString();
                request.Headers.Add("X-Correlation-ID", correlationId);
            }
            
            // Add additional tracing headers like X-Request-Timestamp
            request.Headers.Add("X-Request-Timestamp", DateTimeOffset.UtcNow.ToString("o"));
        }
    }
}