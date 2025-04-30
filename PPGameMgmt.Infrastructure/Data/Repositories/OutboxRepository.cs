using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using PPGameMgmt.Core.Entities;
using PPGameMgmt.Core.Interfaces.Repositories;
using PPGameMgmt.Infrastructure.Data.Contexts;

namespace PPGameMgmt.Infrastructure.Data.Repositories
{
    /// <summary>
    /// Repository implementation for OutboxMessage entity
    /// </summary>
    public class OutboxRepository : Repository<OutboxMessage>, IOutboxRepository
    {
        private readonly new ILogger<OutboxRepository>? _logger;
        private const string _entityName = "OutboxMessage";

        public OutboxRepository(CasinoDbContext context, ILogger<OutboxRepository>? logger = null)
            : base(context, logger)
        {
            _logger = logger;
        }

        public override async Task DeleteAsync(Guid id)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Deleting outbox message with ID: {Id}", id);

                    var message = await _context.Set<OutboxMessage>().FindAsync(id.ToString());

                    if (message == null)
                    {
                        _logger?.LogWarning("Outbox message with ID: {Id} not found for deletion", id);
                        return false;
                    }

                    _context.Set<OutboxMessage>().Remove(message);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation("Deleted outbox message with ID: {Id}", id);

                    return true;
                },
                _entityName,
                $"Error deleting outbox message with ID: {id}",
                _logger
            );
        }

        public async Task DeleteAsync(string id)
        {
            await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Deleting outbox message with ID: {Id}", id);

                    var message = await _context.Set<OutboxMessage>().FindAsync(id);

                    if (message == null)
                    {
                        _logger?.LogWarning("Outbox message with ID: {Id} not found for deletion", id);
                        return false;
                    }

                    _context.Set<OutboxMessage>().Remove(message);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation("Deleted outbox message with ID: {Id}", id);

                    return true;
                },
                _entityName,
                $"Error deleting outbox message with ID: {id}",
                _logger
            );
        }

        public async Task<bool> ExistsAsync(string id)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Checking if outbox message with ID: {Id} exists", id);

                    var exists = await _context.Set<OutboxMessage>()
                        .AnyAsync(m => m.Id == id);

                    _logger?.LogInformation("Outbox message with ID: {Id} exists: {Exists}", id, exists);

                    return exists;
                },
                _entityName,
                $"Error checking if outbox message with ID: {id} exists",
                _logger
            );
        }

        public async Task<IEnumerable<OutboxMessage>> GetUnprocessedMessagesAsync(int batchSize = 100)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Getting {BatchSize} unprocessed outbox messages", batchSize);

                    var messages = await _context.Set<OutboxMessage>()
                        .Where(m => !m.IsProcessed)
                        .OrderBy(m => m.CreatedAt)
                        .Take(batchSize)
                        .ToListAsync();

                    _logger?.LogInformation("Retrieved {Count} unprocessed outbox messages", messages.Count);

                    return messages;
                },
                _entityName,
                "Error retrieving unprocessed outbox messages",
                _logger
            );
        }

        public async Task<bool> MarkAsProcessedAsync(string messageId)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    _logger?.LogInformation("Marking outbox message with ID: {MessageId} as processed", messageId);

                    var message = await _context.Set<OutboxMessage>().FindAsync(messageId);

                    if (message == null)
                    {
                        _logger?.LogWarning("Outbox message with ID: {MessageId} not found", messageId);
                        return false;
                    }

                    message.MarkAsProcessed();

                    _context.Set<OutboxMessage>().Update(message);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation("Marked outbox message with ID: {MessageId} as processed", messageId);

                    return true;
                },
                _entityName,
                $"Error marking outbox message with ID: {messageId} as processed",
                _logger
            );
        }

        public async Task<int> CleanupProcessedMessagesAsync(TimeSpan olderThan)
        {
            return await RepositoryExceptionHandler.ExecuteAsync(
                async () => {
                    var cutoffDate = DateTime.UtcNow.Subtract(olderThan);

                    _logger?.LogInformation("Cleaning up processed outbox messages older than {CutoffDate}", cutoffDate);

                    var messagesToDelete = await _context.Set<OutboxMessage>()
                        .Where(m => m.IsProcessed && m.ProcessedAt.HasValue && m.ProcessedAt.Value < cutoffDate)
                        .ToListAsync();

                    if (messagesToDelete.Count == 0)
                    {
                        _logger?.LogInformation("No processed outbox messages to clean up");
                        return 0;
                    }

                    _context.Set<OutboxMessage>().RemoveRange(messagesToDelete);
                    await _context.SaveChangesAsync();

                    _logger?.LogInformation("Cleaned up {Count} processed outbox messages", messagesToDelete.Count);

                    return messagesToDelete.Count;
                },
                _entityName,
                "Error cleaning up processed outbox messages",
                _logger
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