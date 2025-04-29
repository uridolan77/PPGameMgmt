using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace PPGameMgmt.Infrastructure.Resilience
{
    /// <summary>
    /// Circuit state for the circuit breaker
    /// </summary>
    public enum CircuitState
    {
        Closed,
        Open,
        HalfOpen
    }

    /// <summary>
    /// Implementation of the Circuit Breaker pattern for resilient external service calls
    /// </summary>
    public class CircuitBreaker
    {
        private readonly ILogger _logger;
        private readonly string _name;
        private readonly int _failureThreshold;
        private readonly TimeSpan _openStateTimeout;
        private readonly object _stateLock = new object();

        private CircuitState _state = CircuitState.Closed;
        private int _failureCount;
        private DateTime _lastStateChange = DateTime.UtcNow;
        private DateTime _lastFailure;
        private Exception _lastException;

        /// <summary>
        /// Creates a new Circuit Breaker
        /// </summary>
        /// <param name="name">Name of the circuit breaker for logging</param>
        /// <param name="failureThreshold">Number of failures before circuit opens</param>
        /// <param name="openStateTimeout">Duration to keep the circuit open before trying again</param>
        /// <param name="logger">Optional logger</param>
        public CircuitBreaker(
            string name,
            int failureThreshold = 3,
            TimeSpan? openStateTimeout = null,
            ILogger logger = null)
        {
            _name = name ?? throw new ArgumentNullException(nameof(name));
            _failureThreshold = failureThreshold > 0 ? failureThreshold : throw new ArgumentOutOfRangeException(nameof(failureThreshold));
            _openStateTimeout = openStateTimeout ?? TimeSpan.FromSeconds(30);
            _logger = logger;
        }

        /// <summary>
        /// Gets the current state of the circuit
        /// </summary>
        public CircuitState State
        {
            get
            {
                UpdateCircuitState();
                return _state;
            }
        }

        /// <summary>
        /// Gets the last exception that occurred
        /// </summary>
        public Exception LastException => _lastException;

        /// <summary>
        /// Executes an action through the circuit breaker
        /// </summary>
        /// <typeparam name="T">Return type</typeparam>
        /// <param name="action">Action to execute</param>
        /// <param name="fallback">Optional fallback action if circuit is open</param>
        /// <returns>Result of the action or fallback</returns>
        public T Execute<T>(Func<T> action, Func<T> fallback = null)
        {
            UpdateCircuitState();

            if (_state == CircuitState.Open)
            {
                _logger?.LogWarning("Circuit {CircuitName} is open, bypassing call", _name);
                if (fallback != null)
                {
                    return fallback();
                }
                throw new CircuitBreakerOpenException($"Circuit {_name} is open", _lastException);
            }

            try
            {
                var result = action();
                HandleSuccess();
                return result;
            }
            catch (Exception ex)
            {
                return HandleFailure(ex, fallback);
            }
        }

        /// <summary>
        /// Executes an async action through the circuit breaker
        /// </summary>
        /// <typeparam name="T">Return type</typeparam>
        /// <param name="action">Async action to execute</param>
        /// <param name="fallback">Optional fallback async action if circuit is open</param>
        /// <returns>Result of the action or fallback</returns>
        public async Task<T> ExecuteAsync<T>(Func<Task<T>> action, Func<Task<T>> fallback = null)
        {
            UpdateCircuitState();

            if (_state == CircuitState.Open)
            {
                _logger?.LogWarning("Circuit {CircuitName} is open, bypassing call", _name);
                if (fallback != null)
                {
                    return await fallback();
                }
                throw new CircuitBreakerOpenException($"Circuit {_name} is open", _lastException);
            }

            try
            {
                var result = await action();
                HandleSuccess();
                return result;
            }
            catch (Exception ex)
            {
                return await HandleFailureAsync(ex, fallback);
            }
        }

        /// <summary>
        /// Resets the circuit breaker to closed state
        /// </summary>
        public void Reset()
        {
            lock (_stateLock)
            {
                _failureCount = 0;
                _state = CircuitState.Closed;
                _lastStateChange = DateTime.UtcNow;
                _logger?.LogInformation("Circuit {CircuitName} manually reset to Closed", _name);
            }
        }

        private void UpdateCircuitState()
        {
            lock (_stateLock)
            {
                // If circuit is open and timeout has elapsed, transition to half-open
                if (_state == CircuitState.Open && DateTime.UtcNow - _lastStateChange > _openStateTimeout)
                {
                    _state = CircuitState.HalfOpen;
                    _lastStateChange = DateTime.UtcNow;
                    _logger?.LogInformation("Circuit {CircuitName} state changed from Open to HalfOpen", _name);
                }
            }
        }

        private void HandleSuccess()
        {
            lock (_stateLock)
            {
                if (_state == CircuitState.HalfOpen)
                {
                    _state = CircuitState.Closed;
                    _failureCount = 0;
                    _lastStateChange = DateTime.UtcNow;
                    _logger?.LogInformation("Circuit {CircuitName} state changed from HalfOpen to Closed after successful call", _name);
                }
                else if (_state == CircuitState.Closed)
                {
                    _failureCount = 0;
                }
            }
        }

        private T HandleFailure<T>(Exception ex, Func<T> fallback)
        {
            lock (_stateLock)
            {
                _lastException = ex;
                _lastFailure = DateTime.UtcNow;

                if (_state == CircuitState.HalfOpen)
                {
                    _state = CircuitState.Open;
                    _lastStateChange = DateTime.UtcNow;
                    _logger?.LogWarning(ex, "Circuit {CircuitName} state changed from HalfOpen to Open after failed call", _name);
                }
                else if (_state == CircuitState.Closed)
                {
                    _failureCount++;
                    if (_failureCount >= _failureThreshold)
                    {
                        _state = CircuitState.Open;
                        _lastStateChange = DateTime.UtcNow;
                        _logger?.LogWarning(ex, "Circuit {CircuitName} state changed from Closed to Open after {FailureCount} failures", _name, _failureCount);
                    }
                }
            }

            if (fallback != null)
            {
                return fallback();
            }
            throw ex;
        }

        private async Task<T> HandleFailureAsync<T>(Exception ex, Func<Task<T>> fallback)
        {
            lock (_stateLock)
            {
                _lastException = ex;
                _lastFailure = DateTime.UtcNow;

                if (_state == CircuitState.HalfOpen)
                {
                    _state = CircuitState.Open;
                    _lastStateChange = DateTime.UtcNow;
                    _logger?.LogWarning(ex, "Circuit {CircuitName} state changed from HalfOpen to Open after failed call", _name);
                }
                else if (_state == CircuitState.Closed)
                {
                    _failureCount++;
                    if (_failureCount >= _failureThreshold)
                    {
                        _state = CircuitState.Open;
                        _lastStateChange = DateTime.UtcNow;
                        _logger?.LogWarning(ex, "Circuit {CircuitName} state changed from Closed to Open after {FailureCount} failures", _name, _failureCount);
                    }
                }
            }

            if (fallback != null)
            {
                return await fallback();
            }
            throw ex;
        }
    }

    /// <summary>
    /// Exception thrown when a circuit breaker is open
    /// </summary>
    public class CircuitBreakerOpenException : Exception
    {
        public CircuitBreakerOpenException(string message, Exception innerException = null)
            : base(message, innerException)
        {
        }
    }
}