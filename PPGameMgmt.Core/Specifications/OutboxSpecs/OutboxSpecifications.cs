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
            : base(m => !m.ProcessedAt.HasValue)
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

    public class OutboxMessagesByTypeSpecification : BaseSpecification<OutboxMessage>
    {
        public OutboxMessagesByTypeSpecification(string type)
            : base(m => m.Type == type)
        {
            ApplyOrderByDescending(m => m.CreatedAt);
        }
    }

    public class OutboxMessagesByDateRangeSpecification : BaseSpecification<OutboxMessage>
    {
        public OutboxMessagesByDateRangeSpecification(DateTime startDate, DateTime endDate)
            : base(m => m.CreatedAt >= startDate && m.CreatedAt <= endDate)
        {
            ApplyOrderByDescending(m => m.CreatedAt);
        }
    }
}