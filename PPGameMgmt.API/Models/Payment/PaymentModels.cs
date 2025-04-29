using System;
using System.Collections.Generic;

namespace PPGameMgmt.API.Models.Payment
{
    /// <summary>
    /// Payment request model to process a payment transaction
    /// </summary>
    public class PaymentRequest
    {
        /// <summary>
        /// ID of the player making the payment
        /// </summary>
        public Guid PlayerId { get; set; }
        
        /// <summary>
        /// Amount to process
        /// </summary>
        public decimal Amount { get; set; }
        
        /// <summary>
        /// Payment method (e.g. "credit_card", "paypal", "apple_pay", etc.)
        /// </summary>
        public string PaymentMethod { get; set; }
        
        /// <summary>
        /// Payment provider-specific data
        /// </summary>
        public string PaymentData { get; set; }
        
        /// <summary>
        /// Currency code (ISO 4217)
        /// </summary>
        public string CurrencyCode { get; set; }

        /// <summary>
        /// Whether this is a deposit or withdrawal
        /// </summary>
        public PaymentType Type { get; set; }
        
        /// <summary>
        /// Optional metadata about the payment
        /// </summary>
        public Dictionary<string, string> Metadata { get; set; }
    }
    
    /// <summary>
    /// Payment response model from processing a transaction
    /// </summary>
    public class PaymentResponse
    {
        /// <summary>
        /// Whether the payment was successfully processed
        /// </summary>
        public bool Success { get; set; }
        
        /// <summary>
        /// ID of the transaction
        /// </summary>
        public Guid TransactionId { get; set; }
        
        /// <summary>
        /// Error message if the payment failed
        /// </summary>
        public string ErrorMessage { get; set; }
        
        /// <summary>
        /// Error code if the payment failed
        /// </summary>
        public string ErrorCode { get; set; }
        
        /// <summary>
        /// Timestamp when the payment was processed
        /// </summary>
        public DateTime ProcessedAt { get; set; }
        
        /// <summary>
        /// Provider-specific transaction reference
        /// </summary>
        public string ProviderReference { get; set; }
    }
    
    /// <summary>
    /// Response containing payment transaction history for a player
    /// </summary>
    public class PaymentHistoryResponse
    {
        /// <summary>
        /// ID of the player 
        /// </summary>
        public Guid PlayerId { get; set; }
        
        /// <summary>
        /// List of payment transactions
        /// </summary>
        public IEnumerable<PaymentTransaction> Transactions { get; set; }
        
        /// <summary>
        /// Error message if there was an issue retrieving history
        /// </summary>
        public string ErrorMessage { get; set; }
    }
    
    /// <summary>
    /// Represents a payment transaction
    /// </summary>
    public class PaymentTransaction
    {
        /// <summary>
        /// ID of the transaction
        /// </summary>
        public Guid TransactionId { get; set; }
        
        /// <summary>
        /// Type of payment (deposit or withdrawal)
        /// </summary>
        public PaymentType Type { get; set; }
        
        /// <summary>
        /// Status of the transaction
        /// </summary>
        public PaymentStatus Status { get; set; }
        
        /// <summary>
        /// Amount of the transaction
        /// </summary>
        public decimal Amount { get; set; }
        
        /// <summary>
        /// Currency of the transaction
        /// </summary>
        public string Currency { get; set; }
        
        /// <summary>
        /// Payment method used
        /// </summary>
        public string PaymentMethod { get; set; }
        
        /// <summary>
        /// When the transaction was initiated
        /// </summary>
        public DateTime CreatedAt { get; set; }
        
        /// <summary>
        /// When the transaction was completed
        /// </summary>
        public DateTime? CompletedAt { get; set; }
    }
    
    /// <summary>
    /// Type of payment transaction
    /// </summary>
    public enum PaymentType
    {
        Deposit,
        Withdrawal
    }
    
    /// <summary>
    /// Status of a payment transaction
    /// </summary>
    public enum PaymentStatus
    {
        Pending,
        Completed,
        Failed,
        Reversed,
        Refunded
    }
}