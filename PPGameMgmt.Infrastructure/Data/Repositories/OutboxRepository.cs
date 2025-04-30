using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces.Repositories;
using PPGameMgmt.Core.Specifications.OutboxSpecs;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    /// <summary>
    /// Repository implementation for OutboxMessage entity
    /// </summary>
    public class OutboxRepository : Repository<OutboxMessage>, IOutboxRepository
    {
        public OutboxRepository(CasinoDbContext context, ILogger<OutboxRepository>? logger = null)
            : base(context, logger)
        {
        }

        public async Task<IEnumerable<OutboxMessage>> GetUnprocessedMessagesAsync(int batchSize = 100)
        {
            var specification = new UnprocessedOutboxMessagesSpecification();
            var messages = await FindWithSpecificationAsync(specification);
            return messages.Take(batchSize);
        }

        public async Task<bool> MarkAsProcessedAsync(string messageId)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    var message = await _dbSet.FindAsync(messageId);
                    if (message == null)
                    {
                        return false;
                    }

                    message.MarkAsProcessed();
                    _context.Entry(message).State = EntityState.Modified;
                    await _context.SaveChangesAsync();
                    return true;
                },
                $"Error marking outbox message with ID: {messageId} as processed"
            );
        }

        public async Task<int> CleanupProcessedMessagesAsync(TimeSpan olderThan)
        {
            return await ExecuteRepositoryOperationAsync(
                async () => {
                    var cutoffDate = DateTime.UtcNow.Subtract(olderThan);
                    var specification = new ProcessedOutboxMessagesOlderThanSpecification(cutoffDate);
                    
                    var messagesToDelete = await FindWithSpecificationAsync(specification);
                    var messagesList = messagesToDelete.ToList();
                    
                    if (messagesList.Count == 0)
                    {
                        return 0;
                    }

                    _dbSet.RemoveRange(messagesList);
                    await _context.SaveChangesAsync();
                    return messagesList.Count;
                },
                "Error cleaning up processed outbox messages"
            );
        }

        // Legacy methods to support existing code
        public async Task AddMessageAsync(object message)
        {
            if (message is not OutboxMessage outboxMessage)
            {
                throw new ArgumentException("Message must be of type OutboxMessage", nameof(message));
            }

            await AddAsync(outboxMessage);
        }

        public async Task<IEnumerable<object>> GetPendingMessagesAsync(int batchSize)
        {
            var messages = await GetUnprocessedMessagesAsync(batchSize);
            return messages.Cast<object>().ToList();
        }

        public async Task MarkMessageAsProcessedAsync(Guid id)
        {
            await MarkAsProcessedAsync(id.ToString());
        }

        public async Task CleanupProcessedMessagesAsync(DateTime before)
        {
            var timeSpan = DateTime.UtcNow - before;
            await CleanupProcessedMessagesAsync(timeSpan);
        }
    }
}