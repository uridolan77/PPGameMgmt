using System;
using PPGameMgmt.Core.Entities;

namespace PPGameMgmt.Core.Specifications.OutboxSpecs
{
    /// <summary>
    /// Specification for retrieving unprocessed outbox messages
    /// </summary>
    public class UnprocessedOutboxMessagesSpecification : BaseSpecification<OutboxMessage>
    {
        public UnprocessedOutboxMessagesSpecification()
            : base(m => !m.IsProcessed)
        {
            ApplyOrderBy(m => m.CreatedAt);
        }
    }
    
    /// <summary>
    /// Specification for retrieving processed messages older than a specified date
    /// </summary>
    public class ProcessedOutboxMessagesOlderThanSpecification : BaseSpecification<OutboxMessage>
    {
        public ProcessedOutboxMessagesOlderThanSpecification(DateTime cutoffDate)
            : base(m => m.IsProcessed && m.ProcessedAt.HasValue && m.ProcessedAt.Value < cutoffDate)
        {
        }
    }
}