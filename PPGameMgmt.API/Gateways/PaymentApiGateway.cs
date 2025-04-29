using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PPGameMgmt.API.Gateways.Configuration;
using PPGameMgmt.API.Models.Payment;

namespace PPGameMgmt.API.Gateways
{
    /// <summary>
    /// API Gateway for interacting with the payment service
    /// </summary>
    public class PaymentApiGateway : ApiGateway
    {
        private readonly ILogger<PaymentApiGateway> _logger;

        public PaymentApiGateway(
            HttpClient httpClient,
            IOptions<ApiGatewayOptions> options,
            ILogger<PaymentApiGateway> logger)
            : base(httpClient, options, logger)
        {
            _logger = logger;
        }

        /// <summary>
        /// Processes a payment transaction
        /// </summary>
        /// <param name="request">Payment request details</param>
        /// <returns>Payment response with transaction details</returns>
        public async Task<PaymentResponse> ProcessPaymentAsync(PaymentRequest request)
        {
            _logger.LogInformation("Processing payment for player {PlayerId}, amount: {Amount}", 
                request.PlayerId, request.Amount);
            
            try
            {
                return await PostAsync<PaymentRequest, PaymentResponse>(
                    "api/v1/payments/process", 
                    request,
                    FallbackForPaymentProcessing
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing payment for player {PlayerId}", request.PlayerId);
                throw;
            }
        }

        /// <summary>
        /// Retrieves payment history for a player
        /// </summary>
        /// <param name="playerId">Player ID to get history for</param>
        /// <param name="limit">Maximum number of transactions to retrieve</param>
        /// <returns>Collection of payment transactions</returns>
        public async Task<PaymentHistoryResponse> GetPaymentHistoryAsync(Guid playerId, int limit = 10)
        {
            _logger.LogInformation("Retrieving payment history for player {PlayerId}", playerId);
            
            try
            {
                return await GetAsync<PaymentHistoryResponse>(
                    $"api/v1/payments/history/{playerId}?limit={limit}",
                    () => FallbackForPaymentHistory(playerId)
                );
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error retrieving payment history for player {PlayerId}", playerId);
                throw;
            }
        }
        
        /// <summary>
        /// Fallback method when payment processing fails due to circuit breaker triggering
        /// </summary>
        private async Task<PaymentResponse> FallbackForPaymentProcessing()
        {
            _logger.LogWarning("Using fallback for payment processing due to circuit breaker");
            
            // Return a failure response with appropriate error
            return await Task.FromResult(new PaymentResponse
            {
                Success = false,
                TransactionId = Guid.Empty,
                ErrorMessage = "Payment service is currently unavailable. Please try again later.",
                ErrorCode = "SERVICE_UNAVAILABLE"
            });
        }
        
        /// <summary>
        /// Fallback method when payment history retrieval fails due to circuit breaker triggering
        /// </summary>
        private async Task<PaymentHistoryResponse> FallbackForPaymentHistory(Guid playerId)
        {
            _logger.LogWarning("Using fallback for payment history due to circuit breaker");
            
            // Return an empty history response with error
            return await Task.FromResult(new PaymentHistoryResponse
            {
                PlayerId = playerId,
                Transactions = Array.Empty<PaymentTransaction>(),
                ErrorMessage = "Payment history service is currently unavailable. Please try again later."
            });
        }
    }
}